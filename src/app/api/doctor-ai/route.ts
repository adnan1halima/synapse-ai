export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const CF_ACCOUNT = process.env.CF_ACCOUNT_ID;
const CF_TOKEN = process.env.CF_API_TOKEN;
const CF_MODEL = process.env.CF_MODEL ?? "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const OLLAMA_BASE = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

const SYSTEM =
  "You are an expert medical assistant. Always reply ONLY in Modern Standard Arabic. " +
  "Never use Chinese, English, or any other language or characters. " +
  "Use the previous conversation to understand pronouns such as أسبابه and علاجه. " +
  "Answer directly with 3 to 5 short bullet points, each on its own line starting with '- '. " +
  "Mention seeing a doctor only once at the end, if needed.";

type Msg = { role: string; content: string };

function cleanText(text: string) {
  return text.replace(/[\u3000-\u9FFF\uAC00-\uD7AF\uFF00-\uFFEF]/g, "");
}

export async function POST(req: Request) {
  let messages: Msg[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body.messages)) {
      messages = body.messages
        .filter((m: Msg) => m && m.content && ["user", "assistant"].includes(m.role))
        .slice(-6);
    } else if (body.prompt) {
      messages = [{ role: "user", content: String(body.prompt) }];
    }
  } catch {
    return new Response("طلب غير صالح", { status: 400 });
  }
  if (messages.length === 0) {
    return new Response("السؤال مطلوب", { status: 400 });
  }

  const useCloud = Boolean(CF_ACCOUNT) && Boolean(CF_TOKEN);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 28000);
  const full = [{ role: "system", content: SYSTEM }, ...messages];

  try {
    const upstream = useCloud
      ? await fetch(
          "https://api.cloudflare.com/client/v4/accounts/" +
            CF_ACCOUNT +
            "/ai/run/" +
            CF_MODEL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + CF_TOKEN,
            },
            body: JSON.stringify({
              messages: full,
              stream: true,
              max_tokens: 400,
              temperature: 0.2,
            }),
            signal: controller.signal,
          }
        )
      : await fetch(OLLAMA_BASE + "/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: full,
            stream: true,
            keep_alive: "60m",
            options: { num_predict: 160, temperature: 0.15, num_ctx: 2048 },
          }),
          signal: controller.signal,
        });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      throw new Error("AI provider " + upstream.status + " " + detail.slice(0, 200));
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    const stream = new ReadableStream({
      async pull(ctrl) {
        const { done, value } = await reader.read();
        if (done) {
          clearTimeout(timer);
          ctrl.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const raw of lines) {
          const line = raw.trim();
          if (!line) continue;
          try {
            let text: string | undefined;
            if (useCloud) {
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (payload === "[DONE]") continue;
              const j = JSON.parse(payload);
              text = j.response ?? j.choices?.[0]?.delta?.content;
            } else {
              text = JSON.parse(line).message?.content;
            }
            const clean = text ? cleanText(text) : "";
            if (clean) ctrl.enqueue(encoder.encode(clean));
          } catch {
            // سطر غير مكتمل
          }
        }
      },
      cancel() {
        controller.abort();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    clearTimeout(timer);
    console.error("[api/doctor-ai]", err);
    return new Response("تعذر الاتصال بخدمة الذكاء الاصطناعي.", { status: 502 });
  }
}
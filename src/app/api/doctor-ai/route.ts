export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

const SYSTEM =
  "You are an expert medical assistant. Always reply ONLY in Modern Standard Arabic. " +
  "Never use Chinese, English, or any other language or characters. " +
  "Use the previous conversation to understand pronouns such as أسبابه and علاجه. " +
  "Answer directly with 3 to 5 short bullet points, each on its own line starting with '- '. " +
  "Mention seeing a doctor only once at the end, if needed.";

type Msg = { role: string; content: string };

export async function POST(req: Request) {
  let messages: Msg[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body.messages)) {
      messages = body.messages
        .filter(
          (m: Msg) =>
            m && m.content && ["user", "assistant"].includes(m.role)
        )
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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55000);

  try {
    const upstream = await fetch(OLLAMA_BASE + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: "system", content: SYSTEM }, ...messages],
        stream: true,
        keep_alive: "60m",
        options: {
          num_predict: 160,
          temperature: 0.15,
          top_p: 0.8,
          repeat_penalty: 1.1,
          num_ctx: 2048,
        },
      }),
      signal: controller.signal,
    });

    if (!upstream.ok || !upstream.body) {
      throw new Error("Ollama responded " + upstream.status);
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
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const text = JSON.parse(line).message?.content;
            const clean = text
              ? text.replace(/[\u3000-\u9FFF\uAC00-\uD7AF\uFF00-\uFFEF]/g, "")
              : "";
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
    return new Response("تعذر الاتصال بالذكاء الاصطناعي المحلي.", {
      status: 502,
    });
  }
}
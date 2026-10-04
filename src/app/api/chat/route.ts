import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b";

const SYSTEM =
  "أنت مساعد طبي. أجب بالعربية في جملتين كحد أقصى. انصح بمراجعة الطبيب عند الحاجة.";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  let body: { messages?: Msg[] };
  try {
    body = await request.json();
  } catch {
    return new Response("طلب غير صالح", { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response("الرسائل مطلوبة", { status: 400 });
  }

  const messages: Msg[] = [
    { role: "system", content: SYSTEM },
    ...body.messages.slice(-4),
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55_000);

  try {
    const upstream = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: true,
        keep_alive: "60m",
        options: { num_predict: 120, temperature: 0.3, num_ctx: 1024 },
      }),
      signal: controller.signal,
    });

    if (!upstream.ok || !upstream.body) {
      throw new Error(`Ollama responded ${upstream.status}`);
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
            if (text) ctrl.enqueue(encoder.encode(text));
          } catch {
            /* تجاهل أسطر غير مكتملة */
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
    console.error("[api/chat]", err);
    return new Response("تعذّر الاتصال بالنموذج.", { status: 502 });
  }
}
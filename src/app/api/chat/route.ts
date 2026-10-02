import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b";

type Msg = { role: "system" | "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  let body: { messages?: Msg[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "الرسائل مطلوبة" }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55_000);

  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "أنت مساعد طبي يجيب بالعربية بشكل واضح ومختصر. لا تعطِ تشخيصاً نهائياً، وانصح بمراجعة الطبيب عند الحاجة.",
          },
          ...messages,
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Ollama responded ${res.status}`);

    const data = await res.json();
    return NextResponse.json({ reply: data.message?.content ?? "" });
  } catch (err) {
    console.error("[api/chat]", err);
    const timeout = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      {
        error: timeout
          ? "انتهت مهلة الاستجابة."
          : "تعذّر الاتصال بخدمة الذكاء الاصطناعي.",
      },
      { status: timeout ? 504 : 502 }
    );
  } finally {
    clearTimeout(timer);
  }
}
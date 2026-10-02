import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:7b',
        system: `أنت مساعد طبي محترف وذكي. قدم تحليلاً شاملاً وواضحاً باللغة العربية الفصحى حصراً وبدون أي كلمات أجنبية. 
يجب تنظيم الرد بنقاط واضحة ومتباعدة، بحيث يبدأ بفقرة تحليلية مختصرة ثم يعقبها تعداد نقطي يوضع كل عنصر منه في سطر مستقل تماماً.`,
        prompt: prompt,
        stream: false,
        options: {
          num_predict: 350,
          temperature: 0.3,
        }
      }),
    });

    const data = await response.json();
    return NextResponse.json({ reply: data.response });
  } catch (error) {
    console.error('خطأ في الاتصال بـ Ollama:', error);
    return NextResponse.json(
      { error: 'تعذر الاتصال بالذكاء الاصطناعي المحلي.' },
      { status: 500 }
    );
  }
}
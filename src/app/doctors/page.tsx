'use client';

import React, { useState } from 'react';

export default function DoctorAIPage() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/doctor-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ في معالجة الطلب.' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'تعذر الاتصال بالخادم المحلي للذكاء الاصطناعي.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col justify-between">
      {/* رأس الصفحة */}
      <header className="max-w-4xl mx-auto w-full flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-cyan-400">مساعد الذكاء الاصطناعي الطبي</h1>
          <p className="text-sm text-slate-400">نظام استشاري محلي آمن ومرتبط بنماذج Ollama</p>
        </div>
        <button
          onClick={() => setMessages([])}
          className="bg-slate-900 hover:bg-slate-800 text-slate-200 px-4 py-2 rounded-xl border border-slate-800 text-sm transition-all"
        >
          محادثة جديدة
        </button>
      </header>

      {/* صندوق المحادثة الرئيسي */}
      <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-between bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-2xl mb-4 overflow-hidden">
        
        {/* منطقة الرسائل */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
              <p className="text-lg font-medium">كيف يمكنني مساعدتك طبياً اليوم؟</p>
              <p className="text-sm mt-1">اكتب أعراضك أو استشارتك لتحصل على تحليل مبدئي فوري.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 rounded-2xl px-4 py-3 text-sm animate-pulse border border-slate-700/60">
                جاري إعداد التحليل الطبي الشامل...
              </div>
            </div>
          )}
        </div>

        {/* حقل الإدخال وزر الإرسال */}
        <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-slate-800">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب استفسارك الطبي هنا..."
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg"
          >
            إرسال
          </button>
        </form>
      </main>
    </div>
  );
}
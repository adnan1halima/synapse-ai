'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function InsuranceRiskPage() {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const chronicDiseases = [
    {
      id: 1,
      title: 'ارتفاع ضغط الدم',
      shortCauses: 'الإجهاد، الإفراط في الملح، الجفاف، العوامل الوراثية.',
      longCauses: 'السمنة وزيادة الوزن، قلة النشاط البدني، التدخين المستمر، التوتر المزمن.',
      prevention: 'مراقبة الضغط دورياً، تقليل الصوديوم، ممارسة الرياضة، تجنب التدخين.'
    },
    {
      id: 2,
      title: 'سكري النوع الثاني',
      shortCauses: 'تناول وجبة غنية بالسكريات البسيطة فجأة، الخمول المؤقت.',
      longCauses: 'مقاومة الإنسولين المزمنة، السمنة المركزية، النظام الغذائي الغي صحي، قلة النوم.',
      prevention: 'الحفاظ على الوزن المثالي، التركيز على الألياف والحبوب الكاملة، الحركة المستمرة.'
    },
    {
      id: 3,
      title: 'أمراض الشرايين التاجية',
      shortCauses: 'الجهد البدني العنيف المفاجئ مع برودة الطقس، الغضب الشديد.',
      longCauses: 'تراكم اللويحات الدهنية (الكوليسترول)، ارتفاع ضغط الدم المزمن، التدخين.',
      prevention: 'فحص الكوليسترول بانتظام، اتباع نظام حمية متوسطية، ممارسة الكارديو بانتظام.'
    },
    {
      id: 4,
      title: 'الربو الشعبي',
      shortCauses: 'استنشاق الغبار، الدخان، وبر الحيوانات، الهواء البارد.',
      longCauses: 'التهاب المزمن في الشعب الهوائية، الحساسية المفرطة للمجاري التنفسية.',
      prevention: 'الابتعاد عن المثيرات، استخدام البخاخ الوقائي حسب استشارة الطبيب.'
    },
    {
      id: 5,
      title: 'مرض الكبد الدهني',
      shortCauses: 'الوجبات السريعة الدسمة جداً في وجبة واحدة، التخمة.',
      longCauses: 'تراكم الدهون الثلاثية في خلايا الكبد، مقاومة الإنسولين، السمنة.',
      prevention: 'تجنب الدهون المتحولة، تقليل السكريات والنشويات المكررة، ممارسة الرياضة.'
    },
    {
      id: 6,
      title: 'الجرثومة الحلزونية (H. pylori)',
      shortCauses: 'تناول طعام أو ماء ملوث غير نظيف.',
      longCauses: 'العدوى المزمنة في بطانة المعدة، الحموضة المستمرة.',
      prevention: 'الاهتمام بالنظافة الشخصية، غسل اليدين جيداً، التأكد من نظافة مصادر المياه.'
    },
    {
      id: 7,
      title: 'هشاشة العظام',
      shortCauses: 'نقص حاد ومفاجئ في امتصاص الكالسيوم أو التعرض لصدمة.',
      longCauses: 'قصور فيتامين د المزمن، التقدم في العمر، قلة التعرض للشمس.',
      prevention: 'تناول الأغذية الغنية بالكالسيوم وفيتامين د، رفع الأثقال الخفيفة لتقوية العظام.'
    },
    {
      id: 8,
      title: 'الانزلاق الغضروفي (دسك الظهر)',
      shortCauses: 'حمل جسم ثقيل بطريقة خاطئة، التواء مفاجئ.',
      longCauses: 'ضعف عضلات الظهر والبطن (Core)، الجلوس الخاطئ لفترات طويلة.',
      prevention: 'تقوية عضلات الجذع، الحفاظ على استقامة الظهر عند رفع الأجسام.'
    },
    {
      id: 9,
      title: 'قصور الغدة الدرقية',
      shortCauses: 'الإجهاد البدني والنفسي الحاد والمستمر.',
      longCauses: 'التهاب الغدة المناعي المزمن (حاشيموتو)، نقص اليود.',
      prevention: 'الفحص المخبري الدوري لوظائف الغدة (TSH)، تناول الأطعمة الغنية باليود.'
    },
    {
      id: 10,
      title: 'القولون العصبي',
      shortCauses: 'التوتر والقلق النفسي الحاد، تناول أطعمة مهيجة.',
      longCauses: 'اضطراب حركة عضلات الأمعاء، الحساسية المفرطة لبعض الأطعمة.',
      prevention: 'إدارة التوتر، تجنب الوجبات الدسمة المسببة للغازات، شرب الأعشاب المهدئة.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      {/* رأس الصفحة مع زر العودة */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            نظام التأمين: إدارة المخاطر والرقابة
          </h1>
          <p className="text-sm text-slate-400 mt-1">النموذج التنبئي الذكي لتقييم وإدارة الأمراض المزمنة قبل حدوثها</p>
        </div>
        <Link
          href="/"
          className="bg-slate-900 hover:bg-slate-800 text-cyan-400 px-5 py-2.5 rounded-xl border border-slate-800 text-sm font-medium transition-all shadow-lg"
        >
          العودة للرئيسية
        </Link>
      </header>

      {/* شريط محاكاة التكاليف المميز */}
      <div className="max-w-6xl mx-auto mb-10 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-800/40 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-cyan-300">خفض تكاليف المطالبات بنسبة 34%</h2>
          <p className="text-slate-300 text-sm mt-1">عن طريق التنبيه الرقمي بالتوأم الرقمي وإجراء التدخلات الوقائية قبل حدوث الأزمات.</p>
        </div>
        <button
          onClick={() => alert('جاري تشغيل محاكاة التوأم الرقمي الحي للمخاطر الصحية...')}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 whitespace-nowrap"
        >
          تجربة المحاكاة الحية الآن
        </button>
      </div>

      {/* قسم أشهر 10 أمراض مزمنة */}
      <section className="max-w-6xl mx-auto">
        <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-ping"></span>
          أشهر 10 أمراض مزمنة ودلائل أسبابها وطرق الوقاية:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chronicDiseases.map((disease) => {
            const isOpen = activeCard === disease.id;
            return (
              <div
                key={disease.id}
                className={`transition-all duration-300 bg-slate-900/80 border ${
                  isOpen ? 'border-cyan-500/80 bg-slate-900 shadow-2xl shadow-cyan-950/50' : 'border-slate-800/80 hover:border-slate-700'
                } rounded-2xl p-5 flex flex-col justify-between`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-bold text-cyan-400">
                    {disease.id}. {disease.title}
                  </h4>
                  <button
                    onClick={() => setActiveCard(isOpen ? null : disease.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      isOpen
                        ? 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20'
                        : 'bg-slate-800 border-slate-700 text-cyan-300 hover:bg-slate-700'
                    }`}
                  >
                    {isOpen ? 'إغلاق ▴' : 'عرض الأسباب ▾'}
                  </button>
                </div>

                {/* المحتوى التفصيلي المنسق دون أي تشويه أو تمدد سيء للنوافذ */}
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-sm text-slate-300 animate-fadeIn">
                    <div>
                      <span className="font-semibold text-amber-400 block mb-1">⚡ أسباب على المدى القصير:</span>
                      <p className="text-slate-400 leading-relaxed pr-2 border-r-2 border-amber-500/40">{disease.shortCauses}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-red-400 block mb-1">⚠️ أسباب على المدى الطويل:</span>
                      <p className="text-slate-400 leading-relaxed pr-2 border-r-2 border-red-500/40">{disease.longCauses}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-400 block mb-1">🛡️ الوقاية والعلاج المبكر:</span>
                      <p className="text-slate-300 leading-relaxed pr-2 border-r-2 border-emerald-500/40">{disease.prevention}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
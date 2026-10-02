import Link from "next/link";
import { Brain, Stethoscope, Sparkles, Building2, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center"
      dir="rtl"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6">
        <Sparkles className="w-4 h-4" /> منصة الذكاء الاصطناعي التنبئي الأولى عالمياً
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
        SYNAPSE AI
      </h1>
      <p className="text-lg text-slate-400 max-w-2xl mb-10">
        بناء النسخة الرقمية الحية للإنسان (Digital Human Twin) لتوقع المخاطر الصحية قبل حدوثها وإدارة المنظومة الطبية بالكامل.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mb-12">
        <Link href="/twin" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500 transition flex flex-col items-center group">
          <Brain className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition" />
          <h3 className="font-bold text-md mb-1">التوأم الرقمي</h3>
          <p className="text-xs text-slate-500">محاكي المستقبل ومحرك التوقع</p>
        </Link>

        <Link href="/dashboard" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500 transition flex flex-col items-center group">
          <Building2 className="w-8 h-8 text-indigo-400 mb-3 group-hover:scale-110 transition" />
          <h3 className="font-bold text-md mb-1">لوحة المستشفيات</h3>
          <p className="text-xs text-slate-500">العقل المركزي وإدارة الضغط</p>
        </Link>

        <Link href="/doctors" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500 transition flex flex-col items-center group">
          <Stethoscope className="w-8 h-8 text-emerald-400 mb-3 group-hover:scale-110 transition" />
          <h3 className="font-bold text-md mb-1">بوابة الأطباء</h3>
          <p className="text-xs text-slate-500">تحليل الأشعة والوكيل الطبي</p>
        </Link>

        <Link href="/insurance" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-amber-500 transition flex flex-col items-center group">
          <ShieldCheck className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition" />
          <h3 className="font-bold text-md mb-1">التأمين الصحي</h3>
          <p className="text-xs text-slate-500">تقييم المخاطر والتغطية</p>
        </Link>
      </div>
    </div>
  );
}
'use client';
import { useState } from 'react';
import { Activity, Heart, Brain, Moon, ShieldAlert, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TwinPage() {
  const [sleep, setSleep] = useState(6);
  const [exercise, setExercise] = useState(30);
  const [stress, setStress] = useState(70);

  // حساب محاكاة المخاطر بناءً على المدخلات
  const healthScore = Math.min(100, Math.max(20, Math.round((sleep * 8) + (exercise * 0.8) - (stress * 0.4))));
  
  const chartData = [
    { year: '2026', risk: 85 - healthScore * 0.3 },
    { year: '2027', risk: 75 - healthScore * 0.4 },
    { year: '2028', risk: 65 - healthScore * 0.5 },
    { year: '2030', risk: 50 - healthScore * 0.4 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 dir-rtl" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SYNAPSE AI - Digital Human Twin</h1>
            <p className="text-xs text-slate-400">التوأم الرقمي الحي والتنبؤ المستقبلي</p>
          </div>
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> العودة للرئيسية
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Twin Model */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full"></div>
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" /> الحالة الحيوية اللحظية
          </h2>
          
          <div className="relative w-48 h-80 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-around p-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 animate-pulse">
              <Heart className="w-5 h-5" />
              <span className="text-xs font-bold">القلب: 72 BPM</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Brain className="w-5 h-5" />
              <span className="text-xs font-bold">النشاط العصبي: 94%</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Moon className="w-5 h-5" />
              <span className="text-xs font-bold">جودة النوم: {sleep} ساعات</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">مؤشر الصحة العام المتوقع</p>
            <p className={`text-4xl font-extrabold mt-1 ${healthScore > 70 ? 'text-green-400' : healthScore > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {healthScore} / 100
            </p>
          </div>
        </div>

        {/* What-if Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" /> محاكي سيناريوهات المستقبل (What-If Engine)
          </h2>
          <p className="text-xs text-slate-400 mb-6">غير المتغيرات اليومية لرؤية تأثيرها على صحتك المستقلية حتى عام 2030:</p>

          <div className="space-y-6 mb-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>ساعات النوم اليومية:</span>
                <span className="font-bold text-blue-400">{sleep} ساعات</span>
              </div>
              <input type="range" min="3" max="10" value={sleep} onChange={(e) => setSleep(Number(e.target.value))} className="w-full accent-blue-500 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>النشاط الرياضي اليومي (دقيقة):</span>
                <span className="font-bold text-green-400">{exercise} دقيقة</span>
              </div>
              <input type="range" min="0" max="120" value={exercise} onChange={(e) => setExercise(Number(e.target.value))} className="w-full accent-green-500 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>مستوى التوتر والضغط العصبي:</span>
                <span className="font-bold text-red-400">{stress}%</span>
              </div>
              <input type="range" min="10" max="100" value={stress} onChange={(e) => setStress(Number(e.target.value))} className="w-full accent-red-500 cursor-pointer" />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-64">
            <p className="text-xs font-semibold text-slate-400 mb-2">مؤشر خطر الأمراض المزمنة المتوقع مستقبلاً (%):</p>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData}>
                <XAxis dataKey="year" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="risk" stroke="#38bdf8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
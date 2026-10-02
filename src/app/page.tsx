"use client";

import { useState } from "react";
import { Activity, Hospital, Brain, Map } from "lucide-react";

const modules = [
  { id: "risk", title: "المخاطر الصحية", icon: Activity },
  { id: "hospitals", title: "المستشفيات", icon: Hospital },
  { id: "ai", title: "التحليل الذكي", icon: Brain },
  { id: "map", title: "الخريطة الحية", icon: Map },
];

type HospitalItem = { placeId: string; name: string; address: string };

export default function Home() {
  const [active, setActive] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHospitals() {
    setLoading(true);
    setError(null);
    try {
      // استخدام إحداثيات افتراضية قريبة أو جلب موقع المستخدم
      const res = await fetch("/api/hospitals?lat=33.5138&lng=36.2765&radius=10000");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الجلب");
      setHospitals(data.hospitals || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(id: string) {
    setActive(id);
    if (id === "hospitals") loadHospitals();
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="mb-8 text-center text-3xl font-bold">
        التوأم الرقمي للمنظومة الطبية
      </h1>

      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
        {modules.map(({ id, title, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleSelect(id)}
            className={`flex flex-col items-center gap-3 rounded-2xl p-6 transition-all ${
              active === id
                ? "bg-blue-600 shadow-lg shadow-blue-600/30"
                : "bg-slate-900 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <Icon size={36} className="text-blue-400" />
            <span className="text-sm font-bold">{title}</span>
          </button>
        ))}
      </div>

      <section className="mx-auto mt-8 max-w-3xl">
        {active === "hospitals" && (
          <div className="rounded-2xl bg-slate-900 p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4 text-blue-400">المستشفيات القريبة</h2>
            {loading && <p className="text-slate-400">جاري البحث عن المستشفيات...</p>}
            {error && <p className="text-red-400">{error}</p>}
            {!loading && !error && hospitals.length === 0 && (
              <p className="text-slate-400">لا توجد مستشفيات قريبة متاحة حالياً.</p>
            )}
            {!loading && !error && hospitals.length > 0 && (
              <ul className="space-y-3">
                {hospitals.map((h) => (
                  <li key={h.placeId} className="rounded-xl bg-slate-800 p-4 border border-slate-700/50">
                    <h3 className="font-bold text-lg text-white">{h.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{h.address}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {active && active !== "hospitals" && (
          <div className="rounded-2xl bg-slate-900 p-6 border border-slate-800 text-center">
            <p className="text-slate-400 text-lg">
              قسم «{modules.modules?.find ? "" : modules.find((m) => m.id === active)?.title}» قيد التشغيل والتطوير.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <button
        onClick={() => alert('جاري تشغيل محاكاة التوأم الرقمي الحي للمخاطر الصحية والمنظومة الطبية...')}
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl transition-all"
      >
        تجربة المحاكاة الحية الآن
      </button>
    </main>
  );
}
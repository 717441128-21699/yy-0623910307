import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-deepsea-50 to-deepsea-100 flex items-center justify-center">
          <Compass size={56} className="text-deepsea-400" />
        </div>
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-deepsea-700 to-deepsea-800 text-white font-mono font-bold text-xl shadow-md">
          404
        </span>
      </div>

      <h1 className="text-3xl font-bold text-deepsea-900 mb-2">页面走丢了</h1>
      <p className="text-deepsea-500 max-w-sm mb-8 leading-relaxed">
        您访问的页面可能已被删除、重命名，或者暂时不可用。
        建议先返回首页继续浏览舆情线索。
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-deepsea-700 to-deepsea-800 text-white text-sm font-medium shadow-sm hover:shadow-md transition"
        >
          <Home size={16} />
          返回首页
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-deepsea-200 text-deepsea-700 text-sm font-medium hover:bg-deepsea-50 transition"
        >
          <ArrowLeft size={16} />
          返回上一页
        </button>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {[
          { title: '首页看板', desc: '预警线索一览', path: '/' },
          { title: '线索详情', desc: '查看单条线索深度分析', path: '/clue/CL-001' },
          { title: '交接班', desc: '值班交接与待办跟进', path: '/handover' },
        ].map((l) => (
          <Link key={l.path} to={l.path} className="block">
            <div className="p-4 rounded-xl bg-white shadow-card hover:shadow-card-hover text-left transition">
              <div className="font-semibold text-deepsea-800 mb-1">{l.title}</div>
              <div className="text-xs text-deepsea-400">{l.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Repeat2,
  Bell,
  Search,
  Radio,
  RefreshCw,
  Handshake,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TopNav() {
  const [refreshSpin, setRefreshSpin] = useState(false);

  const handleRefresh = () => {
    setRefreshSpin(true);
    setTimeout(() => setRefreshSpin(false), 500);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-deepsea-100/60 shadow-sm">
      <div className="w-full max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8 shrink-0">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-deepsea-600 via-deepsea-500 to-[#1B9AAA] flex items-center justify-center shadow-lg shadow-deepsea-500/30 group-hover:scale-105 transition-transform">
              <Radio size={20} className="text-white" />
            </span>
            <div className="leading-tight">
              <h1 className="text-lg font-bold text-deepsea-900 tracking-tight">舆情预警台</h1>
              <p className="text-[11px] text-deepsea-500 font-medium">Opinion Sentinel</p>
            </div>
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-deepsea-600 text-white shadow-md shadow-deepsea-600/20'
                    : 'text-deepsea-700 hover:bg-deepsea-50 hover:text-deepsea-800'
                )
              }
            >
              <LayoutDashboard size={16} />
              态势总览
            </NavLink>
            <NavLink
              to="/handover"
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-deepsea-600 text-white shadow-md shadow-deepsea-600/20'
                    : 'text-deepsea-700 hover:bg-deepsea-50 hover:text-deepsea-800'
                )
              }
            >
              <Handshake size={16} />
              交接班
            </NavLink>
          </nav>
        </div>

        <div className="flex-1 max-w-md hidden lg:block">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-deepsea-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="全局搜索关键词、线索ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-deepsea-50/50 border border-deepsea-100 text-sm text-deepsea-900 placeholder:text-deepsea-400 focus:bg-white focus:border-deepsea-300 focus:outline-none focus:ring-4 focus:ring-deepsea-100 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-deepsea-700 hover:bg-deepsea-50 hover:text-deepsea-900 transition-all"
            title="刷新数据"
          >
            <RefreshCw size={18} className={cn(refreshSpin && 'animate-spin-once')} />
          </button>
          <button className="relative w-10 h-10 rounded-xl flex items-center justify-center text-deepsea-700 hover:bg-deepsea-50 hover:text-deepsea-900 transition-all" title="系统通知">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D72638] animate-pulse" />
          </button>
          <div className="w-px h-6 bg-deepsea-100 mx-1" />
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-deepsea-400 to-deepsea-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
              值
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-bold text-deepsea-900">值班员</p>
              <p className="text-[11px] text-deepsea-500 flex items-center gap-1">
                <Repeat2 size={10} />
                早班 · 白班
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

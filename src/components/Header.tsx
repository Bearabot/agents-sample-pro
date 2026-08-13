import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Wallet, LayoutGrid, Monitor, Layers, Sun, Moon, Newspaper } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  watchlistCount: number;
  onOpenAiAssistant: () => void;
  onOpenPortfolio: () => void;
  activeCategory: string;
  setActiveCategory: (cat: any) => void;
  liveFeedActive: boolean;
  setLiveFeedActive: React.Dispatch<React.SetStateAction<boolean>>;
  theme: 'dark' | 'light' | 'editorial';
  setTheme: (t: 'dark' | 'light' | 'editorial') => void;
  viewMode: 'terminal' | 'overview' | 'heatmap';
  setViewMode: (vm: 'terminal' | 'overview' | 'heatmap') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  watchlistCount,
  onOpenAiAssistant,
  onOpenPortfolio,
  activeCategory,
  setActiveCategory,
  liveFeedActive,
  setLiveFeedActive,
  theme,
  setTheme,
  viewMode,
  setViewMode,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const isDark = theme === 'dark';
  const isEditorial = theme === 'editorial';

  const headerBg = isDark
    ? 'bg-[#181c27] border-[#2a2e39] text-[#d1d4dc]'
    : isEditorial
    ? 'bg-[#FDFCFB] border-[#1A1A1A] text-[#1A1A1A]'
    : 'bg-white border-[#e0e3eb] text-[#1a1c1c] shadow-2xs';

  const btnSecondary = isDark
    ? 'bg-[#2a2e39] hover:bg-[#363a45] text-[#d1d4dc] border-[#363a45]'
    : isEditorial
    ? 'bg-[#E5E2DD] hover:bg-[#1A1A1A] hover:text-[#FDFCFB] text-[#1A1A1A] border-[#1A1A1A]'
    : 'bg-[#f0f3fa] hover:bg-[#e0e3eb] text-[#1a1c1c] border-[#e0e3eb]';

  return (
    <header className={`sticky top-0 z-40 border-b ${headerBg} transition-colors duration-200`}>
      <div className="flex justify-between items-center h-16 w-full px-4 md:px-8 max-w-[1440px] mx-auto gap-4">
        {/* Left Brand Identity & View Mode Switcher */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#2962ff] flex items-center justify-center text-white font-bold font-mono text-sm shadow-sm">
              TV
            </div>
            <a href="#" className="flex flex-col group">
              <span className={`font-bold text-base md:text-lg tracking-tight leading-tight ${isEditorial ? 'font-serif italic' : 'font-headline'}`}>
                TradingView<span className="text-[#2962ff] ml-1 font-mono text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10">PRO</span>
              </span>
              <span className="text-[9px] font-mono opacity-60 uppercase tracking-widest hidden sm:inline">
                Global Financial Ledger v2.4
              </span>
            </a>
          </div>

          {/* View Mode Selector Tabs */}
          <div className={`hidden md:flex items-center p-1 rounded-lg border font-mono text-xs ${
            isDark ? 'bg-[#131722] border-[#2a2e39]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A]' : 'bg-[#f0f3fa] border-[#e0e3eb]'
          }`}>
            <button
              onClick={() => setViewMode('terminal')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-bold transition-all ${
                viewMode === 'terminal'
                  ? 'bg-[#2962ff] text-white shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>TERMINAL</span>
            </button>
            <button
              onClick={() => setViewMode('overview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-bold transition-all ${
                viewMode === 'overview'
                  ? 'bg-[#2962ff] text-white shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>DASHBOARD</span>
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-bold transition-all ${
                viewMode === 'heatmap'
                  ? 'bg-[#2962ff] text-white shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>HEATMAP</span>
            </button>
          </div>
        </div>

        {/* Center: Search Bar */}
        <button
          onClick={onOpenSearch}
          className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs w-64 text-left transition-colors ${
            isDark ? 'bg-[#131722] border-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A] text-[#1A1A1A]' : 'bg-white border-[#e0e3eb] text-[#6a6d78]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 truncate">Search markets...</span>
          <kbd className="px-1.5 py-0.5 rounded text-[9px] border border-inherit font-sans font-bold">⌘K</kbd>
        </button>

        {/* Right Tools & Theme Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search */}
          <button
            onClick={onOpenSearch}
            className={`lg:hidden p-2 rounded-lg border ${btnSecondary}`}
            title="Search Markets"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Preset Switcher */}
          <div className={`flex items-center p-0.5 rounded-lg border text-xs font-mono ${
            isDark ? 'bg-[#131722] border-[#2a2e39]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A]' : 'bg-[#f0f3fa] border-[#e0e3eb]'
          }`}>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded transition-all ${theme === 'dark' ? 'bg-[#2962ff] text-white' : 'opacity-60 hover:opacity-100'}`}
              title="Pro Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded transition-all ${theme === 'light' ? 'bg-[#2962ff] text-white' : 'opacity-60 hover:opacity-100'}`}
              title="Pro Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('editorial')}
              className={`p-1.5 rounded transition-all ${theme === 'editorial' ? 'bg-[#1A1A1A] text-[#FDFCFB]' : 'opacity-60 hover:opacity-100'}`}
              title="Editorial Theme"
            >
              <Newspaper className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Market Analyst Button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-[#2962ff] hover:bg-[#1e52db] text-white transition-all shadow-2xs"
            title="Open Gemini Market Analyst"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">AI Signals</span>
          </button>

          {/* Virtual Paper Portfolio Button */}
          <button
            onClick={onOpenPortfolio}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all ${btnSecondary}`}
            title="Open Paper Trading Account"
          >
            <Wallet className="w-3.5 h-3.5 text-[#2962ff]" />
            <span className="hidden sm:inline">Portfolio</span>
          </button>

          {/* Live Stream Switch */}
          <button
            onClick={() => setLiveFeedActive(!liveFeedActive)}
            className={`flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
              liveFeedActive
                ? 'border-[#089981]/50 text-[#089981] bg-[#089981]/10'
                : 'border-inherit opacity-50'
            }`}
            title="Toggle Live Price Stream"
          >
            <span className={`w-2 h-2 rounded-full ${liveFeedActive ? 'bg-[#089981] animate-pulse' : 'bg-gray-400'}`} />
            <span className="hidden xl:inline">{liveFeedActive ? 'LIVE' : 'PAUSED'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

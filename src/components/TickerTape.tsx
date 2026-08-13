import React from 'react';
import { MarketAsset } from '../types';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface TickerTapeProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  theme: 'dark' | 'light' | 'editorial';
}

export const TickerTape: React.FC<TickerTapeProps> = ({ assets, onSelectAsset, theme }) => {
  // Duplicate assets array to create smooth seamless looping tape
  const tapeAssets = [...assets, ...assets];

  const isDark = theme === 'dark';
  const isEditorial = theme === 'editorial';

  const containerBg = isDark
    ? 'bg-[#181c27] border-[#2a2e39] text-[#d1d4dc]'
    : isEditorial
    ? 'bg-[#1A1A1A] border-[#1A1A1A] text-[#FDFCFB]'
    : 'bg-[#f0f3fa] border-[#e0e3eb] text-[#1a1c1c]';

  const itemHover = isDark
    ? 'hover:bg-[#2a2e39]'
    : isEditorial
    ? 'hover:bg-[#2d2d2d]'
    : 'hover:bg-[#e0e3eb]';

  return (
    <div className={`w-full overflow-hidden border-b ${containerBg} text-xs font-mono select-none h-9 flex items-center shadow-inner z-30`}>
      {/* Session Status Marker */}
      <div className={`shrink-0 px-3 py-1 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] border-r ${
        isDark ? 'border-[#2a2e39] bg-[#1e222d] text-[#2962ff]' : isEditorial ? 'border-[#333] bg-[#1A1A1A] text-[#FDFCFB]' : 'border-[#e0e3eb] bg-white text-[#2962ff]'
      }`}>
        <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse" />
        <span className="hidden sm:inline">NYSE/NASDAQ</span>
        <span className="text-[#089981]">LIVE</span>
      </div>

      {/* Scrolling Tape Container */}
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-ticker flex items-center gap-6 py-1">
          {tapeAssets.map((asset, idx) => {
            const isUp = asset.change >= 0;
            return (
              <div
                key={`${asset.id}-${idx}`}
                onClick={() => onSelectAsset(asset)}
                className={`flex items-center gap-2 cursor-pointer py-1 px-2.5 rounded transition-colors ${itemHover}`}
              >
                <span className="font-bold text-xs uppercase tracking-tight">{asset.ticker}</span>
                <span className="font-semibold">${asset.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className={`flex items-center text-[11px] font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                  {isUp ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
                  {isUp ? '+' : ''}{asset.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Clock */}
      <div className={`shrink-0 px-3 hidden md:flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest border-l ${
        isDark ? 'border-[#2a2e39] text-[#787b86]' : isEditorial ? 'border-[#333] text-[#A0A0A0]' : 'border-[#e0e3eb] text-[#6a6d78]'
      }`}>
        <Clock className="w-3 h-3" />
        <span>UTC-5 (EST)</span>
      </div>
    </div>
  );
};

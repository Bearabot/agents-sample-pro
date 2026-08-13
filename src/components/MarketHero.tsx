import React, { useState } from 'react';
import { ChevronDown, Globe2, TrendingUp, DollarSign, Activity, Compass } from 'lucide-react';
import { MarketRegion } from '../types';

interface MarketHeroProps {
  selectedRegion: MarketRegion | 'All';
  onSelectRegion: (region: MarketRegion | 'All') => void;
  totalCap: string;
  volume24h: string;
  fearGreedIndex: number;
  theme: 'dark' | 'light' | 'editorial';
}

export const MarketHero: React.FC<MarketHeroProps> = ({
  selectedRegion,
  onSelectRegion,
  totalCap,
  volume24h,
  fearGreedIndex,
  theme,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isDark = theme === 'dark';
  const isEditorial = theme === 'editorial';

  const regionOptions: { label: string; value: MarketRegion | 'All' }[] = [
    { label: 'everywhere', value: 'All' },
    { label: 'in Americas', value: 'Americas' },
    { label: 'in Europe', value: 'Europe' },
    { label: 'in Asia-Pacific', value: 'Asia-Pacific' },
    { label: 'Global Crypto', value: 'Global' },
  ];

  const activeLabel = regionOptions.find(r => r.value === selectedRegion)?.label || 'everywhere';

  const getFearGreedText = (val: number) => {
    if (val >= 75) return { text: 'Extreme Greed', color: 'text-[#089981]' };
    if (val >= 55) return { text: 'Greed', color: 'text-[#26a69a]' };
    if (val >= 45) return { text: 'Neutral', color: 'text-amber-500' };
    if (val >= 25) return { text: 'Fear', color: 'text-orange-500' };
    return { text: 'Extreme Fear', color: 'text-[#F23645]' };
  };

  const sentimentInfo = getFearGreedText(fearGreedIndex);

  const containerBorder = isDark ? 'border-[#2a2e39]' : isEditorial ? 'border-[#1A1A1A]' : 'border-[#e0e3eb]';
  const cardBg = isDark ? 'bg-[#1e222d]' : isEditorial ? 'bg-[#FDFCFB]' : 'bg-white';

  return (
    <section className={`text-center pt-8 pb-6 relative max-w-[1440px] mx-auto px-4 md:px-8 border-b ${containerBorder}`}>
      <p className={`text-[10px] font-mono font-bold tracking-[0.3em] uppercase mb-3 ${isDark ? 'text-[#2962ff]' : 'text-[#2962ff]'}`}>
        Global Financial Intelligence
      </p>

      {/* Title with dropdown */}
      <div className="relative inline-block mb-3">
        <h1
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`font-bold text-3xl sm:text-5xl md:text-6xl tracking-tight flex items-center justify-center gap-3 cursor-pointer hover:opacity-80 transition-opacity select-none ${
            isEditorial ? 'font-serif italic' : 'font-headline'
          }`}
        >
          <span>Markets, {activeLabel}</span>
          <ChevronDown className={`w-7 h-7 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </h1>

        {dropdownOpen && (
          <div className={`absolute left-1/2 -translate-x-1/2 mt-2 w-64 border shadow-2xl py-2 z-30 text-left rounded-xl ${
            isDark ? 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A]' : 'bg-white border-[#e0e3eb]'
          }`}>
            <div className="px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest border-b border-inherit opacity-70">
              Scope Region
            </div>
            {regionOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSelectRegion(opt.value);
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs font-mono tracking-wider uppercase flex items-center justify-between transition-colors ${
                  selectedRegion === opt.value
                    ? 'font-bold bg-[#2962ff] text-white'
                    : isDark ? 'hover:bg-[#2a2e39]' : 'hover:bg-[#f0f3fa]'
                }`}
              >
                <span>Markets, {opt.label}</span>
                {selectedRegion === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs md:text-sm font-normal max-w-xl mx-auto mb-6 opacity-75 leading-relaxed font-body">
        Real-time equities, global benchmark indices, commodities, FX rates, and technical momentum telemetry.
      </p>

      {/* Global Market Stats Bar */}
      <div className={`grid grid-cols-2 md:grid-cols-4 border divide-x divide-y md:divide-y-0 rounded-xl overflow-hidden max-w-4xl mx-auto text-left shadow-2xs ${containerBorder} ${cardBg}`}>
        <div className="p-3.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-60 mb-1">Total Market Cap</div>
          <div className="text-base font-bold font-mono">{totalCap}</div>
        </div>

        <div className="p-3.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-60 mb-1">24h Vol</div>
          <div className="text-base font-bold font-mono">{volume24h}</div>
        </div>

        <div className="p-3.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-60 mb-1">Sentiment</div>
          <div className={`text-base font-bold font-mono ${sentimentInfo.color}`}>
            {fearGreedIndex} ({sentimentInfo.text})
          </div>
        </div>

        <div className="p-3.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-60 mb-1">Exchange Status</div>
          <div className="text-xs font-bold font-mono text-[#089981] flex items-center gap-1.5 uppercase">
            <span className="w-2 h-2 rounded-full bg-[#089981] inline-block animate-pulse" />
            Active Session
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { ChevronRight, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { MarketAsset } from '../types';

interface IndicesCardsProps {
  indices: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  watchlist: string[];
  onToggleWatchlist: (assetId: string) => void;
  onNavigateCategory: (cat: string) => void;
  theme?: 'dark' | 'light' | 'editorial';
}

export const IndicesCards: React.FC<IndicesCardsProps> = ({
  indices,
  onSelectAsset,
  watchlist,
  onToggleWatchlist,
  onNavigateCategory,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const isEditorial = theme === 'editorial';

  const cardBg = isDark
    ? 'bg-[#1e222d] border-[#2a2e39] hover:bg-[#2a2e39] text-[#d1d4dc]'
    : isEditorial
    ? 'bg-[#FDFCFB] border-[#1A1A1A] hover:bg-[#E5E2DD] text-[#1A1A1A]'
    : 'bg-white border-[#e0e3eb] hover:border-[#2962ff] text-[#1a1c1c] shadow-2xs';

  return (
    <section className="flex flex-col gap-4 max-w-[1440px] mx-auto px-4 md:px-8 w-full pt-4">
      {/* Section Title */}
      <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-[#2a2e39]' : isEditorial ? 'border-[#1A1A1A]' : 'border-[#e0e3eb]'}`}>
        <h2
          onClick={() => onNavigateCategory('Indices')}
          className={`text-xl md:text-2xl font-bold flex items-center gap-2 hover:opacity-80 cursor-pointer group transition-opacity ${
            isEditorial ? 'font-serif italic' : 'font-headline'
          }`}
        >
          <span>Benchmark Indices</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#2962ff]" />
        </h2>
        <span className="text-[10px] font-mono uppercase tracking-widest opacity-60 hidden sm:inline-block">
          GLOBAL MARKET BENCHMARKS
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {indices.slice(0, 3).map((item) => {
          const isUp = item.change >= 0;
          const isWatchlisted = watchlist.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => onSelectAsset(item)}
              className={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all group relative ${cardBg}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Badge */}
                  <div className="w-9 h-9 rounded bg-[#2962ff] text-white flex items-center justify-center font-bold text-xs uppercase font-mono shadow-2xs">
                    {item.badgeNumber || item.ticker.slice(0, 3)}
                  </div>

                  <div>
                    <div className="font-bold text-base md:text-lg group-hover:underline flex items-center gap-2 font-headline">
                      <span>{item.name}</span>
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                      {item.ticker} &bull; {item.region}
                    </div>
                  </div>
                </div>

                {/* Star Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatchlist(item.id);
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                  title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  <Star className={`w-4 h-4 ${isWatchlisted ? 'text-amber-400 fill-amber-400' : 'opacity-40'}`} />
                </button>
              </div>

              {/* Price & Sparkline Row */}
              <div className="flex items-end justify-between mt-2 pt-2 border-t border-inherit">
                <div>
                  <div className="font-mono font-bold text-xl">
                    ${item.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`font-mono text-xs font-bold flex items-center gap-1 ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isUp ? '+' : ''}{item.change.toFixed(2)} ({isUp ? '+' : ''}{item.changePercent.toFixed(2)}%)</span>
                  </div>
                </div>

                {/* Mini Sparkline SVG */}
                <div className="w-24 h-9">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                    {(() => {
                      const min = Math.min(...item.sparkline);
                      const max = Math.max(...item.sparkline);
                      const range = max - min || 1;
                      const points = item.sparkline
                        .map((val, i) => {
                          const x = (i / (item.sparkline.length - 1)) * 100;
                          const y = 28 - ((val - min) / range) * 24;
                          return `${x},${y}`;
                        })
                        .join(' ');
                      return (
                        <polyline
                          fill="none"
                          stroke={isUp ? '#089981' : '#F23645'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

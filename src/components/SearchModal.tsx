import React, { useState, useEffect } from 'react';
import { Search, X, Star } from 'lucide-react';
import { MarketAsset } from '../types';

interface SearchModalProps {
  assets: MarketAsset[];
  onClose: () => void;
  onSelectAsset: (asset: MarketAsset) => void;
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
  theme?: 'dark' | 'light' | 'editorial';
}

export const SearchModal: React.FC<SearchModalProps> = ({
  assets,
  onClose,
  onSelectAsset,
  watchlist,
  onToggleWatchlist,
  theme = 'dark',
}) => {
  const [query, setQuery] = useState('');

  const isDark = theme === 'dark';
  const isEditorial = theme === 'editorial';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filtered = assets.filter((asset) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      asset.ticker.toLowerCase().includes(q) ||
      asset.name.toLowerCase().includes(q) ||
      asset.category.toLowerCase().includes(q) ||
      (asset.sector && asset.sector.toLowerCase().includes(q))
    );
  });

  const modalBg = isDark ? 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A] text-[#1A1A1A]' : 'bg-white border-[#e0e3eb] text-[#1a1c1c]';
  const headerBg = isDark ? 'bg-[#181c27] text-white border-[#2a2e39]' : isEditorial ? 'bg-[#1A1A1A] text-[#FDFCFB] border-[#1A1A1A]' : 'bg-[#f0f3fa] text-[#1a1c1c] border-[#e0e3eb]';
  const itemHover = isDark ? 'hover:bg-[#2a2e39]/50' : isEditorial ? 'hover:bg-[#E5E2DD]' : 'hover:bg-[#f8f9fd]';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 font-mono">
      <div className={`border w-full max-w-2xl shadow-2xl overflow-hidden rounded-xl flex flex-col max-h-[80vh] ${modalBg}`}>
        {/* Search Bar Input */}
        <div className={`p-4 border-b flex items-center gap-3 ${headerBg}`}>
          <Search className="w-5 h-5 opacity-70" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker, symbol, or asset (e.g. AAPL, BTC, S&P 500)..."
            className="w-full bg-transparent text-xs font-mono font-bold uppercase focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1 px-2 text-[10px] font-bold rounded border border-inherit">
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto divide-y divide-inherit">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs opacity-60">
              No markets found matching "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const isUp = item.change >= 0;
              const isStarred = watchlist.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectAsset(item);
                    onClose();
                  }}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors group ${itemHover}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Star toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(item.id);
                      }}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-4 h-4 ${isStarred ? 'text-amber-400 fill-amber-400' : 'opacity-30'}`} />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-xs group-hover:underline text-[#2962ff]">{item.ticker}</span>
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-[#2962ff]">{item.category}</span>
                      </div>
                      <div className="font-headline font-bold text-sm">{item.name}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-xs md:text-sm">
                      ${item.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`font-mono text-xs font-bold ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                      {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

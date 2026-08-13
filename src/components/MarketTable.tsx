import React, { useState, useMemo } from 'react';
import { Star, ArrowUpDown, ArrowUp, ArrowDown, Search, Sparkles, Filter } from 'lucide-react';
import { MarketAsset, MarketCategory } from '../types';

interface MarketTableProps {
  assets: MarketAsset[];
  activeCategory: MarketCategory;
  setActiveCategory: (cat: MarketCategory) => void;
  watchlist: string[];
  onToggleWatchlist: (assetId: string) => void;
  onSelectAsset: (asset: MarketAsset) => void;
  onAnalyzeAsset: (asset: MarketAsset) => void;
  theme?: 'dark' | 'light' | 'editorial';
}

type SortField = 'ticker' | 'name' | 'lastPrice' | 'changePercent' | 'volume';
type SortDirection = 'asc' | 'desc';

export const MarketTable: React.FC<MarketTableProps> = ({
  assets,
  activeCategory,
  setActiveCategory,
  watchlist,
  onToggleWatchlist,
  onSelectAsset,
  onAnalyzeAsset,
  theme = 'dark',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [regionFilter, setRegionFilter] = useState<string>('All');

  const isDark = theme === 'dark';
  const isEditorial = theme === 'editorial';

  const categories: { label: string; value: MarketCategory }[] = [
    { label: 'World indices', value: 'Indices' },
    { label: 'US Stocks', value: 'Stocks' },
    { label: 'Crypto', value: 'Crypto' },
    { label: 'Commodities', value: 'Commodities' },
    { label: 'Forex', value: 'Forex' },
    { label: `Watchlist (${watchlist.length})`, value: 'Watchlist' },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (activeCategory === 'Watchlist') {
        if (!watchlist.includes(asset.id)) return false;
      } else if (asset.category !== activeCategory) {
        return false;
      }

      if (regionFilter !== 'All' && asset.region !== regionFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTicker = asset.ticker.toLowerCase().includes(q);
        const matchName = asset.name.toLowerCase().includes(q);
        const matchSector = asset.sector?.toLowerCase().includes(q) || false;
        if (!matchTicker && !matchName && !matchSector) return false;
      }

      return true;
    });
  }, [assets, activeCategory, watchlist, regionFilter, searchQuery]);

  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = (aVal as string).toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAssets, sortField, sortDir]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 inline ml-1" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#2962ff] inline ml-1 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#2962ff] inline ml-1 font-bold" />
    );
  };

  const containerBorder = isDark ? 'border-[#2a2e39]' : isEditorial ? 'border-[#1A1A1A]' : 'border-[#e0e3eb]';
  const tableHeaderBg = isDark ? 'bg-[#181c27] text-[#787b86]' : isEditorial ? 'bg-[#1A1A1A] text-[#FDFCFB]' : 'bg-[#f0f3fa] text-[#6a6d78]';
  const rowHover = isDark ? 'hover:bg-[#2a2e39]/50' : isEditorial ? 'hover:bg-[#E5E2DD]' : 'hover:bg-[#f8f9fd]';

  return (
    <section className="mt-6 max-w-[1440px] mx-auto px-4 md:px-8 w-full">
      {/* Category Tabs & Filters Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between border-b gap-4 pb-3 mb-4 ${containerBorder}`}>
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`text-xs font-mono font-bold uppercase whitespace-nowrap py-1.5 px-3 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-[#2962ff] text-white border-[#2962ff] shadow-2xs'
                    : isDark ? 'bg-[#1e222d] border-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A] text-[#1A1A1A]' : 'bg-white border-[#e0e3eb] text-[#6a6d78]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Filter Input */}
          <div className="relative flex-1 md:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter ticker..."
              className={`w-full py-1.5 pl-8 pr-3 text-xs font-mono rounded-lg border focus:outline-none ${
                isDark ? 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A] text-[#1A1A1A]' : 'bg-white border-[#e0e3eb]'
              }`}
            />
          </div>

          {/* Region Selector */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded-lg border ${
            isDark ? 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A] text-[#1A1A1A]' : 'bg-white border-[#e0e3eb]'
          }`}>
            <Filter className="w-3.5 h-3.5 opacity-60" />
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-bold uppercase tracking-wider text-[11px]"
            >
              <option value="All" className={isDark ? 'bg-[#1e222d]' : ''}>All Regions</option>
              <option value="Americas" className={isDark ? 'bg-[#1e222d]' : ''}>Americas</option>
              <option value="Europe" className={isDark ? 'bg-[#1e222d]' : ''}>Europe</option>
              <option value="Asia-Pacific" className={isDark ? 'bg-[#1e222d]' : ''}>Asia-Pacific</option>
              <option value="Global" className={isDark ? 'bg-[#1e222d]' : ''}>Global</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section Title */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold text-xl md:text-2xl ${isEditorial ? 'font-serif italic' : 'font-headline'}`}>
          {categories.find((c) => c.value === activeCategory)?.label || 'Market Quotes'}
        </h3>
        <div className="text-xs font-mono opacity-60">
          Showing {sortedAssets.length} of {assets.length} symbols
        </div>
      </div>

      {/* Main Data Table */}
      <div className={`border rounded-xl overflow-hidden shadow-2xs ${containerBorder} ${isDark ? 'bg-[#1e222d]' : isEditorial ? 'bg-[#FDFCFB]' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm">
            <thead>
              <tr className={`border-b ${containerBorder} ${tableHeaderBg} text-[10px] font-bold uppercase tracking-wider select-none`}>
                <th className="py-3 px-3 w-10 text-center">★</th>
                <th
                  onClick={() => handleSort('ticker')}
                  className="py-3 px-4 cursor-pointer hover:underline"
                >
                  TICKER {getSortIcon('ticker')}
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:underline"
                >
                  NAME {getSortIcon('name')}
                </th>
                <th
                  onClick={() => handleSort('lastPrice')}
                  className="py-3 px-4 text-right cursor-pointer hover:underline"
                >
                  LAST {getSortIcon('lastPrice')}
                </th>
                <th
                  onClick={() => handleSort('changePercent')}
                  className="py-3 px-4 text-right cursor-pointer hover:underline"
                >
                  CHG % {getSortIcon('changePercent')}
                </th>
                <th className="py-3 px-4 text-right hidden lg:table-cell">24H RANGE</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">VOLUME</th>
                <th className="py-3 px-4 text-center hidden md:table-cell">SPARKLINE</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${containerBorder}`}>
              {sortedAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center opacity-60 font-mono text-sm">
                    {activeCategory === 'Watchlist'
                      ? 'No assets in your watchlist. Click the star icon next to any symbol to add it.'
                      : 'No market symbols matched your filter criteria.'}
                  </td>
                </tr>
              ) : (
                sortedAssets.map((item) => {
                  const isUp = item.change >= 0;
                  const isStarred = watchlist.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectAsset(item)}
                      className={`transition-colors group cursor-pointer ${rowHover}`}
                    >
                      {/* Star Watchlist Toggle */}
                      <td
                        className="py-3 px-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(item.id);
                        }}
                      >
                        <button className="p-1 hover:scale-110 transition-transform">
                          <Star className={`w-4 h-4 ${isStarred ? 'text-amber-400 fill-amber-400' : 'opacity-30'}`} />
                        </button>
                      </td>

                      {/* Ticker Symbol */}
                      <td className="py-3 px-4 font-bold group-hover:underline text-xs md:text-sm">
                        {item.ticker}
                      </td>

                      {/* Name & Region Badge */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-xs md:text-sm font-headline">{item.name}</div>
                        <div className="text-[10px] font-mono opacity-60 flex items-center gap-2">
                          <span>{item.region}</span>
                          {item.sector && <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-[#2962ff] text-[9px]">{item.sector}</span>}
                        </div>
                      </td>

                      {/* Last Price */}
                      <td className="py-3 px-4 text-right font-bold text-xs md:text-sm">
                        ${item.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Change % */}
                      <td className={`py-3 px-4 text-right font-bold text-xs md:text-sm ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                        {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </td>

                      {/* High / Low 24h */}
                      <td className="py-3 px-4 text-right text-xs opacity-75 hidden lg:table-cell">
                        <div>H: ${item.high24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        <div>L: ${item.low24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                      </td>

                      {/* Volume */}
                      <td className="py-3 px-4 text-right text-xs opacity-80 hidden sm:table-cell">
                        {item.volume}
                      </td>

                      {/* Mini Sparkline Chart */}
                      <td className="py-3 px-4 text-center hidden md:table-cell">
                        <div className="w-20 h-6 mx-auto">
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
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAnalyzeAsset(item);
                          }}
                          className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#2962ff] hover:bg-[#1e52db] text-white transition-all inline-flex items-center gap-1 shadow-2xs"
                          title="Generate AI Analysis"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span className="hidden sm:inline">Analyze</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

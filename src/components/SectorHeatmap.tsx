import React from 'react';
import { MarketAsset } from '../types';
import { TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface SectorHeatmapProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  theme: 'dark' | 'light' | 'editorial';
}

export const SectorHeatmap: React.FC<SectorHeatmapProps> = ({ assets, onSelectAsset, theme }) => {
  const isDark = theme === 'dark';
  const isEditorial = theme === 'editorial';

  // Group assets by Sector / Category
  const sectorsMap: Record<string, MarketAsset[]> = {};
  assets.forEach((a) => {
    const key = a.sector || a.category;
    if (!sectorsMap[key]) sectorsMap[key] = [];
    sectorsMap[key].push(a);
  });

  const getHeatmapBg = (changePct: number) => {
    if (changePct >= 2.0) return isDark ? 'bg-[#089981]/80 hover:bg-[#089981] text-white' : 'bg-[#089981] text-white';
    if (changePct > 0) return isDark ? 'bg-[#089981]/40 hover:bg-[#089981]/60 text-[#26a69a]' : 'bg-emerald-100 text-[#089981] border border-emerald-300';
    if (changePct <= -2.0) return isDark ? 'bg-[#F23645]/80 hover:bg-[#F23645] text-white' : 'bg-[#F23645] text-white';
    return isDark ? 'bg-[#F23645]/40 hover:bg-[#F23645]/60 text-[#ef5350]' : 'bg-rose-100 text-[#F23645] border border-rose-300';
  };

  return (
    <div className={`w-full p-4 md:p-6 border rounded-xl transition-all ${
      isDark ? 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A] text-[#1A1A1A]' : 'bg-white border-[#e0e3eb] text-[#1a1c1c] shadow-xs'
    }`}>
      <div className="flex items-center justify-between mb-4 border-b pb-3 border-inherit">
        <div className="flex items-center gap-2">
          <Layers className={`w-5 h-5 ${isDark ? 'text-[#2962ff]' : 'text-[#2962ff]'}`} />
          <h3 className={`font-bold text-lg md:text-xl tracking-tight ${isEditorial ? 'font-serif italic' : 'font-headline'}`}>
            Global Market Sector Heatmap
          </h3>
        </div>
        <span className="text-xs font-mono opacity-70">Relative Performance & Weighting</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(sectorsMap).map(([sectorName, sectorAssets]) => {
          const avgChange = sectorAssets.reduce((acc, curr) => acc + curr.changePercent, 0) / sectorAssets.length;
          return (
            <div
              key={sectorName}
              className={`p-3.5 border rounded-lg flex flex-col justify-between transition-all ${
                isDark ? 'bg-[#131722] border-[#2a2e39]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A]' : 'bg-[#f8f9fd] border-[#e0e3eb]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase tracking-wider truncate">{sectorName}</span>
                <span className={`text-xs font-mono font-bold ${avgChange >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                  {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                {sectorAssets.map((asset) => {
                  const isUp = asset.changePercent >= 0;
                  return (
                    <button
                      key={asset.id}
                      onClick={() => onSelectAsset(asset)}
                      className={`p-2 rounded flex flex-col justify-between text-left transition-transform hover:scale-[1.02] ${getHeatmapBg(asset.changePercent)}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold font-mono text-xs uppercase">{asset.ticker}</span>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      </div>
                      <div className="text-[11px] font-mono font-bold mt-1">
                        ${asset.lastPrice > 1000 ? asset.lastPrice.toLocaleString() : asset.lastPrice.toFixed(2)}
                      </div>
                      <div className="text-[10px] font-mono font-semibold opacity-90">
                        {isUp ? '+' : ''}{asset.changePercent.toFixed(2)}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

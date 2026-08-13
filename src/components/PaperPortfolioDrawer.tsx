import React from 'react';
import { X, Wallet, TrendingUp, TrendingDown, Trash2, RotateCcw } from 'lucide-react';
import { PaperTradePosition, MarketAsset } from '../types';

interface PaperPortfolioDrawerProps {
  positions: PaperTradePosition[];
  assets: MarketAsset[];
  onClose: () => void;
  onClosePosition: (id: string) => void;
  onResetPortfolio: () => void;
  cashBalance: number;
  theme?: 'dark' | 'light' | 'editorial';
}

export const PaperPortfolioDrawer: React.FC<PaperPortfolioDrawerProps> = ({
  positions,
  assets,
  onClose,
  onClosePosition,
  onResetPortfolio,
  cashBalance,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const isEditorial = theme === 'editorial';

  // Calculate total portfolio value and P&L
  let totalInvested = 0;
  let currentPositionsValue = 0;

  const positionsWithLiveData = positions.map((pos) => {
    const liveAsset = assets.find((a) => a.id === pos.assetId);
    const currentPrice = liveAsset ? liveAsset.lastPrice : pos.buyPrice;
    const currentTotalVal = pos.shares * currentPrice;
    const initialTotalVal = pos.shares * pos.buyPrice;
    const pnl = pos.type === 'BUY' ? currentTotalVal - initialTotalVal : initialTotalVal - currentTotalVal;
    const pnlPercent = initialTotalVal > 0 ? (pnl / initialTotalVal) * 100 : 0;

    totalInvested += initialTotalVal;
    currentPositionsValue += currentTotalVal;

    return {
      ...pos,
      currentPrice,
      currentTotalVal,
      pnl,
      pnlPercent,
    };
  });

  const totalPortfolioValue = cashBalance + currentPositionsValue;
  const totalPnl = currentPositionsValue - totalInvested;
  const isOverallUp = totalPnl >= 0;

  const modalBg = isDark ? 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A] text-[#1A1A1A]' : 'bg-white border-[#e0e3eb] text-[#1a1c1c]';
  const headerBg = isDark ? 'bg-[#181c27] text-white border-[#2a2e39]' : isEditorial ? 'bg-[#1A1A1A] text-[#FDFCFB] border-[#1A1A1A]' : 'bg-[#f0f3fa] text-[#1a1c1c] border-[#e0e3eb]';
  const cardBg = isDark ? 'bg-[#131722] border-[#2a2e39]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A]' : 'bg-[#f8f9fd] border-[#e0e3eb]';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 font-mono">
      <div className={`border-l w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden ${modalBg}`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#2962ff] text-white">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg">Virtual Paper Portfolio</h2>
              <p className="text-[10px] font-mono uppercase tracking-wider opacity-60">Simulated trading account & active positions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetPortfolio}
              className="p-1.5 text-[10px] font-mono font-bold uppercase rounded border border-inherit hover:opacity-80 flex items-center gap-1"
              title="Reset Portfolio to $100,000"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button onClick={onClose} className="p-1.5 rounded border border-inherit hover:opacity-80 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Total Value & Balance Banner */}
        <div className={`p-4 border-b grid grid-cols-2 gap-3 ${isDark ? 'border-[#2a2e39]' : 'border-[#e0e3eb]'}`}>
          <div className={`p-3.5 rounded-xl border ${cardBg}`}>
            <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1">Portfolio Value</div>
            <div className="font-bold text-lg font-mono">
              ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-xs font-bold font-mono flex items-center gap-1 mt-1 ${isOverallUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
              {isOverallUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isOverallUp ? '+' : ''}${totalPnl.toFixed(2)}</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${cardBg}`}>
            <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1">Cash Balance</div>
            <div className="font-bold text-lg font-mono text-[#2962ff]">
              ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] uppercase tracking-wider opacity-60 mt-1">Available Capital</div>
          </div>
        </div>

        {/* Positions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
          <h3 className="font-bold text-base">
            Open Positions ({positions.length})
          </h3>

          {positionsWithLiveData.length === 0 ? (
            <div className={`p-8 text-center text-xs opacity-60 rounded-xl border ${cardBg}`}>
              You have no open paper trade positions. Click "Paper Trade" on any stock or index to execute an order.
            </div>
          ) : (
            positionsWithLiveData.map((pos) => {
              const isPosUp = pos.pnl >= 0;

              return (
                <div
                  key={pos.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${cardBg}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{pos.ticker}</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white ${
                          pos.type === 'BUY' ? 'bg-[#089981]' : 'bg-[#F23645]'
                        }`}
                      >
                        {pos.type}
                      </span>
                      <span className="text-xs opacity-60">{pos.shares} units</span>
                    </div>

                    <div className="text-xs opacity-60">
                      Entry: ${pos.buyPrice.toFixed(2)} &bull; Current: ${pos.currentPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-sm">
                        ${pos.currentTotalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs font-bold ${isPosUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                        {isPosUp ? '+' : ''}${pos.pnl.toFixed(2)} ({isPosUp ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                      </div>
                    </div>

                    <button
                      onClick={() => onClosePosition(pos.id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Close position"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

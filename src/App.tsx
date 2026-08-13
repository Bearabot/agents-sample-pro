/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { MarketHero } from './components/MarketHero';
import { IndicesCards } from './components/IndicesCards';
import { MarketTable } from './components/MarketTable';
import { SectorHeatmap } from './components/SectorHeatmap';
import { TerminalView } from './components/TerminalView';
import { AssetDetailModal } from './components/AssetDetailModal';
import { SearchModal } from './components/SearchModal';
import { AiMarketAssistantModal } from './components/AiMarketAssistantModal';
import { PaperPortfolioDrawer } from './components/PaperPortfolioDrawer';
import { DisqusForum } from './components/DisqusForum';
import { INITIAL_MARKET_ASSETS } from './data/marketData';
import { MarketAsset, MarketCategory, MarketRegion, PaperTradePosition } from './types';

export default function App() {
  // Application State
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_MARKET_ASSETS);
  const [selectedRegion, setSelectedRegion] = useState<MarketRegion | 'All'>('All');
  const [activeCategory, setActiveCategory] = useState<MarketCategory>('Indices');
  
  // View mode and theme state
  const [viewMode, setViewMode] = useState<'terminal' | 'overview' | 'heatmap'>('terminal');
  const [theme, setTheme] = useState<'dark' | 'light' | 'editorial'>('dark');

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pml_watchlist');
      return saved ? JSON.parse(saved) : ['sp500', 'nasdaq100', 'btc', 'aapl', 'nvda'];
    } catch {
      return ['sp500', 'nasdaq100', 'btc', 'aapl', 'nvda'];
    }
  });

  const [paperPositions, setPaperPositions] = useState<PaperTradePosition[]>(() => {
    try {
      const saved = localStorage.getItem('pml_paper_positions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cashBalance, setCashBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('pml_cash_balance');
      return saved ? parseFloat(saved) : 100000;
    } catch {
      return 100000;
    }
  });

  const [liveFeedActive, setLiveFeedActive] = useState<boolean>(true);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<MarketAsset | null>(null);
  const [selectedAssetForAi, setSelectedAssetForAi] = useState<MarketAsset | null>(null);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState<boolean>(false);
  const [fearGreedIndex, setFearGreedIndex] = useState<number>(72);

  // Persistence
  useEffect(() => {
    localStorage.setItem('pml_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('pml_paper_positions', JSON.stringify(paperPositions));
    localStorage.setItem('pml_cash_balance', cashBalance.toString());
  }, [paperPositions, cashBalance]);

  // Sync theme class to document body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.className = 'bg-[#131722] text-[#d1d4dc] font-mono selection:bg-[#2962ff] selection:text-white dark';
    } else if (theme === 'editorial') {
      document.body.className = 'bg-[#FDFCFB] text-[#1A1A1A] font-serif selection:bg-[#1A1A1A] selection:text-[#FDFCFB]';
    } else {
      document.body.className = 'bg-[#f8f9fd] text-[#1a1c1c] font-mono selection:bg-[#2962ff] selection:text-white';
    }
  }, [theme]);

  // Live real-time market data ticks
  useEffect(() => {
    if (!liveFeedActive) return;

    const interval = setInterval(() => {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          if (Math.random() > 0.45) return asset;

          const deltaPercent = (Math.random() - 0.48) * 0.003;
          const priceChange = asset.lastPrice * deltaPercent;
          const newPrice = Math.max(0.01, asset.lastPrice + priceChange);
          const newChange = asset.change + priceChange;
          const newChangePercent = ((newPrice - (asset.lastPrice - asset.change)) / (asset.lastPrice - asset.change)) * 100;

          const newHigh = Math.max(asset.high24h, newPrice);
          const newLow = Math.min(asset.low24h, newPrice);

          const updated1D = [...asset.history1D];
          if (updated1D.length > 0) {
            const lastPoint = updated1D[updated1D.length - 1];
            updated1D[updated1D.length - 1] = {
              ...lastPoint,
              price: Number(newPrice.toFixed(2)),
              high: Math.max(lastPoint.high || newPrice, newPrice),
              low: Math.min(lastPoint.low || newPrice, newPrice),
            };
          }

          const newSparkline = [...asset.sparkline.slice(1), Number(newPrice.toFixed(2))];

          return {
            ...asset,
            lastPrice: Number(newPrice.toFixed(2)),
            change: Number(newChange.toFixed(2)),
            changePercent: Number(newChangePercent.toFixed(2)),
            high24h: Number(newHigh.toFixed(2)),
            low24h: Number(newLow.toFixed(2)),
            sparkline: newSparkline,
            history1D: updated1D,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [liveFeedActive]);

  // Keep modal detail asset in sync with tick updates
  useEffect(() => {
    if (selectedAssetForDetail) {
      const updated = assets.find((a) => a.id === selectedAssetForDetail.id);
      if (updated) setSelectedAssetForDetail(updated);
    }
  }, [assets]);

  const handleToggleWatchlist = (assetId: string) => {
    setWatchlist((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
  };

  const handleExecuteTrade = (assetId: string, type: 'BUY' | 'SELL', shares: number) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    const totalCost = shares * asset.lastPrice;

    if (type === 'BUY') {
      if (cashBalance < totalCost) {
        alert(`Insufficient cash balance! Required: $${totalCost.toFixed(2)}, Available: $${cashBalance.toFixed(2)}`);
        return;
      }
      setCashBalance((prev) => prev - totalCost);
    } else {
      setCashBalance((prev) => prev + totalCost);
    }

    const newPosition: PaperTradePosition = {
      id: Date.now().toString(),
      assetId,
      ticker: asset.ticker,
      name: asset.name,
      type,
      shares,
      buyPrice: asset.lastPrice,
      currentPrice: asset.lastPrice,
      totalCost,
      timestamp: new Date().toLocaleTimeString(),
    };

    setPaperPositions((prev) => [newPosition, ...prev]);
  };

  const handleClosePosition = (positionId: string) => {
    const pos = paperPositions.find((p) => p.id === positionId);
    if (!pos) return;

    const asset = assets.find((a) => a.id === pos.assetId);
    const currentPrice = asset ? asset.lastPrice : pos.buyPrice;
    const currentVal = pos.shares * currentPrice;

    if (pos.type === 'BUY') {
      setCashBalance((prev) => prev + currentVal);
    } else {
      const initialCost = pos.shares * pos.buyPrice;
      const profitLoss = initialCost - currentVal;
      setCashBalance((prev) => prev + initialCost + profitLoss);
    }

    setPaperPositions((prev) => prev.filter((p) => p.id !== positionId));
  };

  const handleResetPortfolio = () => {
    if (window.confirm('Reset virtual trading account to $100,000 cash balance and clear all positions?')) {
      setPaperPositions([]);
      setCashBalance(100000);
    }
  };

  const handleOpenAiForAsset = (asset: MarketAsset) => {
    setSelectedAssetForAi(asset);
    setShowAiModal(true);
  };

  const indicesList = assets.filter((a) => a.category === 'Indices');

  const mainBg = theme === 'dark'
    ? 'bg-[#131722] text-[#d1d4dc]'
    : theme === 'editorial'
    ? 'bg-[#FDFCFB] text-[#1A1A1A]'
    : 'bg-[#f8f9fd] text-[#1a1c1c]';

  return (
    <div className={`min-h-screen ${mainBg} flex flex-col transition-colors duration-200`}>
      {/* Top Professional Header */}
      <Header
        onOpenSearch={() => setShowSearchModal(true)}
        watchlistCount={watchlist.length}
        onOpenAiAssistant={() => {
          setSelectedAssetForAi(null);
          setShowAiModal(true);
        }}
        onOpenPortfolio={() => setShowPortfolioDrawer(true)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        liveFeedActive={liveFeedActive}
        setLiveFeedActive={setLiveFeedActive}
        theme={theme}
        setTheme={setTheme}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Scrolling Ticker Tape Bar */}
      <TickerTape assets={assets} onSelectAsset={setSelectedAssetForDetail} theme={theme} />

      {/* Main Workspace Area */}
      <main className="flex-1 w-full mx-auto flex flex-col pb-12">
        {viewMode === 'terminal' && (
          <div className="w-full px-2 sm:px-4 py-2">
            <TerminalView
              assets={assets}
              selectedAsset={selectedAssetForDetail}
              onSelectAsset={setSelectedAssetForDetail}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onExecuteTrade={handleExecuteTrade}
              onOpenAi={handleOpenAiForAsset}
              theme={theme}
            />
          </div>
        )}

        {viewMode === 'overview' && (
          <div className="flex flex-col gap-6 max-w-[1440px] mx-auto w-full">
            <MarketHero
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              totalCap="$108.4T"
              volume24h="$482B"
              fearGreedIndex={fearGreedIndex}
              theme={theme}
            />

            <IndicesCards
              indices={indicesList}
              onSelectAsset={setSelectedAssetForDetail}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onNavigateCategory={setActiveCategory}
              theme={theme}
            />

            <MarketTable
              assets={assets}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
              onSelectAsset={setSelectedAssetForDetail}
              onAnalyzeAsset={handleOpenAiForAsset}
              theme={theme}
            />
          </div>
        )}

        {viewMode === 'heatmap' && (
          <div className="w-full px-4 py-6 max-w-[1440px] mx-auto">
            <SectorHeatmap assets={assets} onSelectAsset={setSelectedAssetForDetail} theme={theme} />
          </div>
        )}

        {/* Community Discussion Forum */}
        <DisqusForum theme={theme} />
      </main>

      {/* Modals & Drawers */}
      {selectedAssetForDetail && (
        <AssetDetailModal
          asset={selectedAssetForDetail}
          onClose={() => setSelectedAssetForDetail(null)}
          isWatchlisted={watchlist.includes(selectedAssetForDetail.id)}
          onToggleWatchlist={handleToggleWatchlist}
          onExecuteTrade={handleExecuteTrade}
          onRequestAiSummary={handleOpenAiForAsset}
          theme={theme}
        />
      )}

      {showSearchModal && (
        <SearchModal
          assets={assets}
          onClose={() => setShowSearchModal(false)}
          onSelectAsset={setSelectedAssetForDetail}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
          theme={theme}
        />
      )}

      {showAiModal && (
        <AiMarketAssistantModal
          assets={assets}
          onClose={() => setShowAiModal(false)}
          selectedAssetForAi={selectedAssetForAi}
          theme={theme}
        />
      )}

      {showPortfolioDrawer && (
        <PaperPortfolioDrawer
          positions={paperPositions}
          assets={assets}
          onClose={() => setShowPortfolioDrawer(false)}
          onClosePosition={handleClosePosition}
          onResetPortfolio={handleResetPortfolio}
          cashBalance={cashBalance}
          theme={theme}
        />
      )}

      {/* Footer */}
      <footer className={`border-t py-6 px-6 text-center text-xs font-mono opacity-80 ${
        theme === 'dark' ? 'border-[#2a2e39] bg-[#181c27] text-[#787b86]' : theme === 'editorial' ? 'border-[#1A1A1A] bg-[#FDFCFB] text-[#1A1A1A]' : 'border-[#e0e3eb] bg-white text-[#6a6d78]'
      }`}>
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-headline font-bold text-sm">
            <div className="w-6 h-6 rounded bg-[#2962ff] text-white flex items-center justify-center text-xs">TV</div>
            <span>TradingView Pro Terminal • Global Financial Intelligence</span>
          </div>
          <p>© {new Date().getFullYear()} TradingView Inc. Market telemetry provided for institutional simulation & analysis.</p>
          <div className="flex items-center gap-4 font-bold">
            <a href="#" className="hover:text-[#2962ff]">Terms</a>
            <a href="#" className="hover:text-[#2962ff]">Privacy</a>
            <a href="#" className="hover:text-[#2962ff]">API Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

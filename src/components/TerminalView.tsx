import React, { useState } from 'react';
import { MarketAsset, PaperTradePosition } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Search,
  Star,
  Activity,
  Layers,
  BarChart2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface TerminalViewProps {
  assets: MarketAsset[];
  selectedAsset?: MarketAsset | null;
  onSelectAsset?: (asset: MarketAsset) => void;
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
  onExecuteTrade: (assetId: string, type: 'BUY' | 'SELL', shares: number) => void;
  onOpenAiAssistant?: (asset?: MarketAsset) => void;
  onOpenAi?: (asset?: MarketAsset) => void;
  theme: 'dark' | 'light' | 'editorial';
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  assets,
  selectedAsset,
  onSelectAsset,
  watchlist,
  onToggleWatchlist,
  onExecuteTrade,
  onOpenAiAssistant,
  onOpenAi,
  theme,
}) => {
  const isDark = theme === 'dark';
  const isEditorial = theme === 'editorial';

  const [internalSelectedId, setInternalSelectedId] = useState<string>(assets[0]?.id || '');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [showSMA, setShowSMA] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [tradeShares, setTradeShares] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [orderExecutedMsg, setOrderExecutedMsg] = useState<string | null>(null);

  const activeAsset = selectedAsset || assets.find((a) => a.id === internalSelectedId) || assets[0];

  const handleSelectAsset = (asset: MarketAsset) => {
    setInternalSelectedId(asset.id);
    if (onSelectAsset) {
      onSelectAsset(asset);
    }
  };

  const handleOpenAiSignal = (asset?: MarketAsset) => {
    const target = asset || activeAsset;
    if (onOpenAiAssistant) {
      onOpenAiAssistant(target);
    } else if (onOpenAi) {
      onOpenAi(target);
    }
  };

  // Selected history
  const getHistoryData = () => {
    if (!activeAsset) return [];
    switch (timeframe) {
      case '1W': return activeAsset.history1W || [];
      case '1M': return activeAsset.history1M || [];
      case '1Y': return activeAsset.history1Y || [];
      default: return activeAsset.history1D || [];
    }
  };

  const rawHistory = getHistoryData();

  // Enrich with technical indicator calculations (SMA 20, RSI 14)
  const history = rawHistory.map((pt, idx, arr) => {
    // Calculate 5-period SMA for demo
    const windowSize = 5;
    let sma = pt.price;
    if (idx >= windowSize - 1) {
      const slice = arr.slice(idx - windowSize + 1, idx + 1);
      sma = slice.reduce((sum, item) => sum + item.price, 0) / windowSize;
    }

    // Calculate simulated RSI (14)
    let rsi = 50;
    if (idx >= 3) {
      const diffs = arr.slice(Math.max(0, idx - 10), idx + 1).map((p, i, a) => (i === 0 ? 0 : p.price - a[i - 1].price));
      const gains = diffs.filter((d) => d > 0).reduce((a, b) => a + b, 0) || 1;
      const losses = Math.abs(diffs.filter((d) => d < 0).reduce((a, b) => a + b, 0)) || 1;
      const rs = gains / losses;
      rsi = Number((100 - 100 / (1 + rs)).toFixed(1));
    }

    return {
      ...pt,
      sma: Number(sma.toFixed(2)),
      rsi,
      volume: pt.volume || Math.floor(pt.price * 120),
    };
  });

  if (!activeAsset) {
    return (
      <div className="p-12 text-center font-mono opacity-60">
        No market asset selected or available.
      </div>
    );
  }

  const isUp = activeAsset.change >= 0;
  const filteredAssets = assets.filter(
    (a) =>
      a.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickOrder = (type: 'BUY' | 'SELL') => {
    onExecuteTrade(activeAsset.id, type, tradeShares);
    setOrderExecutedMsg(`Executed ${type} ${tradeShares} shares of ${activeAsset.ticker}`);
    setTimeout(() => setOrderExecutedMsg(null), 3000);
  };

  // Simulated Level II Order Book Bids / Asks
  const price = activeAsset.lastPrice;
  const orderBookBids = [
    { price: price * 0.999, size: 450, total: 450 },
    { price: price * 0.998, size: 1200, total: 1650 },
    { price: price * 0.997, size: 850, total: 2500 },
    { price: price * 0.996, size: 2100, total: 4600 },
    { price: price * 0.995, size: 3400, total: 8000 },
  ];

  const orderBookAsks = [
    { price: price * 1.001, size: 320, total: 320 },
    { price: price * 1.002, size: 980, total: 1300 },
    { price: price * 1.003, size: 1450, total: 2750 },
    { price: price * 1.004, size: 1800, total: 4550 },
    { price: price * 1.005, size: 2900, total: 7450 },
  ];

  const mainBg = isDark ? 'bg-[#131722] text-[#d1d4dc]' : isEditorial ? 'bg-[#FDFCFB] text-[#1A1A1A]' : 'bg-[#f8f9fd] text-[#1a1c1c]';
  const panelBg = isDark ? 'bg-[#1e222d] border-[#2a2e39]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A]' : 'bg-white border-[#e0e3eb] shadow-2xs';
  const headerBg = isDark ? 'bg-[#181c27] border-[#2a2e39]' : isEditorial ? 'bg-[#1A1A1A] text-[#FDFCFB] border-[#1A1A1A]' : 'bg-[#f0f3fa] border-[#e0e3eb]';
  const activeItemBg = isDark ? 'bg-[#2a2e39] border-l-4 border-l-[#2962ff]' : isEditorial ? 'bg-[#E5E2DD] border-l-4 border-l-[#1A1A1A]' : 'bg-blue-50 border-l-4 border-l-[#2962ff]';

  return (
    <div className={`w-full grid grid-cols-1 lg:grid-cols-12 gap-4 ${mainBg} min-h-[720px]`}>
      {/* LEFT COLUMN: Symbol Watchlist & Search */}
      <div className={`lg:col-span-3 border rounded-xl flex flex-col overflow-hidden ${panelBg}`}>
        <div className={`p-3 border-b flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <BarChart2 className="w-4 h-4 text-[#2962ff]" />
            <span>Market Watch</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-[#2962ff]">
            {filteredAssets.length} Symbols
          </span>
        </div>

        {/* Quick Search */}
        <div className="p-2.5 border-b border-inherit">
          <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg ${isDark ? 'bg-[#131722] border-[#2a2e39]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A]' : 'bg-white border-[#e0e3eb]'}`}>
            <Search className="w-3.5 h-3.5 opacity-60" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ticker..."
              className="w-full bg-transparent text-xs font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Assets List */}
        <div className="flex-1 overflow-y-auto divide-y divide-inherit max-h-[640px]">
          {filteredAssets.map((asset) => {
            const isSelected = asset.id === activeAsset.id;
            const isStarred = watchlist.includes(asset.id);
            const assetUp = asset.change >= 0;

            return (
              <div
                key={asset.id}
                onClick={() => handleSelectAsset(asset)}
                className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? activeItemBg : isDark ? 'hover:bg-[#2a2e39]/50' : 'hover:bg-[#f0f3fa]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(asset.id);
                    }}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-amber-400 fill-amber-400' : 'opacity-30'}`} />
                  </button>
                  <div>
                    <div className="font-mono font-bold text-xs flex items-center gap-1">
                      <span>{asset.ticker}</span>
                      <span className="text-[9px] opacity-60 font-sans font-normal">({asset.category})</span>
                    </div>
                    <div className="text-[11px] truncate max-w-[110px] opacity-80">{asset.name}</div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-xs">
                    ${asset.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-[10px] font-semibold ${assetUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                    {assetUp ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTER COLUMN: Main Pro Charting Workspace */}
      <div className={`lg:col-span-6 border rounded-xl flex flex-col overflow-hidden ${panelBg}`}>
        {/* Asset Header Banner */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-4 ${headerBg}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#2962ff] text-white flex items-center justify-center font-bold text-xs font-mono">
              {activeAsset.ticker.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg md:text-xl font-mono">{activeAsset.ticker}</h2>
                <span className="text-xs opacity-75 font-normal">{activeAsset.name}</span>
              </div>
              <div className="text-[10px] font-mono opacity-60 uppercase">
                {activeAsset.region} &bull; {activeAsset.category} {activeAsset.sector ? `&bull; ${activeAsset.sector}` : ''}
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-3 font-mono">
            <div className="text-2xl font-bold">
              ${activeAsset.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-xs font-bold flex items-center gap-1 ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
              {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {isUp ? '+' : ''}{activeAsset.change.toFixed(2)} ({activeAsset.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Chart Toolbars */}
        <div className={`p-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${isDark ? 'bg-[#181c27]' : 'bg-[#f8f9fd]'}`}>
          {/* Timeframes */}
          <div className="flex items-center gap-1">
            {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-[#2962ff] text-white'
                    : isDark ? 'hover:bg-[#2a2e39] text-[#787b86]' : 'hover:bg-[#e0e3eb] text-[#6a6d78]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Technical Indicator Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                showSMA ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' : 'opacity-40 border-transparent'
              }`}
            >
              SMA(5)
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                showRSI ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : 'opacity-40 border-transparent'
              }`}
            >
              RSI(14)
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                showVolume ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'opacity-40 border-transparent'
              }`}
            >
              Volume
            </button>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="p-4 flex-1 flex flex-col gap-4 min-h-[360px]">
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradientUp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#089981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#089981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="chartGradientDown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F23645" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F23645" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2a2e39' : '#e0e3eb'} />
                <XAxis dataKey="time" stroke={isDark ? '#787b86' : '#6a6d78'} fontSize={10} tickLine={false} />
                <YAxis
                  domain={['auto', 'auto']}
                  stroke={isDark ? '#787b86' : '#6a6d78'}
                  fontSize={10}
                  orientation="right"
                  tickFormatter={(val) => `$${val.toFixed(0)}`}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e222d' : '#ffffff',
                    borderColor: isDark ? '#2a2e39' : '#e0e3eb',
                    color: isDark ? '#d1d4dc' : '#1a1c1c',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isUp ? '#089981' : '#F23645'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={isUp ? 'url(#chartGradientUp)' : 'url(#chartGradientDown)'}
                />
                {showSMA && (
                  <Line type="monotone" dataKey="sma" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="SMA (5)" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* RSI Subchart */}
          {showRSI && (
            <div className="w-full h-20 border-t pt-2 border-inherit">
              <div className="text-[10px] font-mono font-bold flex justify-between items-center px-2 mb-1">
                <span className="text-purple-400">RSI (14) Momentum Indicator</span>
                <span className="text-purple-400 font-bold">
                  {history.length > 0 ? history[history.length - 1].rsi : 50}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={50}>
                <LineChart data={history}>
                  <YAxis domain={[0, 100]} hide />
                  <ReferenceLine y={70} stroke="#f23645" strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke="#089981" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="rsi" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Order Execution Bar */}
        <div className={`p-3 border-t flex flex-wrap items-center justify-between gap-3 ${headerBg}`}>
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono font-semibold">Quantity:</label>
            <input
              type="number"
              min={1}
              value={tradeShares}
              onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 1))}
              className={`w-20 px-2 py-1 text-xs font-mono font-bold border rounded ${
                isDark ? 'bg-[#131722] border-[#2a2e39]' : 'bg-white border-[#e0e3eb]'
              }`}
            />
            <span className="text-xs font-mono opacity-70">
              Est: ${(tradeShares * activeAsset.lastPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickOrder('BUY')}
              className="px-4 py-2 rounded bg-[#089981] hover:bg-[#067a67] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" /> BUY
            </button>
            <button
              onClick={() => handleQuickOrder('SELL')}
              className="px-4 py-2 rounded bg-[#F23645] hover:bg-[#c92a37] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" /> SELL
            </button>
          </div>
        </div>

        {orderExecutedMsg && (
          <div className="bg-emerald-500/20 text-[#089981] text-xs font-mono font-bold p-2 text-center border-t border-emerald-500/30 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{orderExecutedMsg}</span>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Level II Order Book Depth & Market Metrics */}
      <div className={`lg:col-span-3 border rounded-xl flex flex-col overflow-hidden ${panelBg}`}>
        <div className={`p-3 border-b flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#2962ff]" />
            <span>Level II Order Depth</span>
          </div>
          <span className="text-[10px] font-mono text-[#089981]">REALTIME</span>
        </div>

        {/* Order Book Table */}
        <div className="p-3 border-b border-inherit font-mono text-xs">
          <div className="grid grid-cols-3 text-[10px] uppercase font-bold opacity-60 mb-2 border-b pb-1 border-inherit">
            <span>Price</span>
            <span className="text-center">Size</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (Sells - Red) */}
          <div className="space-y-1 mb-2">
            {orderBookAsks.slice().reverse().map((ask, i) => (
              <div key={i} className="grid grid-cols-3 text-[11px] text-[#F23645] relative overflow-hidden">
                <span className="font-bold">${ask.price.toFixed(2)}</span>
                <span className="text-center">{ask.size}</span>
                <span className="text-right opacity-80">{ask.total}</span>
              </div>
            ))}
          </div>

          {/* Spread Indicator */}
          <div className={`py-1.5 my-1 text-center font-bold text-xs border-y ${isDark ? 'bg-[#181c27] border-[#2a2e39]' : 'bg-[#f0f3fa] border-[#e0e3eb]'}`}>
            Spread: ${(price * 0.002).toFixed(2)}
          </div>

          {/* Bids (Buys - Green) */}
          <div className="space-y-1 mt-2">
            {orderBookBids.map((bid, i) => (
              <div key={i} className="grid grid-cols-3 text-[11px] text-[#089981] relative overflow-hidden">
                <span className="font-bold">${bid.price.toFixed(2)}</span>
                <span className="text-center">{bid.size}</span>
                <span className="text-right opacity-80">{bid.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fundamentals & Key Telemetry */}
        <div className="p-3 border-b border-inherit space-y-2.5 font-mono text-xs">
          <div className="font-bold uppercase tracking-wider text-[10px] opacity-70 mb-1">
            Market Telemetry
          </div>

          <div className="flex justify-between items-center">
            <span className="opacity-70">Market Cap</span>
            <span className="font-bold">{activeAsset.marketCap || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-70">24h High</span>
            <span className="font-bold text-[#089981]">${activeAsset.high24h.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-70">24h Low</span>
            <span className="font-bold text-[#F23645]">${activeAsset.low24h.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-70">P/E Ratio</span>
            <span className="font-bold">{activeAsset.peRatio || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="opacity-70">Volume</span>
            <span className="font-bold">{activeAsset.volume}</span>
          </div>
        </div>

        {/* Gemini AI Intelligence Action */}
        <div className="p-3 flex-1 flex flex-col justify-end">
          <button
            onClick={() => handleOpenAiSignal(activeAsset)}
            className="w-full p-2.5 rounded-lg bg-[#2962ff] hover:bg-[#1e52db] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Signal Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
};

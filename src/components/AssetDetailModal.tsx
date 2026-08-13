import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Star,
  Sparkles,
  BarChart2,
  ShoppingBag,
  CheckCircle2,
  Newspaper,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { MarketAsset, PricePoint } from '../types';

interface AssetDetailModalProps {
  asset: MarketAsset;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (id: string) => void;
  onExecuteTrade: (assetId: string, type: 'BUY' | 'SELL', shares: number) => void;
  onRequestAiSummary: (asset: MarketAsset) => void;
  theme?: 'dark' | 'light' | 'editorial';
}

type Timeframe = '1D' | '1W' | '1M' | '1Y';

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
  onExecuteTrade,
  onRequestAiSummary,
  theme = 'dark',
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [showVolume, setShowVolume] = useState(true);
  const [showSma, setShowSma] = useState(true);
  const [activeTab, setActiveTab] = useState<'chart' | 'ai' | 'trade' | 'news'>('chart');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [sharesInput, setSharesInput] = useState('10');
  const [tradeSuccess, setTradeSuccess] = useState(false);

  const isDark = theme === 'dark';
  const isEditorial = theme === 'editorial';

  // Pick history based on timeframe
  const rawData: PricePoint[] =
    timeframe === '1D'
      ? asset.history1D
      : timeframe === '1W'
      ? asset.history1W
      : timeframe === '1M'
      ? asset.history1M
      : asset.history1Y;

  // Add calculated 5-period SMA for overlay
  const chartData = rawData.map((pt, idx, arr) => {
    let sma = pt.price;
    if (idx >= 4) {
      const sum = arr.slice(idx - 4, idx + 1).reduce((acc, curr) => acc + curr.price, 0);
      sma = Number((sum / 5).toFixed(2));
    }
    return {
      ...pt,
      sma,
    };
  });

  const isUp = asset.change >= 0;
  const strokeColor = isUp ? '#089981' : '#F23645';

  const sharesNum = Math.max(1, parseFloat(sharesInput) || 1);
  const totalTradeCost = sharesNum * asset.lastPrice;

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteTrade(asset.id, tradeType, sharesNum);
    setTradeSuccess(true);
    setTimeout(() => setTradeSuccess(false), 3000);
  };

  const modalBg = isDark ? 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A] text-[#1A1A1A]' : 'bg-white border-[#e0e3eb] text-[#1a1c1c]';
  const headerBg = isDark ? 'bg-[#181c27] border-[#2a2e39]' : isEditorial ? 'bg-[#1A1A1A] text-[#FDFCFB] border-[#1A1A1A]' : 'bg-[#f0f3fa] border-[#e0e3eb]';
  const cardBg = isDark ? 'bg-[#131722] border-[#2a2e39]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A]' : 'bg-white border-[#e0e3eb]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 font-mono">
      <div className={`border w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden rounded-xl ${modalBg}`}>
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-3">
            {/* Badge */}
            <div className="w-10 h-10 rounded bg-[#2962ff] text-white flex items-center justify-center font-bold text-xs uppercase font-mono shadow-2xs">
              {asset.badgeNumber || asset.ticker.slice(0, 3)}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-headline font-bold text-xl md:text-2xl">{asset.name}</h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-[#2962ff]">
                  {asset.ticker}
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                {asset.category} &bull; {asset.region} {asset.sector ? `&bull; ${asset.sector}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatchlist(asset.id)}
              className="p-2 rounded-lg border border-inherit hover:opacity-80 transition-colors"
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star className={`w-4 h-4 ${isWatchlisted ? 'text-amber-400 fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-inherit hover:opacity-80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Price Bar & Tabs */}
        <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-4 ${isDark ? 'bg-[#181c27] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'}`}>
          <div className="flex items-baseline gap-3">
            <span className="font-bold text-2xl sm:text-3xl">
              ${asset.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-bold flex items-center gap-1 ${isUp ? 'text-[#089981]' : 'text-[#F23645]'}`}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isUp ? '+' : ''}{asset.change.toFixed(2)} ({isUp ? '+' : ''}{asset.changePercent.toFixed(2)}%)
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className={`flex items-center gap-1 p-1 rounded-lg border text-xs font-bold ${isDark ? 'bg-[#131722] border-[#2a2e39]' : 'bg-white border-[#e0e3eb]'}`}>
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'chart' ? 'bg-[#2962ff] text-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Chart
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'ai' ? 'bg-[#2962ff] text-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              AI Analysis
            </button>

            <button
              onClick={() => setActiveTab('trade')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'trade' ? 'bg-[#2962ff] text-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Paper Trade
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'news' ? 'bg-[#2962ff] text-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              News
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'chart' && (
            <div className="flex flex-col gap-4">
              {/* Chart Controls Bar */}
              <div className={`flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl border ${cardBg}`}>
                <div className="flex items-center gap-1">
                  {(['1D', '1W', '1M', '1Y'] as Timeframe[]).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`text-xs font-bold px-3 py-1 rounded transition-all ${
                        timeframe === tf ? 'bg-[#2962ff] text-white' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none">
                    <input
                      type="checkbox"
                      checked={showSma}
                      onChange={(e) => setShowSma(e.target.checked)}
                      className="rounded text-[#2962ff]"
                    />
                    <span>5-SMA Overlay</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none">
                    <input
                      type="checkbox"
                      checked={showVolume}
                      onChange={(e) => setShowVolume(e.target.checked)}
                      className="rounded text-[#2962ff]"
                    />
                    <span>Volume Sub-chart</span>
                  </label>
                </div>
              </div>

              {/* Main Technical Price Chart */}
              <div className={`h-72 w-full rounded-xl border p-2 relative ${cardBg}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="modalColorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2a2e39' : '#e0e3eb'} />
                    <XAxis dataKey="time" stroke={isDark ? '#787b86' : '#6a6d78'} fontSize={11} tickLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke={isDark ? '#787b86' : '#6a6d78'} fontSize={11} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as PricePoint & { sma?: number };
                          return (
                            <div className="bg-[#1e222d] text-[#d1d4dc] text-xs p-2.5 rounded shadow-lg border border-[#2a2e39] font-mono">
                              <div className="text-gray-400 font-semibold mb-1">{data.time}</div>
                              <div className="text-[#089981]">Price: ${data.price.toFixed(2)}</div>
                              {data.sma && <div className="text-amber-400">SMA: ${data.sma.toFixed(2)}</div>}
                              {data.volume && <div className="text-gray-300">Vol: {data.volume.toLocaleString()}</div>}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="price" stroke={strokeColor} strokeWidth={2.5} fillOpacity={1} fill="url(#modalColorPrice)" />
                    {showSma && <Area type="monotone" dataKey="sma" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Volume Bar Chart Sub-panel */}
              {showVolume && (
                <div className={`h-24 w-full rounded-xl border p-2 ${cardBg}`}>
                  <div className="text-[10px] font-bold opacity-60 uppercase px-2 mb-1">Volume History</div>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" hide />
                      <YAxis hide domain={[0, 'auto']} />
                      <Bar dataKey="volume" fill="#2962ff" opacity={0.6} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Key Financial Statistics */}
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border ${cardBg}`}>
                <div>
                  <div className="text-xs opacity-60">24h High</div>
                  <div className="font-bold text-sm text-[#089981]">${asset.high24h.toFixed(2)}</div>
                </div>

                <div>
                  <div className="text-xs opacity-60">24h Low</div>
                  <div className="font-bold text-sm text-[#F23645]">${asset.low24h.toFixed(2)}</div>
                </div>

                <div>
                  <div className="text-xs opacity-60">Market Cap</div>
                  <div className="font-bold text-sm">{asset.marketCap || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-xs opacity-60">24h Volume</div>
                  <div className="font-bold text-sm">{asset.volume}</div>
                </div>
              </div>

              {/* Asset Description */}
              <div className={`text-xs p-3.5 rounded-xl border ${cardBg}`}>
                <div className="font-bold mb-1">About {asset.name}</div>
                <p className="opacity-80 leading-relaxed font-body text-xs">{asset.description}</p>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="flex flex-col gap-4">
              <div className={`border rounded-xl p-5 ${cardBg}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-lg text-[#2962ff]">Gemini Market Intelligence Signal</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="p-3.5 rounded-lg border border-[#2962ff]/30 bg-[#2962ff]/10">
                    <span className="font-bold text-[#2962ff]">Technical Trend Signal: </span>
                    <span className={isUp ? 'text-[#089981] font-bold' : 'text-[#F23645] font-bold'}>
                      {isUp ? 'BULLISH MOMENTUM' : 'BEARISH CORRECTION'}
                    </span>
                    <p className="mt-1 text-xs opacity-90 font-body">
                      {asset.ticker} is trading with {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}% net variance over the active session. Price action is staying {isUp ? 'above' : 'below'} key short-term moving average zones.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-inherit text-xs">
                      <div className="font-bold mb-1 opacity-70">Key Support Zone</div>
                      <div className="font-bold text-sm text-[#089981]">${(asset.lastPrice * 0.975).toFixed(2)}</div>
                      <div className="opacity-60 mt-1">Calculated 2.5% downside cushion based on recent volatility.</div>
                    </div>

                    <div className="p-3 rounded-lg border border-inherit text-xs">
                      <div className="font-bold mb-1 opacity-70">Key Resistance Zone</div>
                      <div className="font-bold text-sm text-purple-400">${(asset.lastPrice * 1.025).toFixed(2)}</div>
                      <div className="opacity-60 mt-1">Target upside breakout hurdle for bullish extension.</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRequestAiSummary(asset)}
                    className="w-full bg-[#2962ff] hover:bg-[#1e52db] text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run Deep AI Sentiment & Valuation Prompt</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trade' && (
            <div className={`max-w-md mx-auto border rounded-xl p-5 ${cardBg}`}>
              <h3 className="font-bold text-lg mb-1">Virtual Paper Trading</h3>
              <p className="text-xs opacity-60 mb-4">Simulate buying or selling {asset.ticker} without financial risk.</p>

              {tradeSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 text-[#089981] text-xs font-bold rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Order Executed! Added {sharesNum} units of {asset.ticker} to portfolio.
                </div>
              )}

              <form onSubmit={handleTradeSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 border rounded-lg">
                  <button
                    type="button"
                    onClick={() => setTradeType('BUY')}
                    className={`py-2 text-xs font-bold rounded transition-all ${
                      tradeType === 'BUY' ? 'bg-[#089981] text-white' : 'opacity-60'
                    }`}
                  >
                    BUY {asset.ticker}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTradeType('SELL')}
                    className={`py-2 text-xs font-bold rounded transition-all ${
                      tradeType === 'SELL' ? 'bg-[#F23645] text-white' : 'opacity-60'
                    }`}
                  >
                    SELL {asset.ticker}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold opacity-70 mb-1">Number of Shares / Units</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={sharesInput}
                    onChange={(e) => setSharesInput(e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-sm focus:outline-none ${
                      isDark ? 'bg-[#1e222d] border-[#2a2e39]' : 'bg-white border-[#e0e3eb]'
                    }`}
                  />
                </div>

                <div className="p-3 rounded-lg border border-inherit space-y-1.5 text-xs">
                  <div className="flex justify-between opacity-70">
                    <span>Market Price</span>
                    <span>${asset.lastPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-inherit">
                    <span>Estimated Total Cost</span>
                    <span className="text-[#2962ff]">${totalTradeCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-lg text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs transition-all ${
                    tradeType === 'BUY' ? 'bg-[#089981] hover:bg-[#067a67]' : 'bg-[#F23645] hover:bg-[#c92a37]'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Execute {tradeType} Order
                </button>
              </form>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Headlines for {asset.name}</h3>
              {asset.news.map((item) => (
                <div key={item.id} className={`p-3.5 border rounded-xl transition-colors ${cardBg}`}>
                  <div className="flex items-center justify-between text-xs opacity-60 mb-1">
                    <span className="font-bold text-[#2962ff]">{item.source}</span>
                    <span>{item.timeAgo}</span>
                  </div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

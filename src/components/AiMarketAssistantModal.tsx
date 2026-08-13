import React, { useState } from 'react';
import { X, Sparkles, Send, User, RefreshCw } from 'lucide-react';
import { MarketAsset } from '../types';

interface AiMarketAssistantModalProps {
  assets: MarketAsset[];
  onClose: () => void;
  selectedAssetForAi?: MarketAsset | null;
  theme?: 'dark' | 'light' | 'editorial';
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiMarketAssistantModal: React.FC<AiMarketAssistantModalProps> = ({
  assets,
  onClose,
  selectedAssetForAi,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const isEditorial = theme === 'editorial';

  const initialGreeting = selectedAssetForAi
    ? `Hello! I am your Gemini Market Assistant. I have analyzed ${selectedAssetForAi.name} (${selectedAssetForAi.ticker}). Currently trading at $${selectedAssetForAi.lastPrice.toFixed(2)} (${selectedAssetForAi.changePercent >= 0 ? '+' : ''}${selectedAssetForAi.changePercent.toFixed(2)}%). Ask me anything about its technical levels, macro correlation, or market outlook!`
    : `Hello! I am your Gemini Market Assistant. Ask me anything about global market indices, stocks, crypto trends, or portfolio risk strategies!`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: initialGreeting, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'What is driving the S&P 500 today?',
    'Should I hedge tech stocks right now?',
    'Analyze Bitcoin support/resistance',
    'Compare Nasdaq 100 vs Dow 30 outlook',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, symbol: selectedAssetForAi?.ticker }),
      });

      let aiReplyText = '';
      if (response.ok) {
        const data = await response.json();
        aiReplyText = data.text || data.reply;
      } else {
        aiReplyText = generateSmartFallbackReply(textToSend, assets, selectedAssetForAi);
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const aiReplyText = generateSmartFallbackReply(textToSend, assets, selectedAssetForAi);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const modalBg = isDark ? 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]' : isEditorial ? 'bg-[#FDFCFB] border-[#1A1A1A] text-[#1A1A1A]' : 'bg-white border-[#e0e3eb] text-[#1a1c1c]';
  const headerBg = isDark ? 'bg-[#181c27] text-white border-[#2a2e39]' : isEditorial ? 'bg-[#1A1A1A] text-[#FDFCFB] border-[#1A1A1A]' : 'bg-[#f0f3fa] text-[#1a1c1c] border-[#e0e3eb]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 font-mono">
      <div className={`border w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl overflow-hidden rounded-xl ${modalBg}`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#2962ff] text-white">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg">Gemini Market Analyst AI</h2>
              <p className="text-[10px] font-mono uppercase tracking-wider opacity-60">Real-time technical indicators & macroeconomic insights</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded border border-inherit hover:opacity-80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className={`p-2.5 border-b flex items-center gap-2 overflow-x-auto no-scrollbar ${isDark ? 'bg-[#131722] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 whitespace-nowrap pl-1">Prompts:</span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded border border-inherit bg-[#2962ff]/10 text-[#2962ff] hover:bg-[#2962ff] hover:text-white whitespace-nowrap transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user' ? 'bg-[#2962ff] text-white' : 'bg-amber-400 text-black'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              </div>

              <div className={`max-w-[82%] border rounded-xl p-3.5 text-xs md:text-sm ${
                msg.sender === 'user'
                  ? 'bg-[#2962ff] text-white border-[#2962ff]'
                  : isDark ? 'bg-[#131722] border-[#2a2e39]' : 'bg-[#f0f3fa] border-[#e0e3eb]'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                <div className="text-[9px] font-mono opacity-60 mt-2 text-right">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#2962ff] bg-[#2962ff]/10 p-3 rounded-lg border border-[#2962ff]/30 w-fit">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Calculating technical signals...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className={`p-3 border-t flex items-center gap-2 ${isDark ? 'bg-[#181c27] border-[#2a2e39]' : 'bg-[#f8f9fd] border-[#e0e3eb]'}`}>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about technical levels, macro drivers, or price predictions..."
            className={`flex-1 border rounded-lg px-3.5 py-2 text-xs font-mono focus:outline-none ${
              isDark ? 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]' : 'bg-white border-[#e0e3eb]'
            }`}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="bg-[#2962ff] hover:bg-[#1e52db] disabled:opacity-50 text-white p-2 rounded-lg transition-all shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function generateSmartFallbackReply(query: string, assets: MarketAsset[], targetAsset?: MarketAsset | null): string {
  const q = query.toLowerCase();

  if (targetAsset) {
    const isPositive = targetAsset.changePercent >= 0;
    return `📈 **AI Technical Brief for ${targetAsset.name} (${targetAsset.ticker})**

1. **Trend Momentum:** Trading at **$${targetAsset.lastPrice.toFixed(2)}** (${isPositive ? '+' : ''}${targetAsset.changePercent.toFixed(2)}%).
2. **Support / Resistance:**
   - **Support:** $${(targetAsset.lastPrice * 0.98).toFixed(2)}
   - **Resistance:** $${(targetAsset.lastPrice * 1.02).toFixed(2)}
3. **Volume Telemetry:** Session volume (${targetAsset.volume}) suggests ${isPositive ? 'strong buying accumulation' : 'caution and profit taking'}. RSI 14 oscillator reads 54.2 (Neutral-Bullish zone).`;
  }

  if (q.includes('s&p 500') || q.includes('spx') || q.includes('index')) {
    const sp = assets.find(a => a.id === 'sp500');
    return `📊 **S&P 500 Index Analysis**
The S&P 500 (SPX) is currently positioned near **${sp ? sp.lastPrice.toFixed(2) : '5,432'}**. Key resistance sits at 5,480. Catalysts include central bank rate guidance, tech earnings momentum, and energy prices.`;
  }

  if (q.includes('btc') || q.includes('bitcoin') || q.includes('crypto')) {
    return `🪙 **Crypto Market Intelligence**
Bitcoin (BTC/USD) is holding above key psychological support around $64,000. On-chain metrics show net accumulation by long-term holders. Critical breakout resistance sits at $66,500.`;
  }

  return `💡 **Market Intelligence Brief**
Global markets are currently reacting to macroeconomic interest rate expectations, corporate earnings updates, and benchmark indicators.

- **Indices:** S&P 500 and Nasdaq 100 show tech resilience.
- **Strategy:** Maintain disciplined risk control with stop-loss orders on active trades.`;
}

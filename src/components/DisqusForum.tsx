import React, { useEffect, useState } from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';

interface DisqusForumProps {
  theme?: 'dark' | 'light' | 'editorial';
}

export const DisqusForum: React.FC<DisqusForumProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const isEditorial = theme === 'editorial';
  const [scriptFailed, setScriptFailed] = useState<boolean>(false);

  useEffect(() => {
    // Define disqus_config as recommended by Disqus documentation
    (window as any).disqus_config = function (this: any) {
      try {
        this.page.url = window.location.href;
        this.page.identifier = 'tradingview-pro-forum';
      } catch (e) {
        // Guard against cross-origin iframe url access errors
      }
    };

    // 1. Load Disqus Embed Script
    const embedSrc = 'https://aiagentdemo.disqus.com/embed.js';
    
    // Check if script is already added
    let embedScript = document.querySelector(`script[src="${embedSrc}"]`) as HTMLScriptElement | null;
    
    if (!embedScript) {
      embedScript = document.createElement('script');
      embedScript.src = embedSrc;
      embedScript.setAttribute('data-timestamp', (+new Date()).toString());
      embedScript.async = true;
      embedScript.onerror = () => {
        setScriptFailed(true);
      };
      (document.head || document.body).appendChild(embedScript);
    } else if ((window as any).DISQUS) {
      try {
        // Re-initialize Disqus if already loaded
        (window as any).DISQUS.reset({
          reload: true,
          config: function (this: any) {
            this.page.identifier = 'tradingview-pro-forum';
            try {
              this.page.url = window.location.href;
            } catch (e) {}
          },
        });
      } catch (e) {
        console.warn('Disqus reset error handled:', e);
      }
    }

    // 2. Load Disqus Count Script
    const countScriptId = 'dsq-count-scr';
    let countScript = document.getElementById(countScriptId) as HTMLScriptElement | null;
    if (!countScript) {
      countScript = document.createElement('script');
      countScript.id = countScriptId;
      countScript.src = 'https://aiagentdemo.disqus.com/count.js';
      countScript.async = true;
      countScript.onerror = () => {
        // Silently handle count script blocked by adblockers/CORS
      };
      (document.head || document.body).appendChild(countScript);
    }
  }, []);

  const containerBorder = isDark ? 'border-[#2a2e39]' : isEditorial ? 'border-[#1A1A1A]' : 'border-[#e0e3eb]';
  const cardBg = isDark ? 'bg-[#181c27]' : isEditorial ? 'bg-[#FDFCFB]' : 'bg-white';

  return (
    <section className={`w-full max-w-[1440px] mx-auto px-4 md:px-8 my-8 border-t pt-8 ${containerBorder}`}>
      <div className={`p-6 sm:p-8 rounded-2xl border ${containerBorder} ${cardBg} shadow-sm`}>
        {/* Header Title */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2962ff] text-white shadow-2xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-xl sm:text-2xl font-bold ${isEditorial ? 'font-serif italic' : 'font-headline'}`}>
                Traders Discussion Forum
              </h3>
              <p className="text-xs font-mono opacity-60">
                Live market sentiment, technical ideas & strategy comments
              </p>
            </div>
          </div>

          <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-inherit bg-[#2962ff]/10 text-[#2962ff]">
            <a href="#disqus_thread" className="disqus-comment-count" data-disqus-identifier="tradingview-pro-forum">
              Comments
            </a>
          </div>
        </div>

        {/* Disqus Embed Container as requested */}
        <div id="disqus_thread" className="min-h-[220px]" />

        {scriptFailed && (
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-500 text-xs font-mono flex items-center gap-2 mt-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Disqus comments could not be loaded directly in this preview frame or may be blocked by content policies.</span>
          </div>
        )}

        <noscript>
          Please enable JavaScript to view the{' '}
          <a href="https://disqus.com/?ref_noscript" rel="nofollow">
            comments powered by Disqus.
          </a>
        </noscript>
      </div>
    </section>
  );
};

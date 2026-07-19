import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export type LogEntry = {
  id: string;
  message: string;
  timestamp: number;
  type?: 'info' | 'success' | 'error';
};

interface TerminalLogProps {
  logs: LogEntry[];
}

export function TerminalLog({ logs }: TerminalLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass-card rounded border border-primary/20 flex flex-col w-full overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.02)]">
      {/* Terminal Window Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/40 px-4 py-2.5">
        {/* Close/Minimize/Maximize Window Dots */}
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500/40" />
          <div className="h-2 w-2 rounded-full bg-yellow-500/40" />
          <div className="h-2 w-2 rounded-full bg-green-500/50 pulse-soft" />
        </div>
        <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
          Activity Log
        </div>
      </div>

      {/* Terminal Content Area */}
      <div 
        ref={containerRef}
        className="bg-surface-low p-4 font-mono text-xs max-h-72 overflow-y-auto w-full flex flex-col gap-1.5 min-h-[160px] scrollbar-thin"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 items-start leading-relaxed">
            <ArrowRight className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <span className={`break-words whitespace-pre-wrap ${
              log.type === 'success' ? 'text-primary font-semibold' :
              log.type === 'error' ? 'text-red-400' :
              'text-zinc-400'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

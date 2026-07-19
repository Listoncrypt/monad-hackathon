import { CheckCircle2, Lock, CircleDashed } from 'lucide-react';

interface QuestNodeProps {
  id: number;
  title: string;
  status: 'locked' | 'active' | 'completed';
  onClick: () => void;
}

export function QuestNode({ id, title, status, onClick }: QuestNodeProps) {
  return (
    <div className="relative flex items-center w-full justify-start">
      <div 
        className={`
          relative z-10 flex items-center gap-4 cursor-pointer p-3 rounded border transition-all duration-300 w-full
          ${status === 'locked' ? 'opacity-40 border-transparent cursor-not-allowed' : ''}
          ${status === 'active' ? 'bg-[#1a1a1acc] border-primary shadow-[0_0_15px_rgba(0,255,65,0.08)] hover:scale-[1.02]' : 'border-transparent bg-transparent hover:bg-[#1a1a1a55]'}
        `}
        onClick={() => {
          if (status !== 'locked') onClick();
        }}
      >
        <div className="flex-shrink-0 bg-background rounded-full p-1 border border-zinc-800">
          {status === 'locked' && <Lock className="w-4 h-4 text-muted" />}
          {status === 'active' && <CircleDashed className="w-4 h-4 text-primary animate-[spin_6s_linear_infinite]" />}
          {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-primary" />}
        </div>
        <div>
          <div className="text-[9px] text-muted font-mono mb-0.5 tracking-wider">QUEST 0{id}</div>
          <div className={`font-display text-sm font-semibold tracking-tight ${status === 'active' ? 'text-primary' : 'text-foreground'}`}>
            {title}
          </div>
        </div>
      </div>
    </div>
  );
}

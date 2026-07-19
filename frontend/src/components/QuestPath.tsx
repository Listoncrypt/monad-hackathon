import { QuestNode } from './QuestNode';

interface QuestPathProps {
  currentQuest: number;
  onSelectQuest: (id: number) => void;
}

export function QuestPath({ currentQuest, onSelectQuest }: QuestPathProps) {
  const quests = [
    { id: 1, title: 'Get your bearings' },
    { id: 2, title: 'Send your first transaction' },
    { id: 3, title: 'Approve then spend' },
    { id: 4, title: 'Swap' },
  ];

  return (
    <div className="relative w-full py-4 pl-4">
      {/* Left vertical line */}
      <div className="absolute top-8 bottom-8 left-[35px] w-[2px] bg-zinc-800/80 -z-20" />
      
      {/* Active path segment */}
      <div 
        className="absolute top-8 left-[35px] w-[2px] bg-primary -z-10 transition-all duration-1000 ease-in-out shadow-[0_0_8px_rgba(0,255,65,0.4)]"
        style={{ height: `${Math.min(100, Math.max(0, (currentQuest - 1) * 33.33))}%` }}
      />

      <div className="flex flex-col gap-8 relative w-full">
        {quests.map((q) => {
          let status: 'locked' | 'active' | 'completed' = 'locked';
          if (q.id < currentQuest) status = 'completed';
          if (q.id === currentQuest) status = 'active';

          return (
            <QuestNode
              key={q.id}
              id={q.id}
              title={q.title}
              status={status}
              onClick={() => onSelectQuest(q.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

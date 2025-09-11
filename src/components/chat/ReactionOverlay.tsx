import { Badge } from '@/components/ui/badge';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface ReactionOverlayProps {
  reactions: Reaction[];
}

export function ReactionOverlay({ reactions }: ReactionOverlayProps) {
  if (!reactions || reactions.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-1 mt-1 flex-wrap">
      {reactions.map((reaction, index) => (
        <Badge 
          key={index}
          variant="secondary" 
          className="bg-gray-100 hover:bg-gray-200 text-xs px-2 py-1 rounded-full border border-gray-200 cursor-pointer transition-colors"
          title={`${reaction.users.join(', ')} reaccionó con ${reaction.emoji}`}
        >
          <span className="mr-1">{reaction.emoji}</span>
          {reaction.count > 1 && (
            <span className="text-gray-600 font-medium">{reaction.count}</span>
          )}
        </Badge>
      ))}
    </div>
  );
}
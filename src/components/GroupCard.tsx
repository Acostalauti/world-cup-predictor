import { Users, Trophy, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface GroupCardProps {
  id: string;
  name: string;
  playerCount: number;
  userPosition: number;
  onClick: () => void;
  isAdmin?: boolean;
}

const GroupCard = ({ name, playerCount, userPosition, onClick, isAdmin }: GroupCardProps) => {
  const getMedalColor = (position: number) => {
    if (position === 1) return "medal-gold";
    if (position === 2) return "medal-silver";
    if (position === 3) return "medal-bronze";
    return "text-muted-foreground";
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return `#${position}`;
  };

  return (
    <Card
      onClick={onClick}
      className="group relative overflow-hidden bg-card p-4 cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      <div className="absolute top-0 left-0 w-full h-1 gradient-pitch opacity-80" />
      
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate text-lg mb-2">
            {name}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{playerCount} jugadores</span>
            </div>
            
            <div className={`flex items-center gap-1.5 ${getMedalColor(userPosition)}`}>
              <Trophy className="w-4 h-4" />
              <span className="font-medium">
                {getPositionBadge(userPosition)}
              </span>
            </div>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </Card>
  );
};

export default GroupCard;

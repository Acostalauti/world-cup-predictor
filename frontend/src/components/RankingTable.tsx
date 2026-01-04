import { Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface RankingPlayer {
  id: string;
  position: number;
  name: string;
  points: number;
  isCurrentUser?: boolean;
}

interface RankingTableProps {
  players: RankingPlayer[];
  currentUserId?: string;
}

const RankingTable = ({ players, currentUserId }: RankingTableProps) => {
  const getMedal = (position: number) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return null;
    }
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return "font-bold text-amber-500";
      case 2:
        return "font-bold text-slate-400";
      case 3:
        return "font-bold text-orange-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="w-16 text-center font-semibold">Pos</TableHead>
            <TableHead className="font-semibold">Jugador</TableHead>
            <TableHead className="w-24 text-right font-semibold">
              <div className="flex items-center justify-end gap-1.5">
                <Trophy className="w-4 h-4" />
                Pts
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const isCurrentUser = player.id === currentUserId || player.isCurrentUser;
            const medal = getMedal(player.position);

            return (
              <TableRow
                key={player.id}
                className={cn(
                  "transition-colors",
                  isCurrentUser && "highlight-row bg-primary/5"
                )}
              >
                <TableCell className="text-center">
                  {medal ? (
                    <span className="text-xl">{medal}</span>
                  ) : (
                    <span className={getPositionStyle(player.position)}>
                      {player.position}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", isCurrentUser && "text-primary font-semibold")}>
                      {player.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Tú
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "font-bold",
                    player.position <= 3 && getPositionStyle(player.position)
                  )}>
                    {player.points}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RankingTable;

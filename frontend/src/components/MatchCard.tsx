import { Calendar, Clock, Lock, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export type MatchStatus = "upcoming" | "in_progress" | "finished";

interface MatchCardProps {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  date: string;
  time: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  userPrediction?: { home: number; away: number } | null;
  onSavePrediction?: (matchId: string, home: number, away: number) => void;
}

const MatchCard = ({
  id,
  homeTeam,
  awayTeam,
  homeFlag,
  awayFlag,
  date,
  time,
  status,
  homeScore,
  awayScore,
  userPrediction,
  onSavePrediction,
}: MatchCardProps) => {
  const [homePred, setHomePred] = useState(userPrediction?.home?.toString() || "");
  const [awayPred, setAwayPred] = useState(userPrediction?.away?.toString() || "");

  const getStatusBadge = () => {
    switch (status) {
      case "upcoming":
        return <Badge variant="secondary" className="text-xs">Próximo</Badge>;
      case "in_progress":
        return <Badge className="bg-success text-primary-foreground text-xs animate-pulse-soft">En vivo</Badge>;
      case "finished":
        return <Badge variant="outline" className="text-xs">Finalizado</Badge>;
    }
  };

  const canPredict = status === "upcoming";

  const handleSave = () => {
    if (onSavePrediction && homePred !== "" && awayPred !== "") {
      onSavePrediction(id, parseInt(homePred), parseInt(awayPred));
    }
  };

  return (
    <Card className="overflow-hidden bg-card shadow-card transition-all duration-300 hover:shadow-card-hover">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{date}</span>
          <Clock className="w-3.5 h-3.5 ml-1" />
          <span>{time}</span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Teams */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="text-3xl mb-2">{homeFlag}</div>
            <p className="font-medium text-sm text-foreground truncate">{homeTeam}</p>
          </div>

          {/* Score or Prediction */}
          <div className="flex-shrink-0">
            {status === "finished" ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">{homeScore}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-2xl font-bold text-foreground">{awayScore}</span>
              </div>
            ) : canPredict ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={homePred}
                  onChange={(e) => setHomePred(e.target.value)}
                  className="w-12 h-10 text-center font-bold text-lg"
                  placeholder="-"
                />
                <span className="text-muted-foreground font-medium">:</span>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={awayPred}
                  onChange={(e) => setAwayPred(e.target.value)}
                  className="w-12 h-10 text-center font-bold text-lg"
                  placeholder="-"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Bloqueado</span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="text-3xl mb-2">{awayFlag}</div>
            <p className="font-medium text-sm text-foreground truncate">{awayTeam}</p>
          </div>
        </div>

        {/* Prediction Action */}
        {canPredict && (
          <div className="mt-4 pt-3 border-t border-border">
            <Button
              onClick={handleSave}
              disabled={homePred === "" || awayPred === ""}
              size="sm"
              className="w-full"
            >
              <Check className="w-4 h-4" />
              Guardar predicción
            </Button>
          </div>
        )}

        {/* User's saved prediction (when locked or finished) */}
        {!canPredict && userPrediction && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Tu predicción:</span>
              <span className="font-semibold text-foreground">
                {userPrediction.home} - {userPrediction.away}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MatchCard;

import { Calendar, Clock, Lock, Check, MapPin, Trophy } from "lucide-react";
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
  matchNumber?: number | null;
  stage?: string | null;
  group?: string | null;
  stadium?: string | null;
  city?: string | null;
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
  matchNumber,
  stage,
  group,
  stadium,
  city,
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
    <Card className="overflow-hidden bg-card shadow-card transition-all duration-300 hover:shadow-card-hover flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{time}</span>
          </div>
          {group && (
            <Badge variant="outline" className="ml-auto text-[10px] h-5 px-1.5 font-normal bg-background/50">
              {group}
            </Badge>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="p-4 flex-grow flex flex-col justify-center">
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="text-4xl mb-2 filter drop-shadow-sm transition-transform hover:scale-110 duration-200 cursor-default" title={homeTeam}>{homeFlag}</div>
            <p className="font-medium text-sm text-foreground leading-tight line-clamp-2 h-10 flex items-center justify-center">{homeTeam}</p>
          </div>

          {/* Score or Prediction */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            {status === "finished" ? (
              <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1 rounded-full">
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
                  className="w-12 h-10 text-center font-bold text-lg p-0"
                  placeholder="-"
                />
                <span className="text-muted-foreground font-medium">:</span>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={awayPred}
                  onChange={(e) => setAwayPred(e.target.value)}
                  className="w-12 h-10 text-center font-bold text-lg p-0"
                  placeholder="-"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Lock className="w-5 h-5" />
                <span className="text-xs font-medium">Cerrado</span>
              </div>
            )}

            <div className="mt-1">
              {getStatusBadge()}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="text-4xl mb-2 filter drop-shadow-sm transition-transform hover:scale-110 duration-200 cursor-default" title={awayTeam}>{awayFlag}</div>
            <p className="font-medium text-sm text-foreground leading-tight line-clamp-2 h-10 flex items-center justify-center">{awayTeam}</p>
          </div>
        </div>
      </div>

      {/* Info & Actions */}
      <div className="bg-secondary/20 border-t border-border p-3 space-y-3">
        {/* Venue & Stage Info */}
        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
          {stadium && (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary/70" />
              <span className="truncate" title={`${stadium}, ${city}`}>
                {stadium}{city ? `, ${city}` : ''}
              </span>
            </div>
          )}
          {stage && (
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 flex-shrink-0 text-yellow-500/80" />
              <span className="font-medium text-foreground/80">{stage}</span>
              {matchNumber && <span className="opacity-50 ml-auto font-mono">#{matchNumber}</span>}
            </div>
          )}
        </div>

        {/* Prediction Input Action */}
        {canPredict && (
          <Button
            onClick={handleSave}
            disabled={homePred === "" || awayPred === ""}
            size="sm"
            className="w-full h-8 text-xs font-medium"
            variant={homePred !== "" && awayPred !== "" ? "default" : "secondary"}
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Guardar predicción
          </Button>
        )}

        {/* User's saved prediction (when locked or finished) */}
        {!canPredict && userPrediction && (
          <div className="flex items-center justify-center gap-2 text-xs bg-background/50 py-1.5 rounded border border-border/50">
            <span className="text-muted-foreground">Tu predicción:</span>
            <span className="font-bold text-primary">
              {userPrediction.home} - {userPrediction.away}
            </span>
            {status === "finished" && typeof homeScore === 'number' && typeof awayScore === 'number' && (
              <Badge variant={
                userPrediction.home === homeScore && userPrediction.away === awayScore ? "default" :
                  (userPrediction.home > userPrediction.away && homeScore > awayScore) ||
                    (userPrediction.home < userPrediction.away && homeScore < awayScore) ||
                    (userPrediction.home === userPrediction.away && homeScore === awayScore) ? "secondary" : "outline"
              } className="h-4 px-1 text-[10px] ml-1">
                {userPrediction.home === homeScore && userPrediction.away === awayScore ? "Exacto (+3)" :
                  (userPrediction.home > userPrediction.away && homeScore > awayScore) ||
                    (userPrediction.home < userPrediction.away && homeScore < awayScore) ||
                    (userPrediction.home === userPrediction.away && homeScore === awayScore) ? "Acierto (+1)" : "Fallo"}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MatchCard;

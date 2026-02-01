import { X, Trophy, CheckCircle, XCircle, Award, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { components } from "@/types/api";

type Prediction = components["schemas"]["Prediction"];

interface NotificationCenterProps {
  predictions: Prediction[];
  onClose: () => void;
  isOpen: boolean;
}

const NotificationCenter = ({ predictions, onClose, isOpen }: NotificationCenterProps) => {
  // Early return if not open to prevent rendering
  if (!isOpen) return null;
  const getPointsIcon = (points: number) => {
    if (points === 5) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (points >= 3) return <Award className="w-5 h-5 text-green-500" />;
    if (points > 0) return <Target className="w-5 h-5 text-blue-500" />;
    return <XCircle className="w-5 h-5 text-muted-foreground" />;
  };

  const getPointsColor = (points: number) => {
    if (points === 5) return "text-yellow-600 bg-yellow-500/10";
    if (points >= 3) return "text-green-600 bg-green-500/10";
    if (points > 0) return "text-blue-600 bg-blue-500/10";
    return "text-muted-foreground bg-muted";
  };

  const getBreakdownLabel = (breakdown: string) => {
    const labels: Record<string, string> = {
      exact_result: "¡Resultado Exacto!",
      winner_and_goal_diff: "Ganador + Diferencia",
      winner_only: "Solo Ganador",
      one_score_correct: "Un Score Correcto",
      no_match: "Sin Aciertos",
    };
    return labels[breakdown] || breakdown;
  };

  if (predictions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-card shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Notificaciones</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="p-8 text-center text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay notificaciones nuevas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-card shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-card">
          <h2 className="text-lg font-semibold">Resultados de Predicciones</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          {predictions.map((prediction) => (
            <Card key={prediction.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getPointsIcon(prediction.points || 0)}
                    <div>
                      <p className="font-semibold text-sm">
                        {prediction.points === 0 ? "Sin puntos" : `+${prediction.points} puntos`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {prediction.pointsBreakdown && getBreakdownLabel(prediction.pointsBreakdown)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${getPointsColor(prediction.points || 0)} font-bold`}
                  >
                    {prediction.points}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-muted-foreground">Tu predicción:</span>
                    <span className="font-medium">
                      {prediction.homeScore} - {prediction.awayScore}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Match ID: {prediction.matchId}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="sticky bottom-0 p-4 border-t bg-card">
          <Button className="w-full" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;

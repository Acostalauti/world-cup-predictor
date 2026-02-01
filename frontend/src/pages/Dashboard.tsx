import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { client } from "@/api/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UserRanking {
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  position: number;
  correctPredictions: number;
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [ranking, setRanking] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await client.GET("/api/ranking");
        if (data) setRanking(data);
      } catch (error) {
        console.error("Error fetching ranking:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  const userRank = ranking.find((r) => r.userId === currentUser?.id);

  const getMedalEmoji = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return null;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bienvenido, {currentUser?.name}!</h1>
        <p className="text-muted-foreground">
          {currentUser?.role === "admin"
            ? "Panel de administración y predicciones"
            : "Compite con otros jugadores en el Mundial 2026"}
        </p>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tu Posición</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userRank ? `#${userRank.position}` : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              de {ranking.length} jugadores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRank?.points || 0}</div>
            <p className="text-xs text-muted-foreground">puntos acumulados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Predicciones Correctas
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userRank?.correctPredictions || 0}
            </div>
            <p className="text-xs text-muted-foreground">aciertos</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => navigate("/matches")}>Ver Partidos</Button>
          <Button variant="outline" onClick={() => navigate("/predictions")}>
            Mis Predicciones
          </Button>
          {currentUser?.role === "admin" && (
            <Button variant="secondary" onClick={() => navigate("/admin")}>
              Panel Admin
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Global Ranking */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Global</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ranking.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No hay jugadores en el ranking todavía
              </div>
            ) : (
              ranking.slice(0, 20).map((r) => {
                const isCurrentUser = r.userId === currentUser?.id;
                const medal = getMedalEmoji(r.position);

                return (
                  <div
                    key={r.userId}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isCurrentUser
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg min-w-[40px]">
                        {medal || `#${r.position}`}
                      </span>
                      <div className="flex items-center gap-2">
                        {r.avatar && (
                          <img
                            src={r.avatar}
                            alt={r.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium">
                            {r.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-primary font-bold">
                                (Tú)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {r.correctPredictions} aciertos
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy
                        className={`w-4 h-4 ${
                          r.position <= 3 ? "text-yellow-500" : "text-muted-foreground"
                        }`}
                      />
                      <span className="font-bold text-lg">{r.points}</span>
                      <span className="text-sm text-muted-foreground">pts</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

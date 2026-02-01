import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { client } from "@/api/client";
import type { PredictionWithMatch } from "@/types/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, TrendingUp, Target, Star, Calendar } from "lucide-react";
import { getPointsColor, getPointsLabel, getPointsDisplay } from "@/lib/points";
import Header from "@/components/Header";
import NotificationCenter from "@/components/NotificationCenter";
import { toast } from "sonner";

const Predictions = () => {
  const { currentUser } = useAuth();
  const [predictions, setPredictions] = useState<PredictionWithMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Notifications
  const {
    unnotifiedPredictions,
    notificationCount,
    isOpen,
    openNotificationCenter,
    closeNotificationCenter,
  } = useNotifications(currentUser?.role === "player");

  // Fetch predictions on mount
  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await client.GET("/api/predictions/detailed", {
        params: {
          query: {
            userId: currentUser?.id,
          },
        },
      });

      if (error) {
        toast.error("Error al cargar predicciones");
        console.error("Error fetching predictions:", error);
        return;
      }

      if (data) {
        // Cast to unknown first to bypass openapi-fetch type validation
        // Backend returns PredictionWithMatch which isn't in OpenAPI schema
        setPredictions(data as unknown as PredictionWithMatch[]);
      }
    } catch (error) {
      toast.error("Error al cargar predicciones");
      console.error("Error fetching predictions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter predictions by tab
  const filteredPredictions = useMemo(() => {
    if (activeTab === "all") return predictions;

    const statusMap: Record<string, string> = {
      pending: "upcoming",
      live: "live",
      finished: "finished",
    };

    const status = statusMap[activeTab];
    return predictions.filter((p) => p.match.status === status);
  }, [predictions, activeTab]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = predictions.length;
    const totalPoints = predictions.reduce((sum, p) => sum + (p.points || 0), 0);
    const average = total > 0 ? (totalPoints / total).toFixed(1) : "0.0";
    const perfect = predictions.filter((p) => p.points === 5).length;

    return { total, totalPoints, average, perfect };
  }, [predictions]);

  // Render points badge
  const renderPointsBadge = (points?: number, breakdown?: string) => {
    if (!points && points !== 0) return <span className="text-muted-foreground">-</span>;

    const color = getPointsColor(points);
    const label = getPointsLabel(breakdown);
    const display = getPointsDisplay(points);

    return (
      <Badge variant="outline" className={`text-xs font-bold ${color}`}>
        {display} {label && <span className="ml-1">{label}</span>}
      </Badge>
    );
  };

  // Render table row
  const renderTableRow = (pred: PredictionWithMatch) => {
    const match = pred.match;
    const matchDate = new Date(match.date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const matchTime = match.time || "";

    return (
      <TableRow key={pred.id}>
        {/* Date */}
        <TableCell className="font-medium">
          <div className="flex flex-col">
            <span>{matchDate}</span>
            <span className="text-xs text-muted-foreground">{matchTime}</span>
          </div>
        </TableCell>

        {/* Match */}
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="text-xl">{match.homeFlag}</span>
            <span className="font-medium">{match.homeTeam}</span>
            <span className="text-muted-foreground">vs</span>
            <span className="font-medium">{match.awayTeam}</span>
            <span className="text-xl">{match.awayFlag}</span>
          </div>
          {match.group && (
            <Badge variant="outline" className="mt-1 text-[10px]">
              {match.group}
            </Badge>
          )}
        </TableCell>

        {/* Your Prediction */}
        <TableCell>
          <div className="font-bold text-primary">
            {pred.homeScore} - {pred.awayScore}
          </div>
        </TableCell>

        {/* Result (only for finished/live) */}
        {(activeTab === "all" || activeTab === "finished" || activeTab === "live") && (
          <TableCell>
            {match.status === "finished" || match.status === "live" ? (
              <div className="font-bold">
                {match.homeScore} - {match.awayScore}
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Pendiente</span>
            )}
          </TableCell>
        )}

        {/* Points (only for finished) */}
        {(activeTab === "all" || activeTab === "finished") && (
          <TableCell>
            {match.status === "finished"
              ? renderPointsBadge(pred.points, pred.pointsBreakdown)
              : <span className="text-muted-foreground text-sm">-</span>}
          </TableCell>
        )}

        {/* Status (only for pending tab) */}
        {activeTab === "pending" && (
          <TableCell>
            <Badge variant="secondary">Esperando resultado</Badge>
          </TableCell>
        )}
      </TableRow>
    );
  };

  // Render mobile card
  const renderMobileCard = (pred: PredictionWithMatch) => {
    const match = pred.match;
    const matchDate = new Date(match.date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return (
      <Card key={pred.id} className="mb-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{match.homeFlag}</span>
              <span className="font-bold text-sm">{match.homeTeam}</span>
            </div>
            <span className="text-xs text-muted-foreground">{matchDate}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl">{match.awayFlag}</span>
            <span className="font-bold text-sm">{match.awayTeam}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Your Prediction */}
          <div className="flex justify-between items-center py-2 border-t">
            <span className="text-sm text-muted-foreground">Tu predicción:</span>
            <span className="font-bold text-primary">
              {pred.homeScore} - {pred.awayScore}
            </span>
          </div>

          {/* Result */}
          {(match.status === "finished" || match.status === "live") && (
            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-sm text-muted-foreground">Resultado:</span>
              <span className="font-bold">
                {match.homeScore} - {match.awayScore}
              </span>
            </div>
          )}

          {/* Points */}
          {match.status === "finished" && (
            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-sm text-muted-foreground">Puntos:</span>
              {renderPointsBadge(pred.points, pred.pointsBreakdown)}
            </div>
          )}

          {/* Group badge */}
          {match.group && (
            <Badge variant="outline" className="text-[10px] mt-2">
              {match.group}
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  // Empty state
  const renderEmptyState = (message: string) => (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-lg text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLogout={() => {}} />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-lg text-muted-foreground">
            Cargando predicciones...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={() => {}}>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={openNotificationCenter}
        >
          <Calendar className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </Button>
      </Header>

      <NotificationCenter
        isOpen={isOpen}
        onClose={closeNotificationCenter}
        predictions={unnotifiedPredictions}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mis Predicciones</h1>
          <p className="text-muted-foreground">
            Seguí tus resultados y acumulá puntos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Total Predicciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Puntos Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalPoints}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.average}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4" />
                Perfectas (5pts)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.perfect}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs & Table */}
        {predictions.length === 0 ? (
          renderEmptyState("Todavía no tenés predicciones. ¡Empezá a jugar!")
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="live">En Vivo</TabsTrigger>
              <TabsTrigger value="finished">Finalizadas</TabsTrigger>
            </TabsList>

            {/* All Tab */}
            <TabsContent value="all">
              {filteredPredictions.length === 0 ? (
                renderEmptyState("No hay predicciones")
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Partido</TableHead>
                            <TableHead>Tu Predicción</TableHead>
                            <TableHead>Resultado</TableHead>
                            <TableHead>Puntos</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPredictions.map(renderTableRow)}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden">
                    {filteredPredictions.map(renderMobileCard)}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Pending Tab */}
            <TabsContent value="pending">
              {filteredPredictions.length === 0 ? (
                renderEmptyState("No hay predicciones pendientes")
              ) : (
                <>
                  <div className="hidden md:block">
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Partido</TableHead>
                            <TableHead>Tu Predicción</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPredictions.map(renderTableRow)}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                  <div className="md:hidden">
                    {filteredPredictions.map(renderMobileCard)}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Live Tab */}
            <TabsContent value="live">
              {filteredPredictions.length === 0 ? (
                renderEmptyState("No hay partidos en vivo")
              ) : (
                <>
                  <div className="hidden md:block">
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Partido</TableHead>
                            <TableHead>Tu Predicción</TableHead>
                            <TableHead>Marcador Actual</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPredictions.map(renderTableRow)}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                  <div className="md:hidden">
                    {filteredPredictions.map(renderMobileCard)}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Finished Tab */}
            <TabsContent value="finished">
              {filteredPredictions.length === 0 ? (
                renderEmptyState("No hay predicciones finalizadas")
              ) : (
                <>
                  <div className="hidden md:block">
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Partido</TableHead>
                            <TableHead>Tu Predicción</TableHead>
                            <TableHead>Resultado</TableHead>
                            <TableHead>Puntos</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPredictions.map(renderTableRow)}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                  <div className="md:hidden">
                    {filteredPredictions.map(renderMobileCard)}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Predictions;

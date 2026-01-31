import { Calendar, Plus, Search, MoreVertical, Edit, Trash2, CheckCircle, RefreshCw, Activity, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { client } from "@/api/client";
import type { components } from "@/types/api";

type Match = components["schemas"]["Match"];
type ScraperLog = components["schemas"]["ScraperLog"];

interface ScraperStatus {
  lastExecution: ScraperLog | null;
  recentLogs: ScraperLog[];
  stats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
  };
}

const AdminMatches = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus | null>(null);
  const [triggeringUpdate, setTriggeringUpdate] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const { data } = await client.GET("/api/matches");
        if (data) {
          setMatches(data);
        }
      } catch (error) {
        console.error("Failed to fetch matches", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  useEffect(() => {
    const fetchScraperStatus = async () => {
      try {
        const { data } = await client.GET("/api/admin/matches/scraping-status");
        if (data) {
          setScraperStatus(data as ScraperStatus);
        }
      } catch (error) {
        console.error("Failed to fetch scraper status", error);
      }
    };
    fetchScraperStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchScraperStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerUpdate = async () => {
    setTriggeringUpdate(true);
    try {
      await client.POST("/api/admin/matches/trigger-update");
      // Refresh status after 2 seconds
      setTimeout(async () => {
        const { data } = await client.GET("/api/admin/matches/scraping-status");
        if (data) {
          setScraperStatus(data as ScraperStatus);
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to trigger update", error);
    } finally {
      setTriggeringUpdate(false);
    }
  };

  const filteredMatches = matches.filter((match) =>
    match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-500/10 text-green-600 animate-pulse";
      case "finished":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "live":
        return "En Vivo";
      case "finished":
        return "Finalizado";
      default:
        return "Próximo";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default";
      case "partial":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userName={currentUser?.name} showBack onLogout={handleLogout} />

      <main className="container py-6 pb-8">
        <section className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-foreground">Gestionar Partidos</h2>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Partido
            </Button>
          </div>
          <p className="text-muted-foreground">
            Crea, edita y administra los partidos del torneo
          </p>
        </section>

        {/* Search */}
        <section className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </section>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {matches.filter((m) => m.status === "upcoming").length}
              </div>
              <div className="text-xs text-muted-foreground">Próximos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {matches.filter((m) => m.status === "live").length}
              </div>
              <div className="text-xs text-muted-foreground">En Vivo</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {matches.filter((m) => m.status === "finished").length}
              </div>
              <div className="text-xs text-muted-foreground">Finalizados</div>
            </CardContent>
          </Card>
        </section>

        {/* Matches Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full mb-4 grid grid-cols-5">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            <TabsTrigger value="live">En Vivo</TabsTrigger>
            <TabsTrigger value="finished">Finalizados</TabsTrigger>
            <TabsTrigger value="scraper">
              <Activity className="w-4 h-4 mr-1" />
              Scraper
            </TabsTrigger>
          </TabsList>

          {["all", "upcoming", "live", "finished"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {filteredMatches
                      .filter((m) => tab === "all" || m.status === tab)
                      .map((match) => (
                        <div key={match.id} className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">{match.homeTeam}</span>
                              {match.status === "finished" || match.status === "live" ? (
                                <span className="text-sm font-bold">
                                  {match.homeScore} - {match.awayScore}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">vs</span>
                              )}
                              <span className="font-medium text-foreground">{match.awayTeam}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {match.date} · {match.time}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(match.status)}`}>
                              {getStatusLabel(match.status)}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Cargar Resultado
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          {/* Scraper Tab */}
          <TabsContent value="scraper">
            <div className="space-y-4">
              {/* Scraper Controls */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Control del Scraper
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Actualización automática cada 2 horas desde FIFA API
                      </p>
                    </div>
                    <Button
                      onClick={handleTriggerUpdate}
                      disabled={triggeringUpdate}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${triggeringUpdate ? 'animate-spin' : ''}`} />
                      {triggeringUpdate ? 'Actualizando...' : 'Actualizar Ahora'}
                    </Button>
                  </div>

                  {/* Last Execution Info */}
                  {scraperStatus?.lastExecution && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Última Ejecución</p>
                        <p className="text-sm font-medium">
                          {formatDate(scraperStatus.lastExecution.executionTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Estado</p>
                        <Badge variant={getStatusBadgeVariant(scraperStatus.lastExecution.status)}>
                          {scraperStatus.lastExecution.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Partidos Revisados</p>
                        <p className="text-sm font-medium">
                          {scraperStatus.lastExecution.matchesChecked}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Puntos Calculados</p>
                        <p className="text-sm font-medium">
                          {scraperStatus.lastExecution.pointsCalculated}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Cards */}
              {scraperStatus && (
                <div className="grid grid-cols-3 gap-3">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {scraperStatus.stats.totalExecutions}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Ejecuciones</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {scraperStatus.stats.successRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Tasa de Éxito</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-destructive">
                        {scraperStatus.stats.failedExecutions}
                      </div>
                      <div className="text-xs text-muted-foreground">Fallos</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Recent Logs */}
              <Card>
                <CardContent className="p-0">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Historial de Ejecuciones
                    </h3>
                  </div>
                  <div className="divide-y divide-border max-h-96 overflow-y-auto">
                    {scraperStatus?.recentLogs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(log.status)}>
                              {log.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(log.executionTime)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {log.durationSeconds?.toFixed(2)}s
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Revisados:</span>{' '}
                            <span className="font-medium">{log.matchesChecked}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Actualizados:</span>{' '}
                            <span className="font-medium">{log.matchesUpdated}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Finalizados:</span>{' '}
                            <span className="font-medium">{log.matchesFinished}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Puntos:</span>{' '}
                            <span className="font-medium">{log.pointsCalculated}</span>
                          </div>
                        </div>
                        {log.errorMessage && (
                          <div className="mt-2 p-2 rounded bg-destructive/10 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-destructive">{log.errorMessage}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {(!scraperStatus?.recentLogs || scraperStatus.recentLogs.length === 0) && (
                      <div className="p-8 text-center text-muted-foreground">
                        No hay ejecuciones registradas
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminMatches;

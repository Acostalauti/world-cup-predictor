import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { client } from "@/api/client";
import type { Match } from "@/types/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Filter, X } from "lucide-react";
import MatchCard from "@/components/MatchCard";
import Header from "@/components/Header";
import NotificationCenter from "@/components/NotificationCenter";
import { toast } from "sonner";

const Matches = () => {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [predictionFilter, setPredictionFilter] = useState("all");

  // Notifications
  const {
    unnotifiedPredictions,
    notificationCount,
    isOpen,
    openNotificationCenter,
    closeNotificationCenter,
  } = useNotifications(currentUser?.role === "player");

  // Fetch matches on mount
  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await client.GET("/api/matches");

      if (error) {
        toast.error("Error al cargar partidos");
        console.error("Error fetching matches:", error);
        return;
      }

      if (data) {
        // Cast to unknown first to bypass openapi-fetch type validation
        // Backend returns extended fields (editable, fifaMatchId, etc) not in OpenAPI schema
        setMatches(data as unknown as Match[]);
      }
    } catch (error) {
      toast.error("Error al cargar partidos");
      console.error("Error fetching matches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...matches];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    // Stage filter
    if (stageFilter !== "all") {
      filtered = filtered.filter((m) => m.stage === stageFilter);
    }

    // Group filter
    if (groupFilter !== "all") {
      filtered = filtered.filter((m) => m.group === groupFilter);
    }

    // Search term (team names)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.homeTeam.toLowerCase().includes(term) ||
          m.awayTeam.toLowerCase().includes(term)
      );
    }

    // Prediction filter
    if (predictionFilter === "predicted") {
      filtered = filtered.filter((m) => m.userPrediction);
    } else if (predictionFilter === "pending") {
      filtered = filtered.filter((m) => !m.userPrediction && m.editable);
    }

    setFilteredMatches(filtered);
  }, [
    matches,
    statusFilter,
    stageFilter,
    groupFilter,
    searchTerm,
    predictionFilter,
  ]);

  // Get unique stages and groups for filter dropdowns
  const uniqueStages = useMemo(() => {
    const stages = Array.from(new Set(matches.map((m) => m.stage).filter(Boolean)));
    return stages.sort();
  }, [matches]);

  const uniqueGroups = useMemo(() => {
    const groups = Array.from(new Set(matches.map((m) => m.group).filter(Boolean)));
    // Sort groups alphabetically (A, B, C, ...)
    return groups.sort();
  }, [matches]);

  // Group matches by date
  const matchesByDate = useMemo(() => {
    const grouped = filteredMatches.reduce((acc, match) => {
      const date = new Date(match.date).toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(match);
      return acc;
    }, {} as Record<string, Match[]>);

    // Sort dates chronologically
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const dateA = new Date(grouped[a][0].date);
      const dateB = new Date(grouped[b][0].date);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedDates.map((date) => ({ date, matches: grouped[date] }));
  }, [filteredMatches]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = matches.length;
    const predicted = matches.filter((m) => m.userPrediction).length;
    const pending = matches.filter((m) => !m.userPrediction && m.editable).length;
    const finished = matches.filter((m) => m.status === "finished").length;

    return { total, predicted, pending, finished };
  }, [matches]);

  // Handle prediction save
  const handleSavePrediction = async (
    matchId: string,
    homeScore: number,
    awayScore: number
  ) => {
    try {
      const { error } = await client.POST("/api/predictions", {
        body: {
          matchId,
          homeScore,
          awayScore,
        },
      });

      if (error) {
        toast.error("Error al guardar predicción");
        console.error("Error saving prediction:", error);
        return;
      }

      // Show success toast
      toast.success("Predicción guardada correctamente");

      // Refresh matches to get updated prediction
      await fetchMatches();
    } catch (error) {
      toast.error("Error al guardar predicción");
      console.error("Error saving prediction:", error);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("all");
    setStageFilter("all");
    setGroupFilter("all");
    setSearchTerm("");
    setPredictionFilter("all");
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    stageFilter !== "all" ||
    groupFilter !== "all" ||
    searchTerm !== "" ||
    predictionFilter !== "all";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onLogout={() => {}} />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-lg text-muted-foreground">Cargando partidos...</div>
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
          <h1 className="text-4xl font-bold mb-2">Partidos</h1>
          <p className="text-muted-foreground">
            Hacé tus predicciones antes de cada partido
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Partidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Predicciones Realizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.predicted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes por Predecir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Partidos Finalizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">
                {stats.finished}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Search */}
              <Input
                placeholder="Buscar equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="upcoming">Próximos</SelectItem>
                  <SelectItem value="live">En vivo</SelectItem>
                  <SelectItem value="finished">Finalizados</SelectItem>
                </SelectContent>
              </Select>

              {/* Stage Filter */}
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Fase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fases</SelectItem>
                  {uniqueStages.map((stage) => (
                    <SelectItem key={stage} value={stage || ""}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Group Filter */}
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grupos</SelectItem>
                  {uniqueGroups.map((group) => (
                    <SelectItem key={group} value={group || ""}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Prediction Filter */}
              <Select value={predictionFilter} onValueChange={setPredictionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Predicción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="predicted">Predichas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fixtures */}
        {matchesByDate.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No se encontraron partidos con los filtros seleccionados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {matchesByDate.map(({ date, matches: dateMatches }) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold capitalize">{date}</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Matches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {dateMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      id={match.id}
                      homeTeam={match.homeTeam}
                      awayTeam={match.awayTeam}
                      homeFlag={match.homeFlag || ""}
                      awayFlag={match.awayFlag || ""}
                      date={new Date(match.date).toLocaleDateString("es-AR")}
                      time={match.time || ""}
                      status={match.status as "upcoming" | "in_progress" | "finished"}
                      homeScore={match.homeScore || undefined}
                      awayScore={match.awayScore || undefined}
                      matchNumber={match.matchNumber}
                      stage={match.stage}
                      group={match.group}
                      stadium={match.stadium}
                      city={match.city}
                      userPrediction={
                        match.userPrediction
                          ? {
                              home: match.userPrediction.homeScore,
                              away: match.userPrediction.awayScore,
                              points: match.userPrediction.points || undefined,
                              pointsBreakdown:
                                match.userPrediction.pointsBreakdown || undefined,
                            }
                          : undefined
                      }
                      onSavePrediction={handleSavePrediction}
                      editable={match.editable}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;

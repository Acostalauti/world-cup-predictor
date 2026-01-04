import { Calendar, Plus, Search, MoreVertical, Edit, Trash2, CheckCircle } from "lucide-react";
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
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const mockMatches = [
  { id: "1", homeTeam: "Argentina", awayTeam: "Francia", date: "2024-12-30", time: "16:00", status: "upcoming", homeScore: null, awayScore: null },
  { id: "2", homeTeam: "Brasil", awayTeam: "Alemania", date: "2024-12-30", time: "19:00", status: "upcoming", homeScore: null, awayScore: null },
  { id: "3", homeTeam: "España", awayTeam: "Portugal", date: "2024-12-29", time: "16:00", status: "live", homeScore: 1, awayScore: 1 },
  { id: "4", homeTeam: "Inglaterra", awayTeam: "Italia", date: "2024-12-28", time: "19:00", status: "finished", homeScore: 2, awayScore: 1 },
  { id: "5", homeTeam: "Holanda", awayTeam: "Bélgica", date: "2024-12-27", time: "16:00", status: "finished", homeScore: 0, awayScore: 3 },
];

const AdminMatches = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredMatches = mockMatches.filter((match) =>
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
                {mockMatches.filter((m) => m.status === "upcoming").length}
              </div>
              <div className="text-xs text-muted-foreground">Próximos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockMatches.filter((m) => m.status === "live").length}
              </div>
              <div className="text-xs text-muted-foreground">En Vivo</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {mockMatches.filter((m) => m.status === "finished").length}
              </div>
              <div className="text-xs text-muted-foreground">Finalizados</div>
            </CardContent>
          </Card>
        </section>

        {/* Matches Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1">Próximos</TabsTrigger>
            <TabsTrigger value="live" className="flex-1">En Vivo</TabsTrigger>
            <TabsTrigger value="finished" className="flex-1">Finalizados</TabsTrigger>
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
        </Tabs>
      </main>
    </div>
  );
};

export default AdminMatches;

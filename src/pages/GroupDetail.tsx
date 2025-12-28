import { useState } from "react";
import { Users, Trophy, Calendar, Settings, Crown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import CountdownTimer from "@/components/CountdownTimer";
import MatchCard, { MatchStatus } from "@/components/MatchCard";
import RankingTable from "@/components/RankingTable";
import PredictionAlert from "@/components/PredictionAlert";
import GroupSettings from "@/components/GroupSettings";
import GroupMembers from "@/components/GroupMembers";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

// Mock data
const mockMatches: Array<{
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
}> = [
  {
    id: "1",
    homeTeam: "Argentina",
    awayTeam: "México",
    homeFlag: "🇦🇷",
    awayFlag: "🇲🇽",
    date: "14 Jun 2026",
    time: "18:00",
    status: "upcoming",
    userPrediction: null,
  },
  {
    id: "2",
    homeTeam: "Brasil",
    awayTeam: "Alemania",
    homeFlag: "🇧🇷",
    awayFlag: "🇩🇪",
    date: "14 Jun 2026",
    time: "21:00",
    status: "upcoming",
    userPrediction: { home: 2, away: 1 },
  },
  {
    id: "3",
    homeTeam: "España",
    awayTeam: "Francia",
    homeFlag: "🇪🇸",
    awayFlag: "🇫🇷",
    date: "13 Jun 2026",
    time: "18:00",
    status: "in_progress",
    userPrediction: { home: 1, away: 2 },
  },
  {
    id: "4",
    homeTeam: "Inglaterra",
    awayTeam: "Italia",
    homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    awayFlag: "🇮🇹",
    date: "12 Jun 2026",
    time: "15:00",
    status: "finished",
    homeScore: 2,
    awayScore: 2,
    userPrediction: { home: 2, away: 1 },
  },
];

const mockRanking = [
  { id: "1", position: 1, name: "Carlos Pérez", points: 45, isCurrentUser: false },
  { id: "2", position: 2, name: "Juan García", points: 42, isCurrentUser: true },
  { id: "3", position: 3, name: "María López", points: 38, isCurrentUser: false },
  { id: "4", position: 4, name: "Ana Martínez", points: 35, isCurrentUser: false },
  { id: "5", position: 5, name: "Pedro Sánchez", points: 32, isCurrentUser: false },
  { id: "6", position: 6, name: "Laura Gómez", points: 28, isCurrentUser: false },
  { id: "7", position: 7, name: "Diego Torres", points: 25, isCurrentUser: false },
  { id: "8", position: 8, name: "Sofía Ruiz", points: 22, isCurrentUser: false },
];

const mockMembers = [
  { id: "user-2", name: "María González", email: "admin-grupo@example.com", isAdmin: true, joinedAt: "Fundador", points: 38 },
  { id: "1", name: "Carlos Pérez", email: "carlos@example.com", isAdmin: false, joinedAt: "Hace 2 sem", points: 45 },
  { id: "2", name: "Juan García", email: "juan@example.com", isAdmin: false, joinedAt: "Hace 2 sem", points: 42 },
  { id: "3", name: "Ana Martínez", email: "ana@example.com", isAdmin: false, joinedAt: "Hace 1 sem", points: 35 },
  { id: "4", name: "Pedro Sánchez", email: "pedro@example.com", isAdmin: false, joinedAt: "Hace 5 días", points: 32 },
  { id: "5", name: "Laura Gómez", email: "laura@example.com", isAdmin: false, joinedAt: "Hace 3 días", points: 28 },
  { id: "6", name: "Diego Torres", email: "diego@example.com", isAdmin: false, joinedAt: "Hace 2 días", points: 25 },
  { id: "7", name: "Sofía Ruiz", email: "sofia@example.com", isAdmin: false, joinedAt: "Hace 1 día", points: 22 },
];

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("matches");

  // Check if current user is group admin
  const isGroupAdmin = currentUser?.role === 'group_admin' || currentUser?.role === 'platform_admin';

  // Mock group info
  const group = {
    name: "Amigos de la Facu",
    playerCount: 8,
    description: "Grupo de amigos de la facultad de ingeniería",
    inviteCode: "PRODE2026",
    inviteLink: "https://prode.app/join/PRODE2026",
    scoringSystem: {
      exactScore: 5,
      correctResult: 3,
      correctGoalDiff: 1,
    },
  };

  const nextMatchDate = new Date("2026-06-14T18:00:00");

  const handleSavePrediction = (matchId: string, home: number, away: number) => {
    toast({
      title: "Predicción guardada",
      description: `${home} - ${away}`,
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const upcomingMatches = mockMatches.filter((m) => m.status === "upcoming");
  const inProgressMatches = mockMatches.filter((m) => m.status === "in_progress");
  const finishedMatches = mockMatches.filter((m) => m.status === "finished");

  return (
    <div className="min-h-screen bg-background">
      <Header userName={currentUser?.name} showBack onLogout={handleLogout} />

      <main className="container py-6 pb-8">
        {/* Group Header */}
        <section className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-foreground">{group.name}</h2>
            {isGroupAdmin && (
              <div className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Admin
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{group.playerCount} jugadores</span>
            </div>
          </div>
        </section>

        {/* Countdown */}
        <section className="mb-6">
          <CountdownTimer targetDate={nextMatchDate} label="Próximo partido" />
        </section>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full mb-6 ${isGroupAdmin ? 'grid-cols-5' : 'grid-cols-3'}`}>
            <TabsTrigger value="matches" className="gap-1.5">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Partidos</span>
            </TabsTrigger>
            <TabsTrigger value="ranking" className="gap-1.5">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Ranking</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="gap-1.5">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Predicciones</span>
            </TabsTrigger>
            {isGroupAdmin && (
              <>
                <TabsTrigger value="members" className="gap-1.5">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Miembros</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1.5">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Config</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            {/* In Progress */}
            {inProgressMatches.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  En vivo
                </h3>
                <div className="space-y-3">
                  {inProgressMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      {...match}
                      onSavePrediction={handleSavePrediction}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingMatches.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Próximos
                </h3>
                <div className="space-y-3">
                  {upcomingMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      {...match}
                      onSavePrediction={handleSavePrediction}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Finished */}
            {finishedMatches.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Finalizados
                </h3>
                <div className="space-y-3">
                  {finishedMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      {...match}
                      onSavePrediction={handleSavePrediction}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="space-y-4">
            <RankingTable players={mockRanking} currentUserId="2" />
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            <PredictionAlert type="hidden" />

            <div className="space-y-3">
              {mockMatches
                .filter((m) => m.userPrediction)
                .map((match) => (
                  <MatchCard
                    key={match.id}
                    {...match}
                    onSavePrediction={handleSavePrediction}
                  />
                ))}
            </div>

            {mockMatches.filter((m) => m.userPrediction).length === 0 && (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium text-foreground mb-2">
                  Sin predicciones aún
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ve a la pestaña de Partidos para hacer tus predicciones
                </p>
              </div>
            )}
          </TabsContent>

          {/* Members Tab (Admin only) */}
          {isGroupAdmin && (
            <TabsContent value="members" className="space-y-4">
              <GroupMembers members={mockMembers} currentUserId={currentUser?.id || ""} />
            </TabsContent>
          )}

          {/* Settings Tab (Admin only) */}
          {isGroupAdmin && (
            <TabsContent value="settings" className="space-y-4">
              <GroupSettings
                groupName={group.name}
                groupDescription={group.description}
                inviteCode={group.inviteCode}
                inviteLink={group.inviteLink}
                scoringSystem={group.scoringSystem}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default GroupDetail;

import { useState, useEffect } from "react";
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
import { client } from "@/api/client";
import { components } from "@/types/api";

type Group = components["schemas"]["Group"];
type GroupMember = components["schemas"]["GroupMember"];
type Match = components["schemas"]["Match"];

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("matches");

  const [group, setGroup] = useState<Group | null>(null);
  const [ranking, setRanking] = useState<GroupMember[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!groupId) return;
      setIsLoading(true);
      try {
        const [groupRes, rankingRes, matchesRes] = await Promise.all([
          client.GET("/groups/{id}", { params: { path: { id: groupId } } }),
          client.GET("/groups/{id}/ranking", { params: { path: { id: groupId } } }),
          client.GET("/matches", { params: { query: { status: "upcoming" } } }), // Initial fetch
        ]);

        // Fetch all matches to segregate in UI? Or fetch separately?
        // Let's fetch all matches for now to simplify UI logic
        const allMatchesRes = await client.GET("/matches");

        if (groupRes.data) setGroup(groupRes.data);
        if (rankingRes.data) setRanking(rankingRes.data);
        if (allMatchesRes.data) setMatches(allMatchesRes.data);

      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Error al cargar los datos del grupo",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [groupId, toast]);


  const handleSavePrediction = async (matchId: string, home: number, away: number) => {
    try {
      const { data, error } = await client.POST("/predictions", {
        body: { matchId, homeScore: home, awayScore: away, userId: currentUser?.id }
      });

      if (data) {
        toast({
          title: "Predicción guardada",
          description: `${home} - ${away}`,
        });
        // Update local state to reflect change
        setMatches(prev => prev.map(m =>
          m.id === matchId ? { ...m, userPrediction: { matchId, userId: currentUser?.id || "", homeScore: home, awayScore: away } } : m
        ));
      } else {
        throw new Error("Failed to save");
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "No se pudo guardar la predicción",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (isLoading || !group) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  // Check if current user is group admin
  const isGroupAdmin = group.isAdmin; // API returns isAdmin

  // Matches logic
  // API returns MatchStatus as string, we assume it matches MatchStatus type or we map it
  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const inProgressMatches = matches.filter((m) => m.status === "live"); // API uses 'live', component uses 'in_progress' probably?
  // Checking MatchCard types: MatchStatus = "upcoming" | "in_progress" | "finished";
  // API OpenApi: enum: [upcoming, live, finished]
  // Map 'live' to 'in_progress'

  const mapStatus = (status: string): MatchStatus => {
    if (status === 'live') return 'in_progress';
    return status as MatchStatus;
  };

  const finishedMatches = matches.filter((m) => m.status === "finished");

  const nextMatchDate = upcomingMatches.length > 0 ? new Date(upcomingMatches[0].date + "T" + upcomingMatches[0].time) : new Date();

  // Map scoring system for Settings component
  const getScoringSystemObject = (system: string) => {
    switch (system) {
      case 'extended': return { exactScore: 5, correctResult: 3, correctGoalDiff: 1 };
      case 'simple': return { exactScore: 2, correctResult: 2, correctGoalDiff: 0 };
      case 'classic':
      default: return { exactScore: 3, correctResult: 1, correctGoalDiff: 0 };
    }
  };

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
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs bg-secondary px-2 py-1 rounded select-all cursor-pointer" title="Código de invitación">
                {group.inviteCode}
              </span>
            </div>
          </div>
        </section>

        {/* Countdown */}
        {upcomingMatches.length > 0 && (
          <section className="mb-6">
            <CountdownTimer targetDate={nextMatchDate} label="Próximo partido" />
          </section>
        )}

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
                      id={match.id!} // Assuming non-null
                      homeTeam={match.homeTeam!}
                      awayTeam={match.awayTeam!}
                      homeFlag={match.homeFlag!}
                      awayFlag={match.awayFlag!}
                      date={match.date!}
                      time={match.time!}
                      status={mapStatus(match.status!)}
                      homeScore={match.homeScore ?? undefined}
                      awayScore={match.awayScore ?? undefined}
                      matchNumber={match.matchNumber}
                      stage={match.stage}
                      group={match.group}
                      stadium={match.stadium}
                      city={match.city}
                      userPrediction={match.userPrediction ? { home: match.userPrediction.homeScore!, away: match.userPrediction.awayScore! } : null}
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
                      id={match.id!}
                      homeTeam={match.homeTeam!}
                      awayTeam={match.awayTeam!}
                      homeFlag={match.homeFlag!}
                      awayFlag={match.awayFlag!}
                      date={match.date!}
                      time={match.time!}
                      status={mapStatus(match.status!)}
                      homeScore={match.homeScore ?? undefined}
                      awayScore={match.awayScore ?? undefined}
                      matchNumber={match.matchNumber}
                      stage={match.stage}
                      group={match.group}
                      stadium={match.stadium}
                      city={match.city}
                      userPrediction={match.userPrediction ? { home: match.userPrediction.homeScore!, away: match.userPrediction.awayScore! } : null}
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
                      id={match.id!}
                      homeTeam={match.homeTeam!}
                      awayTeam={match.awayTeam!}
                      homeFlag={match.homeFlag!}
                      awayFlag={match.awayFlag!}
                      date={match.date!}
                      time={match.time!}
                      status={mapStatus(match.status!)}
                      homeScore={match.homeScore ?? undefined}
                      awayScore={match.awayScore ?? undefined}
                      matchNumber={match.matchNumber}
                      stage={match.stage}
                      group={match.group}
                      stadium={match.stadium}
                      city={match.city}
                      userPrediction={match.userPrediction ? { home: match.userPrediction.homeScore!, away: match.userPrediction.awayScore! } : null}
                      onSavePrediction={handleSavePrediction}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="space-y-4">
            <RankingTable
              players={ranking.map(m => ({
                id: m.userId!,
                position: m.position || 0,
                name: m.name!,
                points: m.points!,
                isCurrentUser: m.userId === currentUser?.id
              }))}
              currentUserId={currentUser?.id}
            />
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            <PredictionAlert type="hidden" />

            <div className="space-y-3">
              {matches
                .filter((m) => m.userPrediction)
                .map((match) => (
                  <MatchCard
                    key={match.id}
                    id={match.id!}
                    homeTeam={match.homeTeam!}
                    awayTeam={match.awayTeam!}
                    homeFlag={match.homeFlag!}
                    awayFlag={match.awayFlag!}
                    date={match.date!}
                    time={match.time!}
                    status={mapStatus(match.status!)}
                    homeScore={match.homeScore ?? undefined}
                    awayScore={match.awayScore ?? undefined}
                    matchNumber={match.matchNumber}
                    stage={match.stage}
                    group={match.group}
                    stadium={match.stadium}
                    city={match.city}
                    userPrediction={match.userPrediction ? { home: match.userPrediction.homeScore!, away: match.userPrediction.awayScore! } : null}
                    onSavePrediction={handleSavePrediction}
                  />
                ))}
            </div>

            {matches.filter((m) => m.userPrediction).length === 0 && (
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
              <GroupMembers members={ranking.map(m => ({
                id: m.userId!,
                name: m.name!,
                email: m.email || "", // Assuming email is in optional properties or need fetch
                isAdmin: m.isAdmin!,
                joinedAt: new Date(m.joinedAt!).toLocaleDateString(),
                points: m.points!
              }))} currentUserId={currentUser?.id || ""} />
            </TabsContent>
          )}

          {/* Settings Tab (Admin only) */}
          {isGroupAdmin && (
            <TabsContent value="settings" className="space-y-4">
              <GroupSettings
                groupName={group.name!}
                groupDescription={group.description || ""}
                inviteCode={group.inviteCode!}
                inviteLink={group.inviteLink!}
                scoringSystem={getScoringSystemObject(group.scoringSystem!)}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default GroupDetail;

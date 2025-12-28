import { Plus, UserPlus, Trophy, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import GroupCard from "@/components/GroupCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Mock data
const mockGroups = [
  { id: "1", name: "Amigos de la Facu", playerCount: 8, userPosition: 2, isAdmin: true },
  { id: "2", name: "Familia García", playerCount: 12, userPosition: 5, isAdmin: false },
  { id: "3", name: "Oficina Tech", playerCount: 15, userPosition: 1, isAdmin: false },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isGroupAdmin = currentUser?.role === 'group_admin' || currentUser?.role === 'platform_admin';

  // Filter groups where user is admin
  const adminGroups = mockGroups.filter(g => g.isAdmin);
  const playerGroups = mockGroups.filter(g => !g.isAdmin);

  const getRoleBadge = () => {
    if (currentUser?.role === 'group_admin') {
      return (
        <div className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Admin de Grupo
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userName={currentUser?.name || "Juan García"} showBack onLogout={handleLogout} />

      <main className="container py-6 pb-24">
        {/* Welcome Section */}
        <section className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-foreground">
              ¡Hola, {currentUser?.name?.split(' ')[0] || 'Juan'}! 👋
            </h2>
            {getRoleBadge()}
          </div>
          <p className="text-muted-foreground">
            {isGroupAdmin 
              ? 'Gestiona tus grupos y haz predicciones'
              : 'Listo para predecir los partidos del Mundial 2026'
            }
          </p>
        </section>

        {/* Stats Summary */}
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-xl p-4 shadow-card text-center border border-border">
              <div className="text-2xl font-bold text-primary">{mockGroups.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Grupos</div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-card text-center border border-border">
              <div className="text-2xl font-bold text-amber-500">2</div>
              <div className="text-xs text-muted-foreground mt-1">Podios 🏆</div>
            </div>
            <div className="bg-card rounded-xl p-4 shadow-card text-center border border-border">
              <div className="text-2xl font-bold text-foreground">156</div>
              <div className="text-xs text-muted-foreground mt-1">Puntos</div>
            </div>
          </div>
        </section>

        {/* Admin Groups Section */}
        {isGroupAdmin && adminGroups.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">Grupos que administro</h3>
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-sm text-muted-foreground">
                {adminGroups.length} {adminGroups.length === 1 ? 'grupo' : 'grupos'}
              </span>
            </div>

            <div className="space-y-3">
              {adminGroups.map((group, index) => (
                <div
                  key={group.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <GroupCard
                    {...group}
                    onClick={() => navigate(`/group/${group.id}`)}
                    isAdmin
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Groups Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {isGroupAdmin ? 'Otros grupos' : 'Mis grupos'}
            </h3>
            <span className="text-sm text-muted-foreground">
              {(isGroupAdmin ? playerGroups : mockGroups).length} grupos
            </span>
          </div>

          <div className="space-y-3">
            {(isGroupAdmin ? playerGroups : mockGroups).map((group, index) => (
              <div
                key={group.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <GroupCard
                  {...group}
                  onClick={() => navigate(`/group/${group.id}`)}
                />
              </div>
            ))}
          </div>

          {mockGroups.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium text-foreground mb-2">
                No tienes grupos aún
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Crea un grupo o únete a uno para empezar a competir
              </p>
            </div>
          )}
        </section>

        {/* CTA Buttons */}
        <section className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border">
          <div className="container flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/join-group")}
            >
              <UserPlus className="w-4 h-4" />
              Unirse
            </Button>
            <Button
              className="flex-1"
              onClick={() => navigate("/create-group")}
            >
              <Plus className="w-4 h-4" />
              Crear grupo
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

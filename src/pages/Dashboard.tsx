import { Plus, UserPlus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import GroupCard from "@/components/GroupCard";
import { useNavigate } from "react-router-dom";

// Mock data
const mockGroups = [
  { id: "1", name: "Amigos de la Facu", playerCount: 8, userPosition: 2 },
  { id: "2", name: "Familia García", playerCount: 12, userPosition: 5 },
  { id: "3", name: "Oficina Tech", playerCount: 15, userPosition: 1 },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userName="Juan García" showBack onLogout={handleLogout} />

      <main className="container py-6 pb-24">
        {/* Welcome Section */}
        <section className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            ¡Hola, Juan! 👋
          </h2>
          <p className="text-muted-foreground">
            Listo para predecir los partidos del Mundial 2026
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

        {/* Groups Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Mis grupos</h3>
            <span className="text-sm text-muted-foreground">
              {mockGroups.length} grupos
            </span>
          </div>

          <div className="space-y-3">
            {mockGroups.map((group, index) => (
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

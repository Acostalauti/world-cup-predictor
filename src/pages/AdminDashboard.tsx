import { Users, Trophy, Settings, Shield, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { mockUsers } from "@/data/mockUsers";

// Mock platform data
const platformStats = {
  totalUsers: 1248,
  totalGroups: 156,
  activeMatches: 8,
  predictionsToday: 3420,
};

const recentGroups = [
  { id: "1", name: "Amigos de la Facu", playerCount: 8, createdAt: "Hace 2 días" },
  { id: "2", name: "Familia García", playerCount: 12, createdAt: "Hace 3 días" },
  { id: "3", name: "Oficina Tech", playerCount: 15, createdAt: "Hace 5 días" },
  { id: "4", name: "Grupo Barrio Norte", playerCount: 6, createdAt: "Hace 1 semana" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userName={currentUser?.name} showBack onLogout={handleLogout} />

      <main className="container py-6 pb-8">
        {/* Admin Badge */}
        <section className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Admin Plataforma
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Panel de Administración
          </h2>
          <p className="text-muted-foreground">
            Gestiona la plataforma Prode Mundial
          </p>
        </section>

        {/* Platform Stats */}
        <section className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Estadísticas de la plataforma
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {platformStats.totalUsers.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Usuarios</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {platformStats.totalGroups}
                </div>
                <div className="text-xs text-muted-foreground">Grupos</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto text-green-500 mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {platformStats.activeMatches}
                </div>
                <div className="text-xs text-muted-foreground">Partidos Activos</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {platformStats.predictionsToday.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Predicciones Hoy</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Acciones rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Gestionar Usuarios</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Trophy className="w-5 h-5" />
              <span className="text-sm">Ver Grupos</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Gestionar Partidos</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">Reportes</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Configuración</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Seguridad</span>
            </Button>
          </div>
        </section>

        {/* Users List */}
        <section className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Usuarios registrados
          </h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {mockUsers.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'platform_admin' 
                        ? 'bg-destructive/10 text-destructive'
                        : user.role === 'group_admin'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.role === 'platform_admin' ? 'Admin' : user.role === 'group_admin' ? 'Admin Grupo' : 'Jugador'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Groups */}
        <section className="mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Grupos recientes
          </h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentGroups.map((group) => (
                  <div key={group.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.playerCount} jugadores · {group.createdAt}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;

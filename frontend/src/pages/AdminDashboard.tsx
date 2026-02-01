import { Users, Trophy, Settings, Shield, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import NotificationCenter from "@/components/NotificationCenter";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { client } from "@/api/client";
import type { components } from "@/types/api";

type User = components["schemas"]["User"];
type AdminStats = components["schemas"]["AdminStats"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Notifications (only for players, but keeping for consistency)
  const {
    unnotifiedPredictions,
    notificationCount,
    isOpen,
    openNotificationCenter,
    closeNotificationCenter,
  } = useNotifications(currentUser?.role === "player");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          client.GET("/admin/stats"),
          client.GET("/users")
        ]);

        if (statsRes.data) {
          setStats(statsRes.data);
        }
        if (usersRes.data) {
          setRecentUsers(usersRes.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userName={currentUser?.name} 
        showBack 
        onLogout={handleLogout}
        notificationCount={notificationCount}
        onNotificationClick={openNotificationCenter}
      />

      <NotificationCenter
        isOpen={isOpen}
        predictions={unnotifiedPredictions}
        onClose={closeNotificationCenter}
      />

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {stats?.totalUsers.toLocaleString() || 0}
                </div>
                <div className="text-xs text-muted-foreground">Usuarios</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto text-green-500 mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {stats?.activeMatches.toLocaleString() || 0}
                </div>
                <div className="text-xs text-muted-foreground">Partidos Activos</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {stats?.totalPredictions.toLocaleString() || 0}
                </div>
                <div className="text-xs text-muted-foreground">Predicciones</div>
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
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/admin/users")}>
              <Users className="w-5 h-5" />
              <span className="text-sm">Gestionar Usuarios</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/admin/matches")}>
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Gestionar Partidos</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/admin/reports")}>
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">Reportes</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/admin/settings")}>
              <Settings className="w-5 h-5" />
              <span className="text-sm">Configuración</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/admin/security")}>
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
                {recentUsers.map((user) => (
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
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-muted text-muted-foreground'
                      }`}>
                      {user.role === 'admin' ? 'Admin' : 'Jugador'}
                    </div>
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

import { BarChart3, Download, TrendingUp, Users, Trophy, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { client } from "@/api/client";
import type { components } from "@/types/api";

type AdminReports = components["schemas"]["AdminReports"];

const AdminReports = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await client.GET("/admin/reports");
        if (data) {
          setReports(data);
        }
      } catch (error) {
        console.error("Failed to fetch reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  // Use fetching data or fallback to 0/empty
  const r = reports || {
    users: { total: 0, verified: 0, adminsGroup: 0, newThisWeek: 0, activeToday: 0, retentionRate: 0 },
    groups: { total: 0, active: 0, avgMembers: 0, largestGroup: 0, newThisWeek: 0, topGroups: [] },
    predictions: { total: 0, correct: 0, exact: 0, today: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userName={currentUser?.name} showBack onLogout={handleLogout} />

      <main className="container py-6 pb-8">
        <section className="mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-foreground">Reportes</h2>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
          <p className="text-muted-foreground">
            Estadísticas y métricas de la plataforma
          </p>
        </section>

        {/* Key Metrics */}
        <section className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Usuarios</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{r.users.total.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                Nueva métrica real
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Grupos</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{r.groups.total.toLocaleString()}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                {r.groups.newThisWeek > 0 ? `+${r.groups.newThisWeek} esta semana` : "Sin cambios"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Predicciones</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{(r.predictions.total / 1000).toFixed(1)}K</div>
              <div className="flex items-center text-xs text-green-600">
                {/* Mocking trend for predictions as we don't have history in simple DB */}
                <TrendingUp className="w-3 h-3 mr-1" />
                Actividad reciente
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Precisión Promedio</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {r.predictions.total > 0 ? Math.round((r.predictions.correct / r.predictions.total) * 100) : 0}%
              </div>
              <div className="text-xs text-muted-foreground">
                de predicciones correctas
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Reports Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="overview" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="users" className="flex-1">Usuarios</TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">Grupos</TabsTrigger>
            <TabsTrigger value="predictions" className="flex-1">Predicciones</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen General</CardTitle>
                  <CardDescription>Métricas clave de la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Usuarios activos hoy</span>
                      <span className="font-semibold">{r.users.activeToday}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Predicciones hoy</span>
                      <span className="font-semibold">{r.predictions.today.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Nuevos grupos esta semana</span>
                      <span className="font-semibold">{r.groups.newThisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tasa de retención</span>
                      <span className="font-semibold">{r.users.retentionRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Grupos por Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {r.groups.topGroups.length > 0 ? (
                      r.groups.topGroups.map((group, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                            <div>
                              <p className="font-medium text-foreground">{group.name}</p>
                              <p className="text-xs text-muted-foreground">{group.memberCount} miembros</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold">{group.predictionCount} pred.</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        No hay grupos activos aún.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total registrados</span>
                    <span className="font-semibold">{r.users.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Nuevos esta semana</span>
                    <span className="font-semibold">{r.users.newThisWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Usuarios verificados</span>
                    <span className="font-semibold">{r.users.verified.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Admins de grupo</span>
                    <span className="font-semibold">{r.users.adminsGroup.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas de Grupos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total grupos</span>
                    <span className="font-semibold">{r.groups.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Grupos activos</span>
                    <span className="font-semibold">{r.groups.active.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Promedio miembros/grupo</span>
                    <span className="font-semibold">{r.groups.avgMembers.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Grupo más grande</span>
                    <span className="font-semibold">{r.groups.largestGroup} miembros</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas de Predicciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total predicciones</span>
                    <span className="font-semibold">{r.predictions.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Predicciones correctas</span>
                    <span className="font-semibold">{r.predictions.correct.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Resultados exactos</span>
                    <span className="font-semibold">{r.predictions.exact.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Predicciones hoy</span>
                    <span className="font-semibold">{r.predictions.today.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminReports;

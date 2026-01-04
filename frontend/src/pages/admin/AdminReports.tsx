import { BarChart3, Download, TrendingUp, Users, Trophy, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const AdminReports = () => {
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
              <div className="text-2xl font-bold text-foreground">1,248</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% esta semana
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Grupos</span>
              </div>
              <div className="text-2xl font-bold text-foreground">156</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% esta semana
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Predicciones</span>
              </div>
              <div className="text-2xl font-bold text-foreground">45.2K</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                +25% esta semana
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Precisión Promedio</span>
              </div>
              <div className="text-2xl font-bold text-foreground">42%</div>
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
                      <span className="font-semibold">342</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Predicciones hoy</span>
                      <span className="font-semibold">3,420</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Nuevos grupos esta semana</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Tasa de retención</span>
                      <span className="font-semibold">78%</span>
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
                    {[
                      { name: "Los Campeones", predictions: 450, members: 20 },
                      { name: "Oficina Tech", predictions: 380, members: 15 },
                      { name: "Familia García", predictions: 290, members: 12 },
                      { name: "Amigos de la Facu", predictions: 180, members: 8 },
                    ].map((group, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                          <div>
                            <p className="font-medium text-foreground">{group.name}</p>
                            <p className="text-xs text-muted-foreground">{group.members} miembros</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold">{group.predictions} pred.</span>
                      </div>
                    ))}
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
                    <span className="font-semibold">1,248</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Nuevos esta semana</span>
                    <span className="font-semibold">87</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Usuarios verificados</span>
                    <span className="font-semibold">1,120</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Admins de grupo</span>
                    <span className="font-semibold">156</span>
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
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Grupos activos</span>
                    <span className="font-semibold">142</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Promedio miembros/grupo</span>
                    <span className="font-semibold">8.5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Grupo más grande</span>
                    <span className="font-semibold">45 miembros</span>
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
                    <span className="font-semibold">45,200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Predicciones correctas</span>
                    <span className="font-semibold">18,984</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Resultados exactos</span>
                    <span className="font-semibold">4,520</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Predicciones hoy</span>
                    <span className="font-semibold">3,420</span>
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

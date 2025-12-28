import { Shield, Key, Lock, AlertTriangle, Eye, History, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const securityLogs = [
  { id: 1, event: "Login exitoso", user: "admin@prode.com", ip: "192.168.1.1", time: "Hace 5 min" },
  { id: 2, event: "Cambio de contraseña", user: "carlos@example.com", ip: "192.168.1.50", time: "Hace 1 hora" },
  { id: 3, event: "Intento fallido de login", user: "unknown@test.com", ip: "10.0.0.5", time: "Hace 2 horas" },
  { id: 4, event: "Usuario suspendido", user: "spam@fake.com", ip: "Sistema", time: "Hace 3 horas" },
  { id: 5, event: "Login exitoso", user: "maria@example.com", ip: "192.168.1.25", time: "Hace 4 horas" },
];

const blockedIPs = [
  { ip: "10.0.0.5", reason: "Múltiples intentos fallidos", blockedAt: "2024-12-28" },
  { ip: "203.0.113.50", reason: "Actividad sospechosa", blockedAt: "2024-12-27" },
];

const AdminSecurity = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireSpecialChars: true,
    logUserActivity: true,
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userName={currentUser?.name} showBack onLogout={handleLogout} />

      <main className="container py-6 pb-8">
        <section className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-destructive" />
            <h2 className="text-2xl font-bold text-foreground">Seguridad</h2>
          </div>
          <p className="text-muted-foreground">
            Gestiona la seguridad y auditoría de la plataforma
          </p>
        </section>

        {/* Security Overview */}
        <section className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Lock className="w-6 h-6 mx-auto text-green-500 mb-2" />
              <div className="text-lg font-bold text-foreground">Activo</div>
              <div className="text-xs text-muted-foreground">Estado SSL</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 mx-auto text-amber-500 mb-2" />
              <div className="text-lg font-bold text-foreground">3</div>
              <div className="text-xs text-muted-foreground">Alertas Hoy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserX className="w-6 h-6 mx-auto text-destructive mb-2" />
              <div className="text-lg font-bold text-foreground">{blockedIPs.length}</div>
              <div className="text-xs text-muted-foreground">IPs Bloqueadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <History className="w-6 h-6 mx-auto text-blue-500 mb-2" />
              <div className="text-lg font-bold text-foreground">1.2K</div>
              <div className="text-xs text-muted-foreground">Eventos Hoy</div>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="settings" className="flex-1">Configuración</TabsTrigger>
            <TabsTrigger value="logs" className="flex-1">Logs</TabsTrigger>
            <TabsTrigger value="blocked" className="flex-1">IPs Bloqueadas</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Autenticación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Autenticación de Dos Factores Obligatoria</Label>
                      <p className="text-sm text-muted-foreground">
                        Requerir 2FA para todos los administradores
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorRequired}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, twoFactorRequired: checked })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tiempo de Sesión (minutos)</Label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          sessionTimeout: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Máximo Intentos de Login</Label>
                    <Input
                      type="number"
                      value={securitySettings.maxLoginAttempts}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          maxLoginAttempts: parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Bloquear IP después de estos intentos fallidos
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Políticas de Contraseña
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Longitud Mínima</Label>
                    <Input
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          passwordMinLength: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Requerir Caracteres Especiales</Label>
                      <p className="text-sm text-muted-foreground">
                        Contraseñas deben incluir símbolos
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.requireSpecialChars}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, requireSpecialChars: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Auditoría
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Registrar Actividad de Usuario</Label>
                      <p className="text-sm text-muted-foreground">
                        Guardar logs de acciones de usuarios
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.logUserActivity}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({ ...securitySettings, logUserActivity: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Registro de Actividad</CardTitle>
                <CardDescription>Últimos eventos de seguridad</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {securityLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{log.event}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.user} · IP: {log.ip}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocked">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">IPs Bloqueadas</CardTitle>
                  <CardDescription>Direcciones IP con acceso denegado</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Agregar IP
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {blockedIPs.map((item, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground font-mono">{item.ip}</p>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{item.blockedAt}</span>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          Desbloquear
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminSecurity;

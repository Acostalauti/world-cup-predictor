import { Settings, Save, Globe, Bell, Palette, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [settings, setSettings] = useState({
    siteName: "Prode Mundial",
    siteDescription: "La mejor plataforma de predicciones de fútbol",
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    pushNotifications: false,
    defaultLanguage: "es",
    timezone: "America/Buenos_Aires",
    maxGroupSize: 50,
    predictionsDeadline: 15,
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground">Configuración</h2>
            </div>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
          <p className="text-muted-foreground">
            Configura los parámetros generales de la plataforma
          </p>
        </section>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">Notificaciones</TabsTrigger>
            <TabsTrigger value="game" className="flex-1">Juego</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Información del Sitio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nombre del Sitio</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Descripción</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma por Defecto</Label>
                    <Select
                      value={settings.defaultLanguage}
                      onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Zona Horaria</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Buenos_Aires">Argentina (GMT-3)</SelectItem>
                        <SelectItem value="America/Mexico_City">México (GMT-6)</SelectItem>
                        <SelectItem value="Europe/Madrid">España (GMT+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Estado del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Modo Mantenimiento</Label>
                      <p className="text-sm text-muted-foreground">
                        Deshabilita el acceso público al sitio
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, maintenanceMode: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Permitir Registro</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite que nuevos usuarios se registren
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowRegistration}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, allowRegistration: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Configuración de Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar recordatorios y resultados por email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificaciones push al navegador
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, pushNotifications: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="game">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Configuración del Juego
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tamaño Máximo de Grupo</Label>
                  <Input
                    type="number"
                    value={settings.maxGroupSize}
                    onChange={(e) =>
                      setSettings({ ...settings, maxGroupSize: parseInt(e.target.value) })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Número máximo de jugadores por grupo
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Límite de Predicciones (minutos)</Label>
                  <Input
                    type="number"
                    value={settings.predictionsDeadline}
                    onChange={(e) =>
                      setSettings({ ...settings, predictionsDeadline: parseInt(e.target.value) })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Minutos antes del partido para cerrar predicciones
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminSettings;

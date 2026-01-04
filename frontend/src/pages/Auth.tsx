import { useState } from "react";
import { Trophy, Mail, Lock, ArrowRight, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { mockUsers, MockUser } from "@/data/mockUsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMockUser, setSelectedMockUser] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentUser } = useAuth();

  const handleMockUserSelect = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    if (user) {
      setSelectedMockUser(userId);
      setEmail(user.email);
      setName(user.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.email === email);
    
    if (user) {
      setCurrentUser(user);
      toast({
        title: `¡Bienvenido, ${user.name}!`,
        description: getRoleDescription(user.role),
      });
      
      // Navigate based on role
      if (user.role === 'platform_admin') {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      toast({
        title: isLogin ? "¡Bienvenido!" : "¡Cuenta creada!",
        description: isLogin
          ? "Has iniciado sesión correctamente."
          : "Tu cuenta ha sido creada. Ya puedes comenzar.",
      });
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'platform_admin':
        return 'Acceso al panel de administración de la plataforma';
      case 'group_admin':
        return 'Puedes gestionar tus grupos y ver configuraciones';
      default:
        return 'Listo para hacer predicciones';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'platform_admin':
        return { label: 'Admin', className: 'bg-destructive/10 text-destructive' };
      case 'group_admin':
        return { label: 'Admin Grupo', className: 'bg-amber-500/10 text-amber-600' };
      default:
        return { label: 'Jugador', className: 'bg-muted text-muted-foreground' };
    }
  };

  return (
    <div className="min-h-screen bg-background pitch-pattern flex flex-col">
      {/* Header */}
      <div className="flex justify-center pt-12 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl gradient-pitch flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Prode Mundial</h1>
            <p className="text-sm text-muted-foreground">FIFA 2026</p>
          </div>
        </div>
      </div>

      {/* Auth Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <Card className="w-full max-w-md shadow-card animate-slide-up">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Ingresa tus credenciales para continuar"
                : "Completa el formulario para registrarte"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mock User Selector for Testing */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-dashed border-border">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                🧪 Testing: Seleccionar usuario
              </Label>
              <Select value={selectedMockUser} onValueChange={handleMockUserSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegir usuario de prueba..." />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => {
                    const badge = getRoleBadge(user.role);
                    return (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <span>{user.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-pulse">Cargando...</span>
                ) : (
                  <>
                    {isLogin ? "Iniciar sesión" : "Crear cuenta"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-primary font-medium hover:underline"
                >
                  {isLogin ? "Regístrate" : "Inicia sesión"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 Prode Mundial. Hecho con ⚽ para los fanáticos del fútbol.
        </p>
      </footer>
    </div>
  );
};

export default Auth;

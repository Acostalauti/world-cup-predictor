import { useState } from "react";
import { Trophy, Mail, Lock, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useAuth();
  const [searchParams] = useSearchParams();

  // Check for OAuth errors in URL
  const oauthError = searchParams.get("error");
  if (oauthError && oauthError === "domain_not_allowed") {
    toast({
      title: "Dominio no permitido",
      description: "Tu correo electrónico no pertenece a un dominio autorizado (taligent.com.ar, taligent.com.uy, taligent.us)",
      variant: "destructive",
    });
    // Clear error from URL
    window.history.replaceState({}, '', '/auth');
  } else if (oauthError && oauthError === "oauth_failed") {
    toast({
      title: "Error de autenticación",
      description: "Hubo un problema al autenticarte con Google. Intenta nuevamente.",
      variant: "destructive",
    });
    window.history.replaceState({}, '', '/auth');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = isLogin
        ? await login(email, password)
        : await register(email, password, name);

      if (user) {
        toast({
          title: `¡Bienvenido, ${user.name}!`,
          description: getRoleDescription(user.role),
        });

        // Navigate based on role
        if (user.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast({
          title: "Error",
          description: isLogin ? "Credenciales incorrectas" : "Error al registrarse",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Acceso al panel de administración';
      default:
        return 'Listo para hacer predicciones';
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${backendUrl}/api/auth/google/login`;
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
            <h1 className="text-2xl font-bold text-foreground">TaliProde</h1>
            <p className="text-sm text-muted-foreground">Mundial FIFA 2026</p>
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

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">O continuar con</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google Workspace
            </Button>

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
          © 2026 Taligent. Hecho con ⚽ para los fanáticos del fútbol.
        </p>
      </footer>
    </div>
  );
};

export default Auth;

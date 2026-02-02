import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";

/**
 * AuthCallback Component
 * 
 * Handles OAuth callback from Google
 * Receives JWT token from backend, stores it, and redirects user
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast({
        title: "Error de autenticación",
        description: "No se recibió el token de autenticación",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Store token
    localStorage.setItem("token", token);

    // Fetch user info to determine redirect
    const fetchUser = async () => {
      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const user = await response.json();

        // Update auth context with user info
        setCurrentUser(user);

        toast({
          title: `¡Bienvenido, ${user.name}!`,
          description: user.role === 'admin' 
            ? 'Acceso al panel de administración' 
            : 'Listo para hacer predicciones',
        });

        // Navigate based on role
        if (user.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error",
          description: "No se pudo obtener la información del usuario",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    fetchUser();
  }, [searchParams, navigate, setCurrentUser, toast]);

  return (
    <div className="min-h-screen bg-background pitch-pattern flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl gradient-pitch flex items-center justify-center shadow-lg animate-pulse">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Autenticando...
        </h2>
        <p className="text-muted-foreground">
          Estamos verificando tus credenciales
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;

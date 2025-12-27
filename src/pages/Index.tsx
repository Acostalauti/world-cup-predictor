import { Trophy, ArrowRight, Users, Target, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Grupos privados",
      description: "Crea grupos con amigos y compite entre ustedes",
    },
    {
      icon: Target,
      title: "Predicciones",
      description: "Predice los resultados de cada partido del Mundial",
    },
    {
      icon: Eye,
      title: "Rankings en vivo",
      description: "Sigue tu posición en tiempo real durante el torneo",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 pitch-pattern">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-accent/10 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-2xl gradient-pitch flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-subtle">
            <Trophy className="w-10 h-10 text-primary-foreground" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            Prode Mundial
          </h1>
          <p className="text-xl md:text-2xl text-primary font-semibold mb-4">
            FIFA 2026
          </p>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Compite con tus amigos prediciendo los resultados del Mundial.
            Sin publicidad. Sin apuestas. Solo diversión.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="xl"
              onClick={() => navigate("/auth")}
              className="group"
            >
              Comenzar ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* World Cup Badge */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-muted-foreground">
          <span>🇺🇸</span>
          <span>🇲🇽</span>
          <span>🇨🇦</span>
          <span className="ml-2">USA • México • Canadá 2026</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card border-t border-border">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-12">
            ¿Cómo funciona?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-xl bg-background border border-border shadow-card animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 gradient-pitch">
        <div className="container max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            ¿Listo para demostrar quién sabe más de fútbol?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            El Mundial 2026 está por comenzar. Crea tu grupo ahora y prepárate
            para competir.
          </p>
          <Button
            variant="gold"
            size="xl"
            onClick={() => navigate("/auth")}
            className="group"
          >
            Crear mi grupo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-background">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-pitch flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Prode Mundial 2026</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Hecho con ⚽ para los fanáticos del fútbol. 100% gratuito, sin publicidad.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © 2026 Prode Mundial. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

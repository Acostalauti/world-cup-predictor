import { useState } from "react";
import { Copy, Check, Users, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const scoringSystems = [
  {
    id: "classic",
    name: "Clásico",
    description: "3 pts resultado exacto, 1 pt acertar ganador",
  },
  {
    id: "extended",
    name: "Extendido",
    description: "5 pts exacto, 3 pts diferencia goles, 1 pt ganador",
  },
  {
    id: "simple",
    name: "Simple",
    description: "2 pts por acertar el ganador",
  },
];

const CreateGroup = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scoringSystem, setScoringSystem] = useState("classic");
  const [isCreated, setIsCreated] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(generatedCode);
    setIsCreated(true);

    toast({
      title: "¡Grupo creado!",
      description: "Tu grupo ha sido creado exitosamente.",
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Código copiado",
      description: "El código de invitación ha sido copiado al portapapeles.",
    });
  };

  if (isCreated) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack />

        <main className="container py-6">
          <Card className="max-w-md mx-auto shadow-card animate-scale-in">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full gradient-pitch flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">¡Grupo creado!</CardTitle>
              <CardDescription>
                Comparte el código de invitación con tus amigos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-secondary rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Código de invitación
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-bold tracking-widest text-foreground">
                    {inviteCode}
                  </span>
                  <Button variant="ghost" size="icon" onClick={copyCode}>
                    {copied ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate("/dashboard")}>
                  Ir al grupo
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/dashboard")}
                >
                  Volver al inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack />

      <main className="container py-6">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              Crear nuevo grupo
            </h2>
            <p className="text-muted-foreground">
              Configura tu grupo para el Mundial 2026
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Group Info */}
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Información del grupo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del grupo *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Amigos del barrio"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descripción{" "}
                    <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Añade una descripción para tu grupo..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Scoring System */}
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Sistema de puntuación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={scoringSystem}
                  onValueChange={setScoringSystem}
                  className="space-y-3"
                >
                  {scoringSystems.map((system) => (
                    <div
                      key={system.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        scoringSystem === system.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-secondary/50"
                      }`}
                      onClick={() => setScoringSystem(system.id)}
                    >
                      <RadioGroupItem value={system.id} id={system.id} className="mt-0.5" />
                      <div className="flex-1">
                        <Label
                          htmlFor={system.id}
                          className="font-medium cursor-pointer"
                        >
                          {system.name}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {system.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full">
              Crear grupo
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateGroup;

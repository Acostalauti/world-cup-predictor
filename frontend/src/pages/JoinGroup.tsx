import { useState } from "react";
import { UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const JoinGroup = () => {
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "¡Te uniste al grupo!",
      description: "Ahora puedes comenzar a hacer predicciones.",
    });

    setIsLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBack />

      <main className="container py-6">
        <div className="max-w-md mx-auto">
          <Card className="shadow-card animate-slide-up">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Unirse a un grupo</CardTitle>
              <CardDescription>
                Ingresa el código de invitación que te compartieron
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code">Código de invitación</Label>
                  <Input
                    id="code"
                    placeholder="Ej: ABC123"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    required
                    maxLength={10}
                    className="text-center text-lg tracking-widest uppercase font-semibold"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || inviteCode.length < 4}
                >
                  {isLoading ? (
                    <span className="animate-pulse">Buscando grupo...</span>
                  ) : (
                    <>
                      Unirme al grupo
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                El código tiene entre 4 y 10 caracteres y fue compartido por el
                administrador del grupo.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default JoinGroup;

import { useState } from "react";
import { Settings, Copy, Check, Link, Users, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface GroupSettingsProps {
  groupName: string;
  groupDescription?: string;
  inviteCode: string;
  inviteLink: string;
  scoringSystem: {
    exactScore: number;
    correctResult: number;
    correctGoalDiff: number;
  };
}

const GroupSettings = ({
  groupName,
  groupDescription = "",
  inviteCode,
  inviteLink,
  scoringSystem,
}: GroupSettingsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  const handleCopy = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast({
      title: "Copiado",
      description: type === "code" ? "Código copiado al portapapeles" : "Enlace copiado al portapapeles",
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Group Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Información del grupo
          </CardTitle>
          <CardDescription>
            Configura los detalles básicos de tu grupo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Nombre del grupo</Label>
            <Input id="groupName" defaultValue={groupName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groupDesc">Descripción (opcional)</Label>
            <Input id="groupDesc" defaultValue={groupDescription} placeholder="Describe tu grupo..." />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Grupo público</Label>
              <p className="text-sm text-muted-foreground">
                Permitir que cualquier persona encuentre y se una
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <Button className="w-full">Guardar cambios</Button>
        </CardContent>
      </Card>

      {/* Invite Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Invitar jugadores
          </CardTitle>
          <CardDescription>
            Comparte el código o enlace para que otros se unan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Código de invitación</Label>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-lg tracking-widest text-center border border-border">
                {inviteCode}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(inviteCode, "code")}
              >
                {copied === "code" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Enlace de invitación</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={inviteLink}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(inviteLink, "link")}
              >
                {copied === "link" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Link className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            Generar nuevo código
          </Button>
        </CardContent>
      </Card>

      {/* Scoring System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Sistema de puntuación
          </CardTitle>
          <CardDescription>
            Define cuántos puntos otorga cada tipo de acierto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-xl">
              <div className="text-2xl font-bold text-primary mb-1">
                {scoringSystem.exactScore}
              </div>
              <div className="text-xs text-muted-foreground">Resultado exacto</div>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <div className="text-2xl font-bold text-amber-500 mb-1">
                {scoringSystem.correctResult}
              </div>
              <div className="text-xs text-muted-foreground">Ganador correcto</div>
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {scoringSystem.correctGoalDiff}
              </div>
              <div className="text-xs text-muted-foreground">Diferencia goles</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            El sistema de puntuación no puede modificarse una vez iniciado el torneo
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de peligro</CardTitle>
          <CardDescription>
            Acciones irreversibles para el grupo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10">
            Eliminar grupo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupSettings;

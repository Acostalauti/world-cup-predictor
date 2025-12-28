import { useState } from "react";
import { Users, Crown, MoreVertical, UserMinus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  joinedAt: string;
  points: number;
}

interface GroupMembersProps {
  members: Member[];
  currentUserId: string;
}

const GroupMembers = ({ members, currentUserId }: GroupMembersProps) => {
  const { toast } = useToast();

  const handleMakeAdmin = (memberId: string, name: string) => {
    toast({
      title: "Admin asignado",
      description: `${name} ahora es administrador del grupo`,
    });
  };

  const handleRemoveMember = (memberId: string, name: string) => {
    toast({
      title: "Miembro eliminado",
      description: `${name} fue eliminado del grupo`,
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Miembros del grupo
          </CardTitle>
          <CardDescription>
            {members.length} jugadores en este grupo
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {members.map((member) => (
              <div
                key={member.id}
                className={`p-4 flex items-center justify-between ${
                  member.id === currentUserId ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{member.name}</p>
                      {member.isAdmin && (
                        <Crown className="w-4 h-4 text-amber-500" />
                      )}
                      {member.id === currentUserId && (
                        <span className="text-xs text-primary">(Tú)</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.points} pts · {member.joinedAt}
                    </p>
                  </div>
                </div>

                {member.id !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!member.isAdmin && (
                        <DropdownMenuItem
                          onClick={() => handleMakeAdmin(member.id, member.name)}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Hacer administrador
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleRemoveMember(member.id, member.name)}
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Eliminar del grupo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupMembers;

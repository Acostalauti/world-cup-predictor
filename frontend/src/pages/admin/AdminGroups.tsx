import { Trophy, Search, MoreVertical, Eye, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const mockGroups = [
  { id: "1", name: "Amigos de la Facu", playerCount: 8, createdAt: "2024-12-20", admin: "Carlos García", status: "active" },
  { id: "2", name: "Familia García", playerCount: 12, createdAt: "2024-12-19", admin: "María López", status: "active" },
  { id: "3", name: "Oficina Tech", playerCount: 15, createdAt: "2024-12-17", admin: "Juan Pérez", status: "active" },
  { id: "4", name: "Grupo Barrio Norte", playerCount: 6, createdAt: "2024-12-15", admin: "Ana Martínez", status: "inactive" },
  { id: "5", name: "Los Campeones", playerCount: 20, createdAt: "2024-12-10", admin: "Pedro Sánchez", status: "active" },
];

const AdminGroups = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredGroups = mockGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.admin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPlayers = mockGroups.reduce((acc, g) => acc + g.playerCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header userName={currentUser?.name} showBack onLogout={handleLogout} />

      <main className="container py-6 pb-8">
        <section className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-foreground">Ver Grupos</h2>
          </div>
          <p className="text-muted-foreground">
            Visualiza y administra todos los grupos de la plataforma
          </p>
        </section>

        {/* Search */}
        <section className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre del grupo o admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </section>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{mockGroups.length}</div>
              <div className="text-xs text-muted-foreground">Total Grupos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{totalPlayers}</div>
              <div className="text-xs text-muted-foreground">Jugadores</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {mockGroups.filter((g) => g.status === "active").length}
              </div>
              <div className="text-xs text-muted-foreground">Activos</div>
            </CardContent>
          </Card>
        </section>

        {/* Groups List */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredGroups.map((group) => (
                <div key={group.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Admin: {group.admin} · {group.playerCount} jugadores
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        group.status === "active"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {group.status === "active" ? "Activo" : "Inactivo"}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/group/${group.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="w-4 h-4 mr-2" />
                          Ver Miembros
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar Grupo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminGroups;

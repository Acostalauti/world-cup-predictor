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
import { useEffect, useState } from "react";
import { client } from "@/api/client";
import type { components } from "@/types/api";

type Group = components["schemas"]["Group"];
type User = components["schemas"]["User"];

const AdminGroups = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, usersRes] = await Promise.all([
          client.GET("/groups", { params: { query: { filter: "all" } } }),
          client.GET("/users")
        ]);

        if (groupsRes.data) {
          setGroups(groupsRes.data);
        }
        if (usersRes.data) {
          setUsers(usersRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch groups data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAdminName = (adminId: string) => {
    const user = users.find(u => u.id === adminId);
    return user ? user.name : "Desconocido";
  };

  const filteredGroups = groups.filter((group) => {
    const adminName = getAdminName(group.adminId);
    return (
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adminName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPlayers = groups.reduce((acc, g) => acc + (g.playerCount || 0), 0);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

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
              <div className="text-2xl font-bold text-foreground">{groups.length}</div>
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
                {groups.filter((g) => g.status === "active").length}
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
                        Admin: {getAdminName(group.adminId)} · {group.playerCount || 0} jugadores
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${group.status === "active"
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
                        <DropdownMenuItem onClick={() => navigate('/admin/users')}>
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

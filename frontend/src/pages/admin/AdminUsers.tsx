import { Users, Search, MoreVertical, Shield, Mail, Trash2, UserCog, Ban, ArrowUp, ArrowDown } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { client } from "@/api/client";
import type { components } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

type User = components["schemas"]["User"];

const AdminUsers = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await client.GET("/api/users");
      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId: string) => {
    try {
      const { error } = await client.POST("/api/admin/users/{user_id}/promote", {
        params: { path: { user_id: userId } }
      });
      
      if (!error) {
        toast({ title: "Usuario promovido a Admin" });
        fetchUsers(); // Refresh list
      } else {
        toast({ title: "Error al promover usuario", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error promoting user:", error);
      toast({ title: "Error al promover usuario", variant: "destructive" });
    }
  };

  const handleDemote = async (userId: string) => {
    try {
      const { error } = await client.POST("/api/admin/users/{user_id}/demote", {
        params: { path: { user_id: userId } }
      });
      
      if (!error) {
        toast({ title: "Usuario degradado a Player" });
        fetchUsers(); // Refresh list
      } else {
        toast({ title: "Error al degradar usuario", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error demoting user:", error);
      toast({ title: "Error al degradar usuario", variant: "destructive" });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      default:
        return "Jugador";
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userName={currentUser?.name} showBack onLogout={handleLogout} />

      <main className="container py-6 pb-8">
        <section className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Gestionar Usuarios</h2>
          </div>
          <p className="text-muted-foreground">
            Administra los usuarios de la plataforma
          </p>
        </section>

        {/* Filters */}
        <section className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="player">Jugadores</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
            </SelectContent>
          </Select>
        </section>

        {/* Stats */}
        <section className="mb-6 grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{users.length}</div>
              <div className="text-xs text-muted-foreground">Total Usuarios</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {users.filter((u) => u.role === "player").length}
              </div>
              <div className="text-xs text-muted-foreground">Jugadores</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {users.filter((u) => u.role === "admin").length}
              </div>
              <div className="text-xs text-muted-foreground">Admins</div>
            </CardContent>
          </Card>
        </section>

        {/* Users List */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {getRoleLabel(user.role)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Enviar Email
                        </DropdownMenuItem>
                        {user.role === "player" ? (
                          <DropdownMenuItem onClick={() => handlePromote(user.id!)}>
                            <ArrowUp className="w-4 h-4 mr-2" />
                            Promover a Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleDemote(user.id!)}
                            disabled={user.id === currentUser?.id}
                          >
                            <ArrowDown className="w-4 h-4 mr-2" />
                            Degradar a Player
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Ban className="w-4 h-4 mr-2" />
                          Suspender
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
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

export default AdminUsers;

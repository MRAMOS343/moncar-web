import { useState } from "react";
import { Users, Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useData } from '@/contexts/DataContext';
import { Team } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLoadingState } from "@/hooks/useLoadingState";
import { EmptyState } from "@/components/ui/empty-state";
import { showSuccessToast, showErrorToast } from "@/utils/toastHelpers";

export default function EquiposPage() {
  const { teams: initialTeams, warehouses } = useData();
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    lider: "",
    miembros: "",
    warehouseId: ""
  });
  const { isLoading } = useLoadingState({ minLoadingTime: 500 });

  const filteredTeams = teams.filter(team =>
    team.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.lider?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        nombre: team.nombre,
        descripcion: team.descripcion || "",
        lider: team.lider || "",
        miembros: team.miembros.join(", "),
        warehouseId: team.warehouseId || ""
      });
    } else {
      setEditingTeam(null);
      setFormData({
        nombre: "",
        descripcion: "",
        lider: "",
        miembros: "",
        warehouseId: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveTeam = () => {
    if (!formData.nombre.trim()) {
      showErrorToast("El nombre del equipo es requerido");
      return;
    }

    const miembrosArray = formData.miembros
      .split(",")
      .map(m => m.trim())
      .filter(m => m.length > 0);

    if (editingTeam) {
      setTeams(teams.map(t =>
        t.id === editingTeam.id
          ? {
              ...editingTeam,
              nombre: formData.nombre,
              descripcion: formData.descripcion,
              lider: formData.lider,
              miembros: miembrosArray,
              warehouseId: formData.warehouseId || undefined
            }
          : t
      ));
      showSuccessToast("Equipo actualizado correctamente");
    } else {
      const newTeam: Team = {
        id: `t${teams.length + 1}`,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        lider: formData.lider,
        miembros: miembrosArray,
        warehouseId: formData.warehouseId || undefined,
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
      setTeams([...teams, newTeam]);
      showSuccessToast("Equipo creado correctamente");
    }

    setIsDialogOpen(false);
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId));
    showSuccessToast("Equipo eliminado correctamente");
  };

  return (
    <main role="main" aria-label="Contenido principal">
      <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipos de Trabajo</h1>
          <p className="text-muted-foreground mt-1">Gestiona los equipos y grupos de trabajo</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="btn-hover">
              <Plus className="w-4 h-4 mr-2" />
              Crear Equipo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTeam ? "Editar Equipo" : "Crear Nuevo Equipo"}</DialogTitle>
              <DialogDescription>
                {editingTeam ? "Actualiza los datos del equipo" : "Completa la información para crear un nuevo equipo"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Equipo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Equipo Ventas Norte"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción del equipo y sus responsabilidades"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lider">Líder del Equipo</Label>
                <Input
                  id="lider"
                  value={formData.lider}
                  onChange={(e) => setFormData({ ...formData, lider: e.target.value })}
                  placeholder="Nombre del líder"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="miembros">Miembros (separados por coma)</Label>
                <Textarea
                  id="miembros"
                  value={formData.miembros}
                  onChange={(e) => setFormData({ ...formData, miembros: e.target.value })}
                  placeholder="Juan Pérez, María López, Carlos González"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse">Sucursal Asignada (opcional)</Label>
                <Select value={formData.warehouseId} onValueChange={(value) => setFormData({ ...formData, warehouseId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sucursal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin sucursal</SelectItem>
                    {warehouses.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="btn-hover">
                Cancelar
              </Button>
              <Button onClick={handleSaveTeam} className="btn-hover">
                {editingTeam ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar equipos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredTeams.length} {filteredTeams.length === 1 ? "equipo" : "equipos"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Card className="animate-pulse"><CardContent className="h-64" /></Card>
            <Card className="animate-pulse"><CardContent className="h-64" /></Card>
            <Card className="animate-pulse"><CardContent className="h-64" /></Card>
          </>
        ) : (
          filteredTeams.map((team) => (
            <Card key={team.id} className="card-hover hover:shadow-lg transition-shadow animate-fade-in">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{team.nombre}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Creado: {new Date(team.fechaCreacion).toLocaleDateString('es-MX')}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {team.descripcion && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {team.descripcion}
                </p>
              )}
              
              {team.lider && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Líder</p>
                  <Badge variant="secondary">{team.lider}</Badge>
                </div>
              )}

              {team.warehouseId && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Sucursal</p>
                  <Badge variant="outline">
                    {warehouses.find(w => w.id === team.warehouseId)?.nombre}
                  </Badge>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Miembros ({team.miembros.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {team.miembros.slice(0, 3).map((miembro, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {miembro}
                    </Badge>
                  ))}
                  {team.miembros.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{team.miembros.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 btn-hover touch-target"
                  onClick={() => handleOpenDialog(team)}
                  aria-label={`Editar equipo ${team.nombre}`}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="btn-hover touch-target"
                  onClick={() => handleDeleteTeam(team.id)}
                  aria-label={`Eliminar equipo ${team.nombre}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {filteredTeams.length === 0 && !isLoading && (
        <EmptyState
          icon={Users}
          title="No se encontraron equipos"
          description={searchTerm ? "Intenta con otro término de búsqueda" : "Crea tu primer equipo para comenzar"}
          action={{
            label: "Crear equipo",
            onClick: () => handleOpenDialog()
          }}
        />
      )}
      </div>
    </main>
  );
}

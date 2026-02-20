import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus, Pencil, Trash2, Search, X, Check, Loader2,
  Building2, GraduationCap, BookOpen, MapPin, ToggleLeft, ToggleRight,
} from "lucide-react";

type FpCenter = {
  id: string;
  name: string;
  municipio: string;
  isla: string;
  active: boolean;
  createdAt: string;
};

type Familia = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
};

type Ciclo = {
  id: string;
  name: string;
  familiaId: string;
  active: boolean;
  createdAt: string;
  familiaName?: string;
};

const ISLAS = [
  "Tenerife", "Gran Canaria", "Lanzarote", "Fuerteventura",
  "La Palma", "La Gomera", "El Hierro",
];

export function CentrosFpManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newMunicipio, setNewMunicipio] = useState("");
  const [newIsla, setNewIsla] = useState("");
  const [editName, setEditName] = useState("");
  const [editMunicipio, setEditMunicipio] = useState("");
  const [editIsla, setEditIsla] = useState("");

  const { data: centers = [], isLoading } = useQuery<FpCenter[]>({
    queryKey: ["/api/admin/fp-centers"],
  });

  const createMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/fp-centers", { name: newName, municipio: newMunicipio, isla: newIsla }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fp-centers"] });
      toast({ title: "Centro FP creado correctamente" });
      setShowAdd(false);
      setNewName("");
      setNewMunicipio("");
      setNewIsla("");
    },
    onError: () => toast({ title: "Error al crear centro FP", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/admin/fp-centers/${id}`, { name: editName, municipio: editMunicipio, isla: editIsla }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fp-centers"] });
      toast({ title: "Centro FP actualizado correctamente" });
      setEditingId(null);
    },
    onError: () => toast({ title: "Error al actualizar centro FP", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => apiRequest("PATCH", `/api/admin/fp-centers/${id}`, { active: !active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fp-centers"] });
      toast({ title: "Estado actualizado" });
    },
    onError: () => toast({ title: "Error al cambiar estado", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/fp-centers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fp-centers"] });
      toast({ title: "Centro FP eliminado correctamente" });
    },
    onError: () => toast({ title: "Error al eliminar centro FP", variant: "destructive" }),
  });

  const filtered = centers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.municipio.toLowerCase().includes(q) || c.isla.toLowerCase().includes(q);
  });

  const startEdit = (c: FpCenter) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditMunicipio(c.municipio);
    setEditIsla(c.isla);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar centro, municipio o isla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-fp-centers"
          />
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} centros</p>
        <Button onClick={() => setShowAdd(!showAdd)} data-testid="button-add-fp-center">
          <Plus className="w-4 h-4 mr-1" /> Añadir centro
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del centro" data-testid="input-new-fp-center-name" />
            </div>
            <div className="space-y-2">
              <Label>Municipio</Label>
              <Input value={newMunicipio} onChange={(e) => setNewMunicipio(e.target.value)} placeholder="Municipio" data-testid="input-new-fp-center-municipio" />
            </div>
            <div className="space-y-2">
              <Label>Isla</Label>
              <Select value={newIsla} onValueChange={setNewIsla}>
                <SelectTrigger data-testid="select-new-fp-center-isla">
                  <SelectValue placeholder="Seleccionar isla" />
                </SelectTrigger>
                <SelectContent>
                  {ISLAS.map((isla) => (
                    <SelectItem key={isla} value={isla}>{isla}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newName || !newMunicipio || !newIsla || createMutation.isPending}
              data-testid="button-save-new-fp-center"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
              Guardar
            </Button>
            <Button variant="outline" onClick={() => { setShowAdd(false); setNewName(""); setNewMunicipio(""); setNewIsla(""); }} data-testid="button-cancel-new-fp-center">
              <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Card key={c.id} className="p-4" data-testid={`card-fp-center-${c.id}`}>
              {editingId === c.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} data-testid={`input-edit-fp-center-name-${c.id}`} />
                    </div>
                    <div className="space-y-2">
                      <Label>Municipio</Label>
                      <Input value={editMunicipio} onChange={(e) => setEditMunicipio(e.target.value)} data-testid={`input-edit-fp-center-municipio-${c.id}`} />
                    </div>
                    <div className="space-y-2">
                      <Label>Isla</Label>
                      <Select value={editIsla} onValueChange={setEditIsla}>
                        <SelectTrigger data-testid={`select-edit-fp-center-isla-${c.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ISLAS.map((isla) => (
                            <SelectItem key={isla} value={isla}>{isla}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      onClick={() => updateMutation.mutate(c.id)}
                      disabled={!editName || !editMunicipio || !editIsla || updateMutation.isPending}
                      data-testid={`button-save-edit-fp-center-${c.id}`}
                    >
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)} data-testid={`button-cancel-edit-fp-center-${c.id}`}>
                      <X className="w-4 h-4 mr-1" /> Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium" data-testid={`text-fp-center-name-${c.id}`}>{c.name}</span>
                      {c.active
                        ? <Badge variant="default" className="text-xs">Activo</Badge>
                        : <Badge variant="secondary" className="text-xs">Inactivo</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.municipio}</span>
                      <span>{c.isla}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleMutation.mutate({ id: c.id, active: c.active })}
                      disabled={toggleMutation.isPending}
                      title={c.active ? "Desactivar" : "Activar"}
                      data-testid={`button-toggle-fp-center-${c.id}`}
                    >
                      {c.active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => startEdit(c)} data-testid={`button-edit-fp-center-${c.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" data-testid={`button-delete-fp-center-${c.id}`}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar centro FP</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará permanentemente el centro <strong>{c.name}</strong>. Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(c.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-confirm-delete-fp-center-${c.id}`}
                          >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </Card>
          ))}
          {filtered.length === 0 && !isLoading && (
            <p className="text-center text-sm text-muted-foreground py-8">No se encontraron centros FP.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function FamiliasProfesionalesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editName, setEditName] = useState("");

  const { data: familias = [], isLoading } = useQuery<Familia[]>({
    queryKey: ["/api/admin/familias"],
  });

  const createMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/familias", { name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/familias"] });
      toast({ title: "Familia profesional creada correctamente" });
      setShowAdd(false);
      setNewName("");
    },
    onError: () => toast({ title: "Error al crear familia profesional", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/admin/familias/${id}`, { name: editName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/familias"] });
      toast({ title: "Familia profesional actualizada correctamente" });
      setEditingId(null);
    },
    onError: () => toast({ title: "Error al actualizar familia profesional", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => apiRequest("PATCH", `/api/admin/familias/${id}`, { active: !active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/familias"] });
      toast({ title: "Estado actualizado" });
    },
    onError: () => toast({ title: "Error al cambiar estado", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/familias/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/familias"] });
      toast({ title: "Familia profesional eliminada correctamente" });
    },
    onError: () => toast({ title: "Error al eliminar familia profesional", variant: "destructive" }),
  });

  const filtered = familias.filter((f) => {
    if (!search) return true;
    return f.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar familia profesional..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-familias"
          />
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} familias</p>
        <Button onClick={() => setShowAdd(!showAdd)} data-testid="button-add-familia">
          <Plus className="w-4 h-4 mr-1" /> Añadir familia
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre de la familia profesional" data-testid="input-new-familia-name" />
          </div>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newName || createMutation.isPending}
              data-testid="button-save-new-familia"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
              Guardar
            </Button>
            <Button variant="outline" onClick={() => { setShowAdd(false); setNewName(""); }} data-testid="button-cancel-new-familia">
              <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((f) => (
            <Card key={f.id} className="p-4" data-testid={`card-familia-${f.id}`}>
              {editingId === f.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} data-testid={`input-edit-familia-name-${f.id}`} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      onClick={() => updateMutation.mutate(f.id)}
                      disabled={!editName || updateMutation.isPending}
                      data-testid={`button-save-edit-familia-${f.id}`}
                    >
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)} data-testid={`button-cancel-edit-familia-${f.id}`}>
                      <X className="w-4 h-4 mr-1" /> Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                    <GraduationCap className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium" data-testid={`text-familia-name-${f.id}`}>{f.name}</span>
                    {f.active
                      ? <Badge variant="default" className="text-xs">Activa</Badge>
                      : <Badge variant="secondary" className="text-xs">Inactiva</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleMutation.mutate({ id: f.id, active: f.active })}
                      disabled={toggleMutation.isPending}
                      title={f.active ? "Desactivar" : "Activar"}
                      data-testid={`button-toggle-familia-${f.id}`}
                    >
                      {f.active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => { setEditingId(f.id); setEditName(f.name); }} data-testid={`button-edit-familia-${f.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" data-testid={`button-delete-familia-${f.id}`}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar familia profesional</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará permanentemente la familia <strong>{f.name}</strong> y todos los ciclos formativos asociados. Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(f.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-confirm-delete-familia-${f.id}`}
                          >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </Card>
          ))}
          {filtered.length === 0 && !isLoading && (
            <p className="text-center text-sm text-muted-foreground py-8">No se encontraron familias profesionales.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function CiclosFormativosManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newFamiliaId, setNewFamiliaId] = useState("");
  const [editName, setEditName] = useState("");
  const [editFamiliaId, setEditFamiliaId] = useState("");

  const { data: ciclos = [], isLoading } = useQuery<Ciclo[]>({
    queryKey: ["/api/admin/ciclos"],
  });

  const { data: familias = [] } = useQuery<Familia[]>({
    queryKey: ["/api/admin/familias"],
  });

  const createMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/ciclos", { name: newName, familiaId: newFamiliaId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ciclos"] });
      toast({ title: "Ciclo formativo creado correctamente" });
      setShowAdd(false);
      setNewName("");
      setNewFamiliaId("");
    },
    onError: () => toast({ title: "Error al crear ciclo formativo", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/admin/ciclos/${id}`, { name: editName, familiaId: editFamiliaId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ciclos"] });
      toast({ title: "Ciclo formativo actualizado correctamente" });
      setEditingId(null);
    },
    onError: () => toast({ title: "Error al actualizar ciclo formativo", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => apiRequest("PATCH", `/api/admin/ciclos/${id}`, { active: !active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ciclos"] });
      toast({ title: "Estado actualizado" });
    },
    onError: () => toast({ title: "Error al cambiar estado", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/ciclos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ciclos"] });
      toast({ title: "Ciclo formativo eliminado correctamente" });
    },
    onError: () => toast({ title: "Error al eliminar ciclo formativo", variant: "destructive" }),
  });

  const filtered = ciclos.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.familiaName?.toLowerCase().includes(q));
  });

  const startEdit = (c: Ciclo) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditFamiliaId(c.familiaId);
  };

  const activeFamilias = familias.filter((f) => f.active);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ciclo formativo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-ciclos"
          />
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} ciclos</p>
        <Button onClick={() => setShowAdd(!showAdd)} data-testid="button-add-ciclo">
          <Plus className="w-4 h-4 mr-1" /> Añadir ciclo
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del ciclo formativo" data-testid="input-new-ciclo-name" />
            </div>
            <div className="space-y-2">
              <Label>Familia profesional</Label>
              <Select value={newFamiliaId} onValueChange={setNewFamiliaId}>
                <SelectTrigger data-testid="select-new-ciclo-familia">
                  <SelectValue placeholder="Seleccionar familia" />
                </SelectTrigger>
                <SelectContent>
                  {activeFamilias.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newName || !newFamiliaId || createMutation.isPending}
              data-testid="button-save-new-ciclo"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
              Guardar
            </Button>
            <Button variant="outline" onClick={() => { setShowAdd(false); setNewName(""); setNewFamiliaId(""); }} data-testid="button-cancel-new-ciclo">
              <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Card key={c.id} className="p-4" data-testid={`card-ciclo-${c.id}`}>
              {editingId === c.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} data-testid={`input-edit-ciclo-name-${c.id}`} />
                    </div>
                    <div className="space-y-2">
                      <Label>Familia profesional</Label>
                      <Select value={editFamiliaId} onValueChange={setEditFamiliaId}>
                        <SelectTrigger data-testid={`select-edit-ciclo-familia-${c.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {activeFamilias.map((f) => (
                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      onClick={() => updateMutation.mutate(c.id)}
                      disabled={!editName || !editFamiliaId || updateMutation.isPending}
                      data-testid={`button-save-edit-ciclo-${c.id}`}
                    >
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)} data-testid={`button-cancel-edit-ciclo-${c.id}`}>
                      <X className="w-4 h-4 mr-1" /> Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium" data-testid={`text-ciclo-name-${c.id}`}>{c.name}</span>
                      {c.active
                        ? <Badge variant="default" className="text-xs">Activo</Badge>
                        : <Badge variant="secondary" className="text-xs">Inactivo</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <GraduationCap className="w-3 h-3" />
                      <span>{c.familiaName || "Sin familia"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleMutation.mutate({ id: c.id, active: c.active })}
                      disabled={toggleMutation.isPending}
                      title={c.active ? "Desactivar" : "Activar"}
                      data-testid={`button-toggle-ciclo-${c.id}`}
                    >
                      {c.active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => startEdit(c)} data-testid={`button-edit-ciclo-${c.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" data-testid={`button-delete-ciclo-${c.id}`}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar ciclo formativo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará permanentemente el ciclo <strong>{c.name}</strong>. Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(c.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-confirm-delete-ciclo-${c.id}`}
                          >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </Card>
          ))}
          {filtered.length === 0 && !isLoading && (
            <p className="text-center text-sm text-muted-foreground py-8">No se encontraron ciclos formativos.</p>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { JobOffer, User } from "@shared/schema";
import {
  Shield, Users, Briefcase, FileText, LogOut, Loader2,
  Trash2, ToggleLeft, ToggleRight, Mail, Phone, Building2,
  GraduationCap, MapPin, Eye, EyeOff, BarChart3, Settings, Send, MessageCircle,
  TrendingUp, ChevronDown, ChevronRight, School, BookOpen, Library,
  Download, Copy, ClipboardCopy, ArrowUpRight, ArrowDownRight, Target, Award, DollarSign, Activity, Percent, Clock
} from "lucide-react";
import { CentrosFpManager, FamiliasProfesionalesManager, CiclosFormativosManager } from "@/components/admin-tables-manager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Stats = {
  totalUsers: number;
  totalAlumni: number;
  totalCompanies: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
};

type AdminJobOffer = JobOffer & { company?: { companyName: string | null; name: string; companyLogoUrl: string | null } };
type AdminApplication = {
  id: string;
  alumniId: string;
  jobOfferId: string;
  coverLetter: string | null;
  status: string;
  appliedAt: string;
  alumni?: { name: string; email: string };
  jobOffer?: { title: string };
};

const roleLabels: Record<string, string> = {
  ALUMNI: "Titulado FP",
  COMPANY: "Empresa",
  ADMIN: "Administrador",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  REVIEWED: "Revisada",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
};

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "outline",
  REVIEWED: "secondary",
  ACCEPTED: "default",
  REJECTED: "destructive",
};

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: "Jornada completa",
  PART_TIME: "Media jornada",
  INTERNSHIP: "Prácticas",
  FREELANCE: "Freelance",
  REMOTE: "Remoto",
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: allJobs = [], isLoading: jobsLoading } = useQuery<AdminJobOffer[]>({
    queryKey: ["/api/admin/jobs"],
  });

  const { data: allApps = [], isLoading: appsLoading } = useQuery<AdminApplication[]>({
    queryKey: ["/api/admin/applications"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("DELETE", `/api/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({ title: "Usuario eliminado correctamente" });
    },
    onError: (err: any) => toast({ title: err?.message || "Error al eliminar usuario", variant: "destructive" }),
  });

  const createAdminMutation = useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) =>
      apiRequest("POST", "/api/admin/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Administrador creado correctamente" });
      setShowAddAdmin(false);
      setNewAdminData({ email: "", password: "", name: "" });
    },
    onError: (err: any) => toast({ title: err?.message || "Error al crear administrador", variant: "destructive" }),
  });

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ email: "", password: "", name: "" });

  const toggleJobMutation = useMutation({
    mutationFn: (jobId: string) => apiRequest("PATCH", `/api/admin/jobs/${jobId}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Estado de oferta actualizado" });
    },
    onError: () => toast({ title: "Error al actualizar oferta", variant: "destructive" }),
  });

  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => apiRequest("DELETE", `/api/admin/jobs/${jobId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({ title: "Oferta eliminada correctamente" });
    },
    onError: () => toast({ title: "Error al eliminar oferta", variant: "destructive" }),
  });

  const [userSearch, setUserSearch] = useState("");
  const [jobSearch, setJobSearch] = useState("");

  const filteredUsers = allUsers.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.companyName?.toLowerCase().includes(q));
  });

  const filteredJobs = allJobs.filter((j) => {
    if (!jobSearch) return true;
    const q = jobSearch.toLowerCase();
    return j.title.toLowerCase().includes(q) || j.location.toLowerCase().includes(q) || (j.company?.companyName?.toLowerCase().includes(q));
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold">Conecta FP Canarias - Admin</h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => logout()} data-testid="button-admin-logout">
            <LogOut className="w-4 h-4 mr-1" /> Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="stats">
          <TabsList className="mb-6">
            <TabsTrigger value="stats" data-testid="tab-admin-stats"><BarChart3 className="w-4 h-4 mr-1" /> Resumen</TabsTrigger>
            <TabsTrigger value="metrics" data-testid="tab-admin-metrics"><TrendingUp className="w-4 h-4 mr-1" /> Métricas</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-admin-users"><Users className="w-4 h-4 mr-1" /> Usuarios</TabsTrigger>
            <TabsTrigger value="jobs" data-testid="tab-admin-jobs"><Briefcase className="w-4 h-4 mr-1" /> Ofertas</TabsTrigger>
            <TabsTrigger value="applications" data-testid="tab-admin-apps"><FileText className="w-4 h-4 mr-1" /> Candidaturas</TabsTrigger>
            <TabsTrigger value="smtp" data-testid="tab-admin-smtp"><Settings className="w-4 h-4 mr-1" /> Correo</TabsTrigger>
            <TabsTrigger value="centros" data-testid="tab-admin-centros"><School className="w-4 h-4 mr-1" /> Centros FP</TabsTrigger>
            <TabsTrigger value="familias" data-testid="tab-admin-familias"><Library className="w-4 h-4 mr-1" /> Familias</TabsTrigger>
            <TabsTrigger value="ciclos" data-testid="tab-admin-ciclos"><BookOpen className="w-4 h-4 mr-1" /> Ciclos</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <StatsPanel stats={stats} isLoading={statsLoading} />
          </TabsContent>

          <TabsContent value="metrics">
            <MetricsPanel />
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Input
                  placeholder="Buscar por nombre, email o empresa..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="max-w-sm"
                  data-testid="input-admin-user-search"
                />
                <p className="text-sm text-muted-foreground">{filteredUsers.length} usuarios</p>
                <Button
                  size="sm"
                  onClick={() => setShowAddAdmin(!showAddAdmin)}
                  className="ml-auto gap-1"
                  data-testid="button-add-admin"
                >
                  <Shield className="w-4 h-4" />
                  {showAddAdmin ? "Cancelar" : "Nuevo Administrador"}
                </Button>
              </div>
              {showAddAdmin && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> Crear nuevo administrador</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      createAdminMutation.mutate(newAdminData);
                    }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    data-testid="form-add-admin"
                  >
                    <div>
                      <Label htmlFor="admin-name" className="text-xs mb-1 block">Nombre</Label>
                      <Input
                        id="admin-name"
                        placeholder="Nombre completo"
                        value={newAdminData.name}
                        onChange={(e) => setNewAdminData(d => ({ ...d, name: e.target.value }))}
                        required
                        data-testid="input-admin-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-email" className="text-xs mb-1 block">Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@ejemplo.com"
                        value={newAdminData.email}
                        onChange={(e) => setNewAdminData(d => ({ ...d, email: e.target.value }))}
                        required
                        data-testid="input-admin-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-password" className="text-xs mb-1 block">Contrasena</Label>
                      <div className="flex gap-2">
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="Contrasena segura"
                          value={newAdminData.password}
                          onChange={(e) => setNewAdminData(d => ({ ...d, password: e.target.value }))}
                          required
                          minLength={6}
                          data-testid="input-admin-password"
                        />
                        <Button type="submit" disabled={createAdminMutation.isPending} data-testid="button-submit-admin">
                          {createAdminMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Card>
              )}
              {usersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((u) => (
                    <UserRow key={u.id} user={u} currentUserId={user.id} onDelete={(id) => deleteUserMutation.mutate(id)} deleting={deleteUserMutation.isPending} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Input
                  placeholder="Buscar por título, ubicación o empresa..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="max-w-sm"
                  data-testid="input-admin-job-search"
                />
                <p className="text-sm text-muted-foreground">{filteredJobs.length} ofertas</p>
              </div>
              {jobsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : (
                <div className="space-y-2">
                  {filteredJobs.map((j) => (
                    <JobRow
                      key={j.id}
                      job={j}
                      onToggle={(id) => toggleJobMutation.mutate(id)}
                      onDelete={(id) => deleteJobMutation.mutate(id)}
                      toggling={toggleJobMutation.isPending}
                      deleting={deleteJobMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications">
            {appsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">{allApps.length} candidaturas en total</p>
                {allApps.map((app) => (
                  <Card key={app.id} className="p-4" data-testid={`card-admin-app-${app.id}`}>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{app.alumni?.name || "Usuario eliminado"}</span>
                          <span className="text-muted-foreground text-sm">{app.alumni?.email}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Oferta: <span className="font-medium text-foreground">{app.jobOffer?.title || "Oferta eliminada"}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(app.appliedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <Badge variant={statusVariants[app.status] || "outline"}>{statusLabels[app.status] || app.status}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="smtp">
            <SmtpPanel />
          </TabsContent>

          <TabsContent value="centros">
            <CentrosFpManager />
          </TabsContent>

          <TabsContent value="familias">
            <FamiliasProfesionalesManager />
          </TabsContent>

          <TabsContent value="ciclos">
            <CiclosFormativosManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatsPanel({ stats, isLoading }: { stats?: Stats; isLoading: boolean }) {
  if (isLoading || !stats) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  const cards = [
    { label: "Usuarios totales", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Titulados FP", value: stats.totalAlumni, icon: GraduationCap, color: "text-blue-600 dark:text-blue-400" },
    { label: "Empresas", value: stats.totalCompanies, icon: Building2, color: "text-green-600 dark:text-green-400" },
    { label: "Ofertas totales", value: stats.totalJobs, icon: Briefcase, color: "text-orange-600 dark:text-orange-400" },
    { label: "Ofertas activas", value: stats.activeJobs, icon: Eye, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Candidaturas", value: stats.totalApplications, icon: FileText, color: "text-purple-600 dark:text-purple-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="p-4" data-testid={`stat-${c.label.toLowerCase().replace(/\s/g, "-")}`}>
          <div className="flex items-center gap-3">
            <c.icon className={`w-8 h-8 ${c.color}`} />
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function UserRow({ user, currentUserId, onDelete, deleting }: { user: Omit<User, "password">; currentUserId: string; onDelete: (id: string) => void; deleting: boolean }) {
  const isSelf = user.id === currentUserId;
  return (
    <Card className="p-4" data-testid={`card-admin-user-${user.id}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {user.role === "COMPANY" && user.companyLogoUrl ? (
            <img src={user.companyLogoUrl} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
          ) : user.role === "COMPANY" ? (
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
          ) : null}
          <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{user.name}</span>
            <Badge variant={user.role === "ADMIN" ? "default" : user.role === "COMPANY" ? "secondary" : "outline"} className="text-xs">
              {roleLabels[user.role] || user.role}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <a href={`mailto:${user.email}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><Mail className="w-3 h-3" />{user.email}</a>
            {user.phone && <a href={`tel:${user.phone}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><Phone className="w-3 h-3" />{user.phone}</a>}
            {user.whatsapp && <a href={`https://wa.me/${user.whatsapp.replace(/[^0-9+]/g, "").replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-green-600 transition-colors"><MessageCircle className="w-3 h-3" />{user.whatsapp}</a>}
            {user.companyName && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{user.companyName}</span>}
            {user.university && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{user.university}</span>}
          </div>
          {(user.familiaProfesional || user.cicloFormativo) && (
            <div className="flex items-center gap-2 flex-wrap">
              {user.familiaProfesional && <Badge variant="outline" className="text-xs">{user.familiaProfesional}</Badge>}
              {user.cicloFormativo && <Badge variant="secondary" className="text-xs">{user.cicloFormativo}</Badge>}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Registrado: {new Date(user.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        </div>
        {!isSelf && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" data-testid={`button-delete-user-${user.id}`}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar {user.role === "ADMIN" ? "administrador" : "usuario"}</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminara permanentemente la cuenta de <strong>{user.name}</strong> ({user.email}) y todos sus datos asociados. Esta accion no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(user.id)}
                  disabled={deleting}
                  data-testid={`button-confirm-delete-user-${user.id}`}
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {isSelf && (
          <Badge variant="outline" className="text-xs">Tu cuenta</Badge>
        )}
      </div>
    </Card>
  );
}

function JobRow({ job, onToggle, onDelete, toggling, deleting }: {
  job: AdminJobOffer;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  toggling: boolean;
  deleting: boolean;
}) {
  return (
    <Card className="p-4" data-testid={`card-admin-job-${job.id}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {job.company?.companyLogoUrl ? (
            <img src={job.company.companyLogoUrl} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{job.title}</span>
            <Badge variant="outline" className="text-xs">{jobTypeLabels[job.jobType] || job.jobType}</Badge>
            {job.active
              ? <Badge variant="default" className="text-xs">Activa</Badge>
              : <Badge variant="secondary" className="text-xs">Inactiva</Badge>
            }
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.company?.companyName || job.company?.name || "Empresa"}</span>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors"><MapPin className="w-3 h-3" />{job.location}</a>
          </div>
          {(job.familiaProfesional || job.cicloFormativo) && (
            <div className="flex items-center gap-2 flex-wrap">
              {job.familiaProfesional && <Badge variant="outline" className="text-xs">{job.familiaProfesional}</Badge>}
              {job.cicloFormativo && <Badge variant="secondary" className="text-xs">{job.cicloFormativo}</Badge>}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Creada: {new Date(job.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onToggle(job.id)}
            disabled={toggling}
            title={job.active ? "Desactivar" : "Activar"}
            data-testid={`button-toggle-job-${job.id}`}
          >
            {job.active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" data-testid={`button-delete-job-${job.id}`}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar oferta</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminará permanentemente la oferta <strong>{job.title}</strong> y todas las candidaturas asociadas. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(job.id)}
                  disabled={deleting}
                  data-testid={`button-confirm-delete-job-${job.id}`}
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}

type MetricRow = { name: string; familia?: string; jobCount?: number; activeJobs?: number; applicationCount?: number; alumniCount?: number };
type MetricsData = {
  jobsByFamilia: MetricRow[];
  jobsByCiclo: MetricRow[];
  jobsByLocation: MetricRow[];
  alumniByFamilia: MetricRow[];
  alumniByCiclo: MetricRow[];
  applicationStatus: { pending: number; reviewed: number; accepted: number; rejected: number; total: number; acceptanceRate: number; rejectionRate: number };
  topCompanies: { name: string; jobCount: number; applicationCount: number; acceptedCount: number; avgSalaryMin: number | null; avgSalaryMax: number | null }[];
  trends: {
    monthlyJobs: { month: string; count: number }[];
    monthlyApplications: { month: string; count: number; accepted: number; rejected: number }[];
  };
  salaryByFamilia: { name: string; avgMin: number | null; avgMax: number | null; minSalary: number | null; maxSalary: number | null }[];
  positionFillRate: { totalPositions: number; totalFilled: number; totalOffers: number; fullyFilled: number; fillPercentage: number };
  demandSupply: { name: string; demand: number; supply: number }[];
  recentActivity: { newUsers30d: number; newJobs30d: number; newApps30d: number; newUsers7d: number; newJobs7d: number; newApps7d: number; avgAppsPerJob: number; alumniWithCv: number; totalAlumni: number };
};

async function copySvgAsImage(svgElement: SVGSVGElement) {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgElement);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const img = new Image();
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  return new Promise<void>((resolve) => {
    img.onload = async () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(async (pngBlob) => {
        if (pngBlob) {
          try { await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]); } catch {}
        }
        URL.revokeObjectURL(url);
        resolve();
      });
    };
    img.src = url;
  });
}

function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function copyTableToClipboard(headers: string[], rows: (string | number)[][]) {
  const text = [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
  navigator.clipboard.writeText(text);
}

function formatEur(val: number | null) {
  if (val === null || val === undefined) return "-";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

function SectionCopyButton({ onClick, label = "Copiar" }: { onClick: () => void; label?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} data-testid={`button-copy-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <Copy className="w-3 h-3 mr-1" /> {label}
    </Button>
  );
}

function MetricBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 2) : 0;
  return (
    <div className="w-full bg-muted rounded-full h-5 relative overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">{value}</span>
    </div>
  );
}

function MetricTable({ title, icon, data, columns }: {
  title: string;
  icon: React.ReactNode;
  data: MetricRow[];
  columns: { key: string; label: string; color: string }[];
}) {
  const [expanded, setExpanded] = useState(true);

  const handleCopy = () => {
    const headers = ["Nombre", ...(data[0]?.familia !== undefined ? ["Familia"] : []), ...columns.map(c => c.label)];
    const rows = data.map(row => [
      row.name,
      ...(row.familia !== undefined ? [row.familia || ""] : []),
      ...columns.map(c => (row as any)[c.key] || 0),
    ]);
    copyTableToClipboard(headers, rows);
  };

  if (data.length === 0) {
    return (
      <Card className="p-4" data-testid={`metric-card-${title.toLowerCase().replace(/\s/g, "-")}`}>
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-2">No hay datos disponibles.</p>
      </Card>
    );
  }

  const maxValues: Record<string, number> = {};
  columns.forEach(col => {
    maxValues[col.key] = Math.max(...data.map(r => (r as any)[col.key] || 0), 1);
  });

  return (
    <Card className="p-4" data-testid={`metric-card-${title.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          className="flex items-center gap-2 flex-1 text-left min-w-0"
          onClick={() => setExpanded(!expanded)}
          data-testid={`button-toggle-metric-${title.toLowerCase().replace(/\s/g, "-")}`}
        >
          {icon}
          <h3 className="font-semibold flex-1">{title}</h3>
          <Badge variant="secondary" className="text-xs">{data.length}</Badge>
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </button>
        {expanded && <SectionCopyButton onClick={handleCopy} />}
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="hidden sm:grid gap-2" style={{ gridTemplateColumns: `1fr ${columns.map(() => "120px").join(" ")}` }}>
            <span className="text-xs font-medium text-muted-foreground" />
            {columns.map(col => (
              <span key={col.key} className="text-xs font-medium text-muted-foreground text-center">{col.label}</span>
            ))}
          </div>
          {data.map((row, idx) => (
            <div key={idx} className="space-y-1 sm:space-y-0 sm:grid gap-2 items-center border-b pb-2 last:border-b-0 last:pb-0" style={{ gridTemplateColumns: `1fr ${columns.map(() => "120px").join(" ")}` }}>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" title={row.name}>{row.name}</p>
                {row.familia && <p className="text-xs text-muted-foreground truncate" title={row.familia}>{row.familia}</p>}
              </div>
              {columns.map(col => (
                <div key={col.key} className="flex items-center gap-2 sm:gap-0">
                  <span className="text-xs text-muted-foreground sm:hidden w-20 flex-shrink-0">{col.label}:</span>
                  <div className="flex-1 sm:w-full">
                    <MetricBar value={(row as any)[col.key] || 0} max={maxValues[col.key]} color={col.color} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function KpiCards({ metrics }: { metrics: MetricsData }) {
  const ra = metrics.recentActivity;
  const as = metrics.applicationStatus;
  const pf = metrics.positionFillRate;
  const cvPct = ra.totalAlumni > 0 ? ((ra.alumniWithCv / ra.totalAlumni) * 100).toFixed(1) : "0";

  const kpis = [
    { label: "Nuevos usuarios (7d)", value: ra.newUsers7d, sub: `${ra.newUsers30d} en 30d`, icon: Users, color: "text-blue-600 dark:text-blue-400" },
    { label: "Nuevas ofertas (7d)", value: ra.newJobs7d, sub: `${ra.newJobs30d} en 30d`, icon: Briefcase, color: "text-indigo-600 dark:text-indigo-400" },
    { label: "Nuevas candidaturas (7d)", value: ra.newApps7d, sub: `${ra.newApps30d} en 30d`, icon: FileText, color: "text-purple-600 dark:text-purple-400" },
    { label: "Tasa de aceptación", value: `${as.acceptanceRate.toFixed(1)}%`, sub: `${as.accepted} aceptadas`, icon: Target, color: "text-green-600 dark:text-green-400" },
    { label: "Tasa de rechazo", value: `${as.rejectionRate.toFixed(1)}%`, sub: `${as.rejected} rechazadas`, icon: ArrowDownRight, color: "text-red-600 dark:text-red-400" },
    { label: "Cobertura de puestos", value: `${pf.fillPercentage.toFixed(1)}%`, sub: `${pf.totalFilled}/${pf.totalPositions} cubiertos`, icon: Award, color: "text-orange-600 dark:text-orange-400" },
    { label: "Media candidaturas/oferta", value: ra.avgAppsPerJob.toFixed(1), sub: `${as.total} total`, icon: Activity, color: "text-cyan-600 dark:text-cyan-400" },
    { label: "Titulados con CV", value: `${cvPct}%`, sub: `${ra.alumniWithCv}/${ra.totalAlumni}`, icon: GraduationCap, color: "text-teal-600 dark:text-teal-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <Card key={k.label} className="p-4" data-testid={`kpi-${k.label.toLowerCase().replace(/[\s/()]/g, "-")}`}>
          <div className="flex items-start gap-3">
            <k.icon className={`w-6 h-6 mt-0.5 ${k.color}`} />
            <div className="min-w-0">
              <p className="text-xl font-bold">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <Badge variant="secondary" className="text-xs mt-1">{k.sub}</Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function TrendBarChart({ title, data, barKey, barColor, svgRef }: {
  title: string;
  data: { month: string; count: number }[];
  barKey: string;
  barColor: string;
  svgRef: React.RefObject<SVGSVGElement>;
}) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => (d as any)[barKey] || d.count), 1);
  const chartW = 600;
  const chartH = 200;
  const pad = { top: 20, right: 10, bottom: 40, left: 45 };
  const innerW = chartW - pad.left - pad.right;
  const innerH = chartH - pad.top - pad.bottom;
  const barW = Math.max(innerW / data.length - 4, 8);

  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <Card className="p-4" data-testid={`chart-${title.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <h3 className="font-semibold flex items-center gap-2"><BarChart3 className="w-4 h-4" /> {title}</h3>
        <div className="flex gap-2">
          <SectionCopyButton onClick={() => {
            const headers = ["Mes", "Cantidad"];
            const rows = data.map(d => [d.month, (d as any)[barKey] || d.count]);
            copyTableToClipboard(headers, rows);
          }} />
          <Button variant="outline" size="sm" onClick={() => { if (svgRef.current) copySvgAsImage(svgRef.current); }} data-testid={`button-copy-image-${title.toLowerCase().replace(/\s/g, "-")}`}>
            <ClipboardCopy className="w-3 h-3 mr-1" /> Copiar como imagen
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg ref={svgRef} width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-full" style={{ minWidth: 400 }} xmlns="http://www.w3.org/2000/svg">
          <rect width={chartW} height={chartH} fill="transparent" />
          {yTicks.map(t => (
            <g key={t}>
              <line x1={pad.left} y1={pad.top + innerH - (t / maxVal) * innerH} x2={chartW - pad.right} y2={pad.top + innerH - (t / maxVal) * innerH} stroke="currentColor" strokeOpacity={0.1} />
              <text x={pad.left - 5} y={pad.top + innerH - (t / maxVal) * innerH + 4} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.5}>{t}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const val = (d as any)[barKey] || d.count;
            const x = pad.left + (i * (innerW / data.length)) + (innerW / data.length - barW) / 2;
            const h = (val / maxVal) * innerH;
            return (
              <g key={i}>
                <rect x={x} y={pad.top + innerH - h} width={barW} height={h} fill={barColor} rx={2} />
                {val > 0 && <text x={x + barW / 2} y={pad.top + innerH - h - 4} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.7}>{val}</text>}
                <text x={x + barW / 2} y={chartH - pad.bottom + 14} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.5}>{d.month.slice(0, 3)}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}

function TrendStackedChart({ metrics, svgRef }: { metrics: MetricsData; svgRef: React.RefObject<SVGSVGElement> }) {
  const data = metrics.trends?.monthlyApplications;
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.count), 1);
  const chartW = 600;
  const chartH = 220;
  const pad = { top: 20, right: 10, bottom: 50, left: 45 };
  const innerW = chartW - pad.left - pad.right;
  const innerH = chartH - pad.top - pad.bottom;
  const barW = Math.max(innerW / data.length - 4, 8);
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <Card className="p-4" data-testid="chart-candidaturas-mensuales">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Candidaturas mensuales</h3>
        <div className="flex gap-2">
          <SectionCopyButton onClick={() => {
            copyTableToClipboard(["Mes", "Total", "Aceptadas", "Rechazadas"], data.map(d => [d.month, d.count, d.accepted, d.rejected]));
          }} />
          <Button variant="outline" size="sm" onClick={() => { if (svgRef.current) copySvgAsImage(svgRef.current); }} data-testid="button-copy-image-candidaturas">
            <ClipboardCopy className="w-3 h-3 mr-1" /> Copiar como imagen
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-2 flex-wrap">
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Total</span>
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Aceptadas</span>
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Rechazadas</span>
      </div>
      <div className="overflow-x-auto">
        <svg ref={svgRef} width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-full" style={{ minWidth: 400 }} xmlns="http://www.w3.org/2000/svg">
          <rect width={chartW} height={chartH} fill="transparent" />
          {yTicks.map(t => (
            <g key={t}>
              <line x1={pad.left} y1={pad.top + innerH - (t / maxVal) * innerH} x2={chartW - pad.right} y2={pad.top + innerH - (t / maxVal) * innerH} stroke="currentColor" strokeOpacity={0.1} />
              <text x={pad.left - 5} y={pad.top + innerH - (t / maxVal) * innerH + 4} textAnchor="end" fontSize={10} fill="currentColor" fillOpacity={0.5}>{t}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const x = pad.left + (i * (innerW / data.length)) + (innerW / data.length - barW) / 2;
            const totalH = (d.count / maxVal) * innerH;
            const accH = (d.accepted / maxVal) * innerH;
            const rejH = (d.rejected / maxVal) * innerH;
            const otherH = totalH - accH - rejH;
            return (
              <g key={i}>
                <rect x={x} y={pad.top + innerH - totalH} width={barW} height={Math.max(otherH, 0)} fill="#3b82f6" rx={0} />
                <rect x={x} y={pad.top + innerH - accH - rejH} width={barW} height={Math.max(accH, 0)} fill="#22c55e" rx={0} />
                <rect x={x} y={pad.top + innerH - rejH} width={barW} height={Math.max(rejH, 0)} fill="#f87171" rx={0} />
                {d.count > 0 && <text x={x + barW / 2} y={pad.top + innerH - totalH - 4} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.7}>{d.count}</text>}
                <text x={x + barW / 2} y={chartH - pad.bottom + 14} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.5}>{d.month.slice(0, 3)}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}

function ApplicationStatusBar({ status }: { status: MetricsData["applicationStatus"] }) {
  const total = status.total || 1;
  const segments = [
    { label: "Pendientes", count: status.pending, color: "bg-yellow-500", pct: ((status.pending / total) * 100).toFixed(1) },
    { label: "Revisadas", count: status.reviewed, color: "bg-blue-500", pct: ((status.reviewed / total) * 100).toFixed(1) },
    { label: "Aceptadas", count: status.accepted, color: "bg-green-500", pct: ((status.accepted / total) * 100).toFixed(1) },
    { label: "Rechazadas", count: status.rejected, color: "bg-red-500", pct: ((status.rejected / total) * 100).toFixed(1) },
  ];

  return (
    <Card className="p-4" data-testid="section-application-status">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <h3 className="font-semibold flex items-center gap-2"><Percent className="w-4 h-4" /> Estado de candidaturas</h3>
        <SectionCopyButton onClick={() => {
          copyTableToClipboard(["Estado", "Cantidad", "Porcentaje"], segments.map(s => [s.label, s.count, `${s.pct}%`]));
        }} />
      </div>
      <div className="w-full h-8 rounded-md overflow-hidden flex">
        {segments.map(s => (
          s.count > 0 && (
            <div key={s.label} className={`${s.color} h-full flex items-center justify-center text-white text-xs font-medium`} style={{ width: `${(s.count / total) * 100}%`, minWidth: s.count > 0 ? 30 : 0 }} title={`${s.label}: ${s.count} (${s.pct}%)`}>
              {(s.count / total) * 100 > 8 ? s.count : ""}
            </div>
          )
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs">
            <span className={`w-3 h-3 rounded-sm ${s.color} inline-block`} />
            <span className="text-muted-foreground">{s.label}:</span>
            <span className="font-medium">{s.count}</span>
            <span className="text-muted-foreground">({s.pct}%)</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DemandSupplyTable({ data }: { data: MetricsData["demandSupply"] }) {
  if (!data || data.length === 0) return null;
  return (
    <Card className="p-4" data-testid="section-demand-supply">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Demanda vs Oferta</h3>
        <SectionCopyButton onClick={() => {
          copyTableToClipboard(["Familia", "Demanda (ofertas)", "Oferta (titulados)", "Diferencia"], data.map(d => [d.name, d.demand, d.supply, d.supply - d.demand]));
        }} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Familia Profesional</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Demanda</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Oferta</th>
              <th className="text-right py-2 pl-2 font-medium text-muted-foreground">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              const gap = d.supply - d.demand;
              return (
                <tr key={i} className="border-b last:border-b-0" data-testid={`row-demand-supply-${i}`}>
                  <td className="py-2 pr-4 truncate max-w-[200px]" title={d.name}>{d.name}</td>
                  <td className="py-2 px-2 text-right font-medium">{d.demand}</td>
                  <td className="py-2 px-2 text-right font-medium">{d.supply}</td>
                  <td className="py-2 pl-2 text-right">
                    <span className={`inline-flex items-center gap-0.5 font-medium ${gap >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {gap >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {gap >= 0 ? `+${gap}` : gap}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TopCompaniesTable({ companies }: { companies: MetricsData["topCompanies"] }) {
  if (!companies || companies.length === 0) return null;
  return (
    <Card className="p-4" data-testid="section-top-companies">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <h3 className="font-semibold flex items-center gap-2"><Building2 className="w-4 h-4" /> Ranking de empresas</h3>
        <SectionCopyButton onClick={() => {
          copyTableToClipboard(
            ["Empresa", "Ofertas", "Candidaturas", "Aceptadas", "Salario min medio", "Salario max medio"],
            companies.map(c => [c.name, c.jobCount, c.applicationCount, c.acceptedCount, c.avgSalaryMin !== null ? `${c.avgSalaryMin}€` : "-", c.avgSalaryMax !== null ? `${c.avgSalaryMax}€` : "-"])
          );
        }} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Empresa</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Ofertas</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Candidaturas</th>
              <th className="text-right py-2 px-2 font-medium text-muted-foreground">Aceptadas</th>
              <th className="text-right py-2 pl-2 font-medium text-muted-foreground">Salario medio</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c, i) => (
              <tr key={i} className="border-b last:border-b-0" data-testid={`row-company-${i}`}>
                <td className="py-2 pr-4 font-medium truncate max-w-[200px]" title={c.name}>{c.name}</td>
                <td className="py-2 px-2 text-right">{c.jobCount}</td>
                <td className="py-2 px-2 text-right">{c.applicationCount}</td>
                <td className="py-2 px-2 text-right">{c.acceptedCount}</td>
                <td className="py-2 pl-2 text-right text-muted-foreground">
                  {c.avgSalaryMin !== null || c.avgSalaryMax !== null
                    ? `${formatEur(c.avgSalaryMin)} - ${formatEur(c.avgSalaryMax)}`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function SalaryChart({ data }: { data: MetricsData["salaryByFamilia"] }) {
  const filtered = (data || []).filter(d => d.avgMin !== null || d.avgMax !== null);
  if (filtered.length === 0) return null;
  const globalMax = Math.max(...filtered.map(d => d.maxSalary || d.avgMax || 0), 1);

  return (
    <Card className="p-4" data-testid="section-salary-analysis">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        <h3 className="font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4" /> Análisis salarial por familia</h3>
        <SectionCopyButton onClick={() => {
          copyTableToClipboard(
            ["Familia", "Media mín", "Media máx", "Mínimo", "Máximo"],
            filtered.map(d => [d.name, d.avgMin !== null ? `${d.avgMin}€` : "-", d.avgMax !== null ? `${d.avgMax}€` : "-", d.minSalary !== null ? `${d.minSalary}€` : "-", d.maxSalary !== null ? `${d.maxSalary}€` : "-"])
          );
        }} />
      </div>
      <div className="space-y-3">
        {filtered.map((d, i) => {
          const minPct = ((d.avgMin || 0) / globalMax) * 100;
          const maxPct = ((d.avgMax || 0) / globalMax) * 100;
          return (
            <div key={i} data-testid={`salary-row-${i}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm truncate max-w-[60%]" title={d.name}>{d.name}</span>
                <span className="text-xs text-muted-foreground">{formatEur(d.avgMin)} - {formatEur(d.avgMax)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-4 relative overflow-hidden">
                <div className="absolute h-full bg-emerald-400/40 rounded-full" style={{ left: `${minPct}%`, width: `${Math.max(maxPct - minPct, 2)}%` }} />
                <div className="absolute h-full w-1 bg-emerald-600 rounded-full" style={{ left: `${minPct}%` }} />
                <div className="absolute h-full w-1 bg-emerald-600 rounded-full" style={{ left: `${maxPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function generateFullCSV(metrics: MetricsData): string {
  const sections: string[] = [];

  sections.push("=== ACTIVIDAD RECIENTE ===");
  const ra = metrics.recentActivity;
  sections.push(["Métrica", "7 días", "30 días"].join(","));
  sections.push(["Nuevos usuarios", ra.newUsers7d, ra.newUsers30d].join(","));
  sections.push(["Nuevas ofertas", ra.newJobs7d, ra.newJobs30d].join(","));
  sections.push(["Nuevas candidaturas", ra.newApps7d, ra.newApps30d].join(","));
  sections.push(`Media candidaturas/oferta,${ra.avgAppsPerJob.toFixed(1)}`);
  sections.push(`Titulados con CV,${ra.alumniWithCv},de ${ra.totalAlumni}`);

  sections.push("");
  sections.push("=== ESTADO DE CANDIDATURAS ===");
  const as = metrics.applicationStatus;
  sections.push(["Estado", "Cantidad", "Porcentaje"].join(","));
  sections.push(["Pendientes", as.pending, `${((as.pending / (as.total || 1)) * 100).toFixed(1)}%`].join(","));
  sections.push(["Revisadas", as.reviewed, `${((as.reviewed / (as.total || 1)) * 100).toFixed(1)}%`].join(","));
  sections.push(["Aceptadas", as.accepted, `${as.acceptanceRate.toFixed(1)}%`].join(","));
  sections.push(["Rechazadas", as.rejected, `${as.rejectionRate.toFixed(1)}%`].join(","));

  sections.push("");
  sections.push("=== COBERTURA DE PUESTOS ===");
  const pf = metrics.positionFillRate;
  sections.push(`Posiciones totales,${pf.totalPositions}`);
  sections.push(`Posiciones cubiertas,${pf.totalFilled}`);
  sections.push(`Porcentaje cobertura,${pf.fillPercentage.toFixed(1)}%`);

  if (metrics.topCompanies?.length > 0) {
    sections.push("");
    sections.push("=== TOP EMPRESAS ===");
    sections.push(["Empresa", "Ofertas", "Candidaturas", "Aceptadas", "Salario min medio", "Salario max medio"].join(","));
    metrics.topCompanies.forEach(c => {
      sections.push([`"${c.name}"`, c.jobCount, c.applicationCount, c.acceptedCount, c.avgSalaryMin ?? "", c.avgSalaryMax ?? ""].join(","));
    });
  }

  if (metrics.demandSupply?.length > 0) {
    sections.push("");
    sections.push("=== DEMANDA VS OFERTA ===");
    sections.push(["Familia", "Demanda", "Oferta", "Diferencia"].join(","));
    metrics.demandSupply.forEach(d => {
      sections.push([`"${d.name}"`, d.demand, d.supply, d.supply - d.demand].join(","));
    });
  }

  if (metrics.salaryByFamilia?.length > 0) {
    sections.push("");
    sections.push("=== SALARIOS POR FAMILIA ===");
    sections.push(["Familia", "Media mín", "Media máx", "Mínimo", "Máximo"].join(","));
    metrics.salaryByFamilia.forEach(d => {
      sections.push([`"${d.name}"`, d.avgMin ?? "", d.avgMax ?? "", d.minSalary ?? "", d.maxSalary ?? ""].join(","));
    });
  }

  if (metrics.trends?.monthlyJobs?.length > 0) {
    sections.push("");
    sections.push("=== OFERTAS MENSUALES ===");
    sections.push(["Mes", "Cantidad"].join(","));
    metrics.trends.monthlyJobs.forEach(d => sections.push([d.month, d.count].join(",")));
  }

  if (metrics.trends?.monthlyApplications?.length > 0) {
    sections.push("");
    sections.push("=== CANDIDATURAS MENSUALES ===");
    sections.push(["Mes", "Total", "Aceptadas", "Rechazadas"].join(","));
    metrics.trends.monthlyApplications.forEach(d => sections.push([d.month, d.count, d.accepted, d.rejected].join(",")));
  }

  const tableExport = (title: string, headers: string[], rows: MetricRow[], keys: string[]) => {
    if (rows.length === 0) return;
    sections.push("");
    sections.push(`=== ${title} ===`);
    sections.push(headers.join(","));
    rows.forEach(r => {
      sections.push(keys.map(k => {
        const v = (r as any)[k];
        return typeof v === "string" ? `"${v}"` : (v ?? "");
      }).join(","));
    });
  };

  tableExport("OFERTAS POR FAMILIA", ["Familia", "Ofertas", "Activas", "Candidaturas"], metrics.jobsByFamilia, ["name", "jobCount", "activeJobs", "applicationCount"]);
  tableExport("OFERTAS POR CICLO", ["Ciclo", "Familia", "Ofertas", "Activas", "Candidaturas"], metrics.jobsByCiclo, ["name", "familia", "jobCount", "activeJobs", "applicationCount"]);
  tableExport("OFERTAS POR LOCALIDAD", ["Localidad", "Ofertas", "Activas", "Candidaturas"], metrics.jobsByLocation, ["name", "jobCount", "activeJobs", "applicationCount"]);
  tableExport("TITULADOS POR FAMILIA", ["Familia", "Titulados"], metrics.alumniByFamilia, ["name", "alumniCount"]);
  tableExport("TITULADOS POR CICLO", ["Ciclo", "Familia", "Titulados"], metrics.alumniByCiclo, ["name", "familia", "alumniCount"]);

  return sections.join("\n");
}

const periodOptions = [
  { value: "all", label: "Todo" },
  { value: "12m", label: "12 meses" },
  { value: "6m", label: "6 meses" },
  { value: "3m", label: "3 meses" },
] as const;

function MetricsPanel() {
  const [period, setPeriod] = useState("all");
  const { data: metrics, isLoading } = useQuery<MetricsData>({
    queryKey: ["/api/admin/metrics", period],
    queryFn: () => fetch(`/api/admin/metrics?period=${period}`, { credentials: "include" }).then(r => r.json()),
  });

  const jobsChartRef = useRef<SVGSVGElement>(null);
  const appsChartRef = useRef<SVGSVGElement>(null);

  if (isLoading || !metrics) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Panel de métricas</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border rounded-md overflow-hidden" data-testid="filter-period">
            {periodOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === opt.value ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-muted-foreground"}`}
                data-testid={`button-period-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadCSV("informe-metricas.csv", generateFullCSV(metrics))} data-testid="button-download-csv">
            <Download className="w-4 h-4 mr-1" /> Descargar CSV
          </Button>
        </div>
      </div>

      <KpiCards metrics={metrics} />

      {metrics.trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendBarChart title="Ofertas mensuales" data={metrics.trends.monthlyJobs || []} barKey="count" barColor="#3b82f6" svgRef={jobsChartRef} />
          <TrendStackedChart metrics={metrics} svgRef={appsChartRef} />
        </div>
      )}

      {metrics.applicationStatus && (
        <ApplicationStatusBar status={metrics.applicationStatus} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics.demandSupply && <DemandSupplyTable data={metrics.demandSupply} />}
        {metrics.topCompanies && <TopCompaniesTable companies={metrics.topCompanies} />}
      </div>

      {metrics.salaryByFamilia && <SalaryChart data={metrics.salaryByFamilia} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricTable
          title="Ofertas por Familia Profesional"
          icon={<Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          data={metrics.jobsByFamilia}
          columns={[
            { key: "jobCount", label: "Ofertas", color: "bg-blue-500" },
            { key: "activeJobs", label: "Activas", color: "bg-emerald-500" },
            { key: "applicationCount", label: "Candidaturas", color: "bg-purple-500" },
          ]}
        />

        <MetricTable
          title="Titulados por Familia Profesional"
          icon={<GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />}
          data={metrics.alumniByFamilia}
          columns={[
            { key: "alumniCount", label: "Titulados", color: "bg-green-500" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricTable
          title="Ofertas por Ciclo Formativo"
          icon={<GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          data={metrics.jobsByCiclo}
          columns={[
            { key: "jobCount", label: "Ofertas", color: "bg-indigo-500" },
            { key: "activeJobs", label: "Activas", color: "bg-emerald-500" },
            { key: "applicationCount", label: "Candidaturas", color: "bg-purple-500" },
          ]}
        />

        <MetricTable
          title="Titulados por Ciclo Formativo"
          icon={<GraduationCap className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          data={metrics.alumniByCiclo}
          columns={[
            { key: "alumniCount", label: "Titulados", color: "bg-teal-500" },
          ]}
        />
      </div>

      <MetricTable
        title="Ofertas por Localidad"
        icon={<MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
        data={metrics.jobsByLocation}
        columns={[
          { key: "jobCount", label: "Ofertas", color: "bg-orange-500" },
          { key: "activeJobs", label: "Activas", color: "bg-emerald-500" },
          { key: "applicationCount", label: "Candidaturas", color: "bg-purple-500" },
        ]}
      />
    </div>
  );
}

function SmtpPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testEmail, setTestEmail] = useState("");

  const { data: smtpData, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/smtp"],
  });

  const [form, setForm] = useState({
    host: "", port: 587, username: "", password: "",
    fromEmail: "", fromName: "Conecta FP Canarias", secure: false, enabled: false,
  });
  const [formLoaded, setFormLoaded] = useState(false);

  useEffect(() => {
    if (smtpData && !formLoaded) {
      setForm({
        host: smtpData.host || "",
        port: smtpData.port || 587,
        username: smtpData.username || "",
        password: smtpData.password || "",
        fromEmail: smtpData.fromEmail || "",
        fromName: smtpData.fromName || "Conecta FP Canarias",
        secure: smtpData.secure || false,
        enabled: smtpData.enabled || false,
      });
      setFormLoaded(true);
    }
  }, [smtpData, formLoaded]);

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/smtp", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/smtp"] });
      toast({ title: "Configuración SMTP guardada" });
    },
    onError: () => toast({ title: "Error al guardar configuración", variant: "destructive" }),
  });

  const testMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/smtp/test", { email: testEmail }),
    onSuccess: () => toast({ title: "Correo de prueba enviado" }),
    onError: () => toast({ title: "Error al enviar correo de prueba. Verifica la configuración.", variant: "destructive" }),
  });

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" /> Configuración del servidor de correo (SMTP)
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configura un servidor SMTP para enviar correos de verificación de registro, restablecimiento de contraseña y alertas.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">Servidor SMTP</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.gmail.com"
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
                data-testid="input-smtp-host"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">Puerto</Label>
              <Input
                id="smtp-port"
                type="number"
                placeholder="587"
                value={form.port}
                onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || 587 })}
                data-testid="input-smtp-port"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-username">Usuario</Label>
              <Input
                id="smtp-username"
                placeholder="usuario@email.com"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                data-testid="input-smtp-username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-password">Contraseña</Label>
              <Input
                id="smtp-password"
                type="password"
                placeholder="Contraseña SMTP"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                data-testid="input-smtp-password"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-from-email">Email remitente</Label>
              <Input
                id="smtp-from-email"
                type="email"
                placeholder="noreply@conectafp.es"
                value={form.fromEmail}
                onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
                data-testid="input-smtp-from-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-from-name">Nombre remitente</Label>
              <Input
                id="smtp-from-name"
                placeholder="Conecta FP Canarias"
                value={form.fromName}
                onChange={(e) => setForm({ ...form, fromName: e.target.value })}
                data-testid="input-smtp-from-name"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.secure}
                onCheckedChange={(checked) => setForm({ ...form, secure: checked })}
                data-testid="switch-smtp-secure"
              />
              <Label>TLS/SSL</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.enabled}
                onCheckedChange={(checked) => setForm({ ...form, enabled: checked })}
                data-testid="switch-smtp-enabled"
              />
              <Label>Correo habilitado</Label>
            </div>
          </div>

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="button-smtp-save">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Guardar configuración
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Send className="w-5 h-5" /> Enviar correo de prueba
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Envía un correo de prueba para verificar que la configuración SMTP funciona correctamente.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="email@destino.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="max-w-sm"
            data-testid="input-smtp-test-email"
          />
          <Button
            variant="outline"
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending || !testEmail}
            data-testid="button-smtp-test"
          >
            {testMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
            Enviar prueba
          </Button>
        </div>
      </Card>
    </div>
  );
}

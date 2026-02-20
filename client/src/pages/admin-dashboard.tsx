import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { JobOffer, User } from "@shared/schema";
import {
  Shield, Users, Briefcase, FileText, LogOut, Loader2,
  Trash2, ToggleLeft, ToggleRight, Mail, Phone, Building2,
  GraduationCap, MapPin, Eye, EyeOff, BarChart3, Settings, Send, MessageCircle,
  TrendingUp, ChevronDown, ChevronRight
} from "lucide-react";
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
    onError: () => toast({ title: "Error al eliminar usuario", variant: "destructive" }),
  });

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
              <h1 className="text-lg font-bold">Conecta FP - Admin</h1>
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
              </div>
              {usersLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((u) => (
                    <UserRow key={u.id} user={u} onDelete={(id) => deleteUserMutation.mutate(id)} deleting={deleteUserMutation.isPending} />
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

function UserRow({ user, onDelete, deleting }: { user: Omit<User, "password">; onDelete: (id: string) => void; deleting: boolean }) {
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
        {user.role !== "ADMIN" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" data-testid={`button-delete-user-${user.id}`}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
                <AlertDialogDescription>
                  Se eliminará permanentemente la cuenta de <strong>{user.name}</strong> ({user.email}) y todos sus datos asociados. Esta acción no se puede deshacer.
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
};

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
      <button
        className="flex items-center gap-2 w-full text-left"
        onClick={() => setExpanded(!expanded)}
        data-testid={`button-toggle-metric-${title.toLowerCase().replace(/\s/g, "-")}`}
      >
        {icon}
        <h3 className="font-semibold flex-1">{title}</h3>
        <Badge variant="secondary" className="text-xs">{data.length}</Badge>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>

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

function MetricsPanel() {
  const { data: metrics, isLoading } = useQuery<MetricsData>({
    queryKey: ["/api/admin/metrics"],
  });

  if (isLoading || !metrics) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  const totalJobs = metrics.jobsByFamilia.reduce((s, r) => s + (r.jobCount || 0), 0);
  const totalApps = metrics.jobsByFamilia.reduce((s, r) => s + (r.applicationCount || 0), 0);
  const totalAlumni = metrics.alumniByFamilia.reduce((s, r) => s + (r.alumniCount || 0), 0);
  const totalLocations = metrics.jobsByLocation.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4" data-testid="metric-summary-jobs">
          <div className="flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-2xl font-bold">{totalJobs}</p>
              <p className="text-xs text-muted-foreground">Ofertas con familia</p>
            </div>
          </div>
        </Card>
        <Card className="p-4" data-testid="metric-summary-apps">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-2xl font-bold">{totalApps}</p>
              <p className="text-xs text-muted-foreground">Candidaturas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4" data-testid="metric-summary-alumni">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-2xl font-bold">{totalAlumni}</p>
              <p className="text-xs text-muted-foreground">Titulados con familia</p>
            </div>
          </div>
        </Card>
        <Card className="p-4" data-testid="metric-summary-locations">
          <div className="flex items-center gap-3">
            <MapPin className="w-7 h-7 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-2xl font-bold">{totalLocations}</p>
              <p className="text-xs text-muted-foreground">Localidades</p>
            </div>
          </div>
        </Card>
      </div>

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
    fromEmail: "", fromName: "Conecta FP", secure: false, enabled: false,
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
        fromName: smtpData.fromName || "Conecta FP",
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
                placeholder="Conecta FP"
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

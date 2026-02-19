import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { JobOffer, Application, User } from "@shared/schema";
import { FAMILIAS_PROFESIONALES, CICLOS_POR_FAMILIA } from "@shared/schema";
import {
  Briefcase, Plus, Users, LogOut, Loader2, MapPin, Clock, Building2,
  Mail, Phone, GraduationCap, FileText, ChevronDown, ChevronUp,
  Trash2, Shield, ExternalLink, Eye, Camera, Upload, X, User as UserIcon, Image,
  Search, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { TotpSecuritySection } from "@/components/totp-security";
import { CvBuilder } from "@/components/cv-builder";
import { CalendarDays } from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  REVIEWED: "Revisada",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  REVIEWED: "outline",
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

type ApplicationWithAlumni = Application & { alumni?: User };

export default function CompanyDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFamilia, setFilterFamilia] = useState("");

  const { data: myJobs = [], isLoading: jobsLoading } = useQuery<JobOffer[]>({
    queryKey: ["/api/jobs/mine"],
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/jobs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/mine"] });
      toast({ title: "Oferta creada", description: "Ya es visible para los titulados de FP" });
      setShowCreateJob(false);
    },
    onError: () => toast({ title: "Error", description: "No se pudo crear la oferta", variant: "destructive" }),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/auth/account");
    },
    onSuccess: () => {
      toast({ title: "Cuenta eliminada", description: "Todos tus datos han sido borrados permanentemente" });
      navigate("/");
    },
    onError: () => toast({ title: "Error", description: "No se pudo eliminar la cuenta", variant: "destructive" }),
  });

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg tracking-tight">Conecta FP</span>
            </div>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.companyName || user.name}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="jobs" className="gap-2" data-testid="tab-jobs">
              <Briefcase className="w-4 h-4" /> Mis Ofertas
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
              <Building2 className="w-4 h-4" /> Mi Empresa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-lg font-semibold">Ofertas publicadas</h2>
              <Dialog open={showCreateJob} onOpenChange={setShowCreateJob}>
                <DialogTrigger asChild>
                  <Button className="gap-2" data-testid="button-create-job">
                    <Plus className="w-4 h-4" /> Nueva oferta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear nueva oferta</DialogTitle>
                    <DialogDescription>Publica una vacante para que los titulados de FP puedan postularse</DialogDescription>
                  </DialogHeader>
                  <CreateJobForm onSubmit={(data) => createJobMutation.mutate(data)} isPending={createJobMutation.isPending} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título o descripción..."
                  className="pl-9"
                  data-testid="input-search-jobs"
                />
              </div>
              <Select value={filterFamilia} onValueChange={setFilterFamilia}>
                <SelectTrigger className="w-[240px]" data-testid="select-filter-familia-jobs">
                  <SelectValue placeholder="Todas las familias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las familias</SelectItem>
                  {FAMILIAS_PROFESIONALES.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {jobsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-5">
                    <Skeleton className="h-5 w-48 mb-3" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-16 w-full" />
                  </Card>
                ))}
              </div>
            ) : myJobs.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">Sin ofertas publicadas</p>
                <p className="text-sm text-muted-foreground">Crea tu primera oferta para atraer talento</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {myJobs.filter((job) => {
                  const q = searchQuery.toLowerCase();
                  const matchesSearch = !q || job.title.toLowerCase().includes(q) || job.description.toLowerCase().includes(q);
                  const matchesFamilia = !filterFamilia || filterFamilia === "all" || job.familiaProfesional === filterFamilia;
                  return matchesSearch && matchesFamilia;
                }).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    expanded={expandedJob === job.id}
                    onToggle={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <CompanyProfileForm user={user} />

            <TotpSecuritySection />

            <Card className="p-6 border-destructive/30">
              <h3 className="font-semibold text-destructive flex items-center gap-2 mb-2">
                <Trash2 className="w-4 h-4" /> Zona peligrosa
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Eliminar tu cuenta borrará permanentemente todos tus datos: ofertas publicadas, datos de candidatos recibidos y cualquier información asociada.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2" data-testid="button-delete-account">
                    <Trash2 className="w-4 h-4" /> Eliminar mi cuenta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar cuenta permanentemente?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción es irreversible. Se eliminarán: tu perfil de empresa, todas tus ofertas publicadas y los datos de candidatura asociados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteAccountMutation.mutate()} data-testid="button-confirm-delete">
                      Si, eliminar todo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function JobCard({ job, expanded, onToggle }: { job: JobOffer; expanded: boolean; onToggle: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [viewCvAlumniId, setViewCvAlumniId] = useState<string | null>(null);
  const [viewCvAlumniName, setViewCvAlumniName] = useState("");
  const [showExtend, setShowExtend] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  const editJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/jobs/${job.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/mine"] });
      toast({ title: "Oferta actualizada" });
      setShowEdit(false);
    },
    onError: () => toast({ title: "Error", description: "No se pudo actualizar la oferta", variant: "destructive" }),
  });

  const { data: applications = [], isLoading } = useQuery<ApplicationWithAlumni[]>({
    queryKey: ["/api/jobs", job.id, "applications"],
    enabled: expanded,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/applications/${applicationId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", job.id, "applications"] });
      toast({ title: "Estado actualizado" });
    },
  });

  const extendMutation = useMutation({
    mutationFn: async (expiresAt: string) => {
      const res = await apiRequest("PATCH", `/api/jobs/${job.id}/extend`, { expiresAt });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/mine"] });
      toast({ title: "Fecha de expiración actualizada" });
      setShowExtend(false);
      setNewExpiryDate("");
    },
    onError: () => toast({ title: "Error al ampliar la fecha", variant: "destructive" }),
  });

  return (
    <Card className="overflow-visible">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold">{job.title}</h3>
              <Badge variant="outline" className="text-xs">{jobTypeLabels[job.jobType] || job.jobType}</Badge>
              {job.active ? <Badge variant="default" className="text-xs">Activa</Badge> : <Badge variant="secondary" className="text-xs">Inactiva</Badge>}
            </div>
            {(job.familiaProfesional || job.cicloFormativo) && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {job.familiaProfesional && <Badge variant="outline" className="text-xs">{job.familiaProfesional}</Badge>}
                {job.cicloFormativo && <Badge variant="secondary" className="text-xs">{job.cicloFormativo}</Badge>}
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
              {(job.salaryMin || job.salaryMax) && (
                <span>
                  {job.salaryMin && job.salaryMax
                    ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} EUR`
                    : job.salaryMin ? `Desde ${job.salaryMin.toLocaleString()} EUR` : `Hasta ${job.salaryMax!.toLocaleString()} EUR`}
                </span>
              )}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(job.createdAt).toLocaleDateString("es-ES")}</span>
              {job.expiresAt && (
                <span className={`flex items-center gap-1 ${new Date(job.expiresAt) < new Date() ? "text-destructive" : ""}`}>
                  <CalendarDays className="w-3 h-3" />
                  {new Date(job.expiresAt) < new Date() ? "Expirada" : `Expira: ${new Date(job.expiresAt).toLocaleDateString("es-ES")}`}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Dialog open={showEdit} onOpenChange={setShowEdit}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1" data-testid={`button-edit-job-${job.id}`}>
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar oferta</DialogTitle>
                  <DialogDescription>Modifica los datos de la oferta "{job.title}"</DialogDescription>
                </DialogHeader>
                <EditJobForm job={job} onSubmit={(data) => editJobMutation.mutate(data)} isPending={editJobMutation.isPending} />
              </DialogContent>
            </Dialog>
            {job.expiresAt && (
              <Dialog open={showExtend} onOpenChange={setShowExtend}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1" data-testid={`button-extend-expiry-${job.id}`}>
                    <CalendarDays className="w-3.5 h-3.5" /> Ampliar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ampliar fecha de expiración</DialogTitle>
                    <DialogDescription>Selecciona la nueva fecha de expiración para "{job.title}"</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <Label>Nueva fecha de expiración</Label>
                    <Input type="date" value={newExpiryDate} onChange={e => setNewExpiryDate(e.target.value)} min={new Date().toISOString().split("T")[0]} data-testid="input-new-expiry-date" />
                  </div>
                  <DialogFooter>
                    <Button onClick={() => extendMutation.mutate(newExpiryDate)} disabled={!newExpiryDate || extendMutation.isPending} data-testid="button-confirm-extend">
                      {extendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ampliar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="ghost" size="sm" className="gap-1" onClick={onToggle} data-testid={`button-toggle-candidates-${job.id}`}>
              <Users className="w-4 h-4" />
              Candidatos
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-5 py-4 bg-accent/20">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Candidatos inscritos
          </h4>
          <div className="p-2 rounded-md bg-accent/30 border text-xs text-muted-foreground flex items-start gap-2 mb-3">
            <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            Solo puedes ver los datos de los candidatos que se han postulado voluntariamente a esta oferta.
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aún no hay candidatos para esta oferta</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <Card key={app.id} className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-sm">{app.alumni?.name || "Candidato"}</span>
                        <Badge variant={statusVariants[app.status]} className="text-xs">
                          {statusLabels[app.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {app.alumni?.email && (
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{app.alumni.email}</span>
                        )}
                        {app.alumni?.phone && (
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{app.alumni.phone}</span>
                        )}
                        {app.alumni?.university && (
                          <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{app.alumni.university}</span>
                        )}
                      </div>
                      {(app.alumni?.familiaProfesional || app.alumni?.cicloFormativo) && (
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {app.alumni?.familiaProfesional && <Badge variant="outline" className="text-xs">{app.alumni.familiaProfesional}</Badge>}
                          {app.alumni?.cicloFormativo && <Badge variant="secondary" className="text-xs">{app.alumni.cicloFormativo}</Badge>}
                        </div>
                      )}
                      {app.alumni?.skills && (
                        <p className="text-xs text-muted-foreground mt-1">Habilidades: {app.alumni.skills}</p>
                      )}
                      {app.coverLetter && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          <FileText className="w-3 h-3 inline mr-1" />{app.coverLetter}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {app.alumni?.cvUrl && (
                          <a href={`/api/uploads/cv/${app.alumni.cvUrl.split("/").pop()}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> Ver CV (PDF)
                          </a>
                        )}
                        {!!(app.alumni?.cvData) && (
                          <button
                            onClick={() => { setViewCvAlumniId(app.alumni!.id); setViewCvAlumniName(app.alumni!.name); }}
                            className="text-xs text-primary flex items-center gap-1"
                            data-testid={`button-view-dynamic-cv-${app.id}`}
                          >
                            <FileText className="w-3 h-3" /> Ver CV dinámico
                          </button>
                        )}
                      </div>
                    </div>
                    <Select
                      value={app.status}
                      onValueChange={(status) => updateStatusMutation.mutate({ applicationId: app.id, status })}
                    >
                      <SelectTrigger className="w-[130px]" data-testid={`select-status-${app.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendiente</SelectItem>
                        <SelectItem value="REVIEWED">Revisada</SelectItem>
                        <SelectItem value="ACCEPTED">Aceptada</SelectItem>
                        <SelectItem value="REJECTED">Rechazada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={!!viewCvAlumniId} onOpenChange={(open) => { if (!open) setViewCvAlumniId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CV de {viewCvAlumniName}</DialogTitle>
            <DialogDescription>CV dinámico del candidato</DialogDescription>
          </DialogHeader>
          {viewCvAlumniId && <CvBuilder readOnly alumniId={viewCvAlumniId} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function CreateJobForm({ onSubmit, isPending }: { onSubmit: (data: any) => void; isPending: boolean }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [jobType, setJobType] = useState("FULL_TIME");
  const [requirements, setRequirements] = useState("");
  const [familiaProfesional, setFamiliaProfesional] = useState("");
  const [cicloFormativo, setCicloFormativo] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const ciclosDisponibles = familiaProfesional ? CICLOS_POR_FAMILIA[familiaProfesional] || [] : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title, description, location, jobType, requirements,
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
      familiaProfesional: familiaProfesional || undefined,
      cicloFormativo: cicloFormativo || undefined,
      expiresAt: expiresAt || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Título del puesto *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Desarrollador Full-Stack" required data-testid="input-job-title" />
      </div>
      <div className="space-y-2">
        <Label>Descripción *</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe el puesto y las responsabilidades..." rows={4} required data-testid="textarea-job-description" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ubicación *</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Madrid, España" required data-testid="input-job-location" />
        </div>
        <div className="space-y-2">
          <Label>Tipo de contrato</Label>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger data-testid="select-job-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_TIME">Jornada completa</SelectItem>
              <SelectItem value="PART_TIME">Media jornada</SelectItem>
              <SelectItem value="INTERNSHIP">Prácticas</SelectItem>
              <SelectItem value="FREELANCE">Freelance</SelectItem>
              <SelectItem value="REMOTE">Remoto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Familia Profesional</Label>
          <Select
            value={familiaProfesional}
            onValueChange={(val) => {
              setFamiliaProfesional(val);
              setCicloFormativo("");
            }}
          >
            <SelectTrigger data-testid="select-job-familia">
              <SelectValue placeholder="Selecciona familia" />
            </SelectTrigger>
            <SelectContent>
              {FAMILIAS_PROFESIONALES.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Ciclo Formativo</Label>
          <Select
            value={cicloFormativo}
            onValueChange={setCicloFormativo}
            disabled={ciclosDisponibles.length === 0}
          >
            <SelectTrigger data-testid="select-job-ciclo">
              <SelectValue placeholder="Selecciona ciclo" />
            </SelectTrigger>
            <SelectContent>
              {ciclosDisponibles.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Salario mínimo (EUR)</Label>
          <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="25000" data-testid="input-job-salary-min" />
        </div>
        <div className="space-y-2">
          <Label>Salario máximo (EUR)</Label>
          <Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="40000" data-testid="input-job-salary-max" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Requisitos</Label>
        <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Experiencia, tecnologías, idiomas..." rows={2} data-testid="textarea-job-requirements" />
      </div>
      <div className="space-y-2">
        <Label>Fecha de expiración *</Label>
        <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} min={new Date().toISOString().split("T")[0]} required data-testid="input-job-expires-at" />
        <p className="text-xs text-muted-foreground">La oferta se desactivará automáticamente en esta fecha. Recibirás un aviso por correo 7 días antes.</p>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending} data-testid="button-submit-job">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publicar oferta"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditJobForm({ job, onSubmit, isPending }: { job: JobOffer; onSubmit: (data: any) => void; isPending: boolean }) {
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [location, setLocation] = useState(job.location);
  const [salaryMin, setSalaryMin] = useState(job.salaryMin?.toString() || "");
  const [salaryMax, setSalaryMax] = useState(job.salaryMax?.toString() || "");
  const [jobType, setJobType] = useState(job.jobType);
  const [requirements, setRequirements] = useState(job.requirements || "");
  const [familiaProfesional, setFamiliaProfesional] = useState(job.familiaProfesional || "");
  const [cicloFormativo, setCicloFormativo] = useState(job.cicloFormativo || "");
  const [expiresAt, setExpiresAt] = useState(job.expiresAt ? new Date(job.expiresAt).toISOString().split("T")[0] : "");

  const ciclosDisponibles = familiaProfesional ? CICLOS_POR_FAMILIA[familiaProfesional] || [] : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title, description, location, jobType, requirements,
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
      familiaProfesional: familiaProfesional || undefined,
      cicloFormativo: cicloFormativo || undefined,
      expiresAt: expiresAt || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Título del puesto *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Desarrollador Full-Stack" required data-testid="input-edit-job-title" />
      </div>
      <div className="space-y-2">
        <Label>Descripción *</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe el puesto y las responsabilidades..." rows={4} required data-testid="textarea-edit-job-description" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ubicación *</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Madrid, España" required data-testid="input-edit-job-location" />
        </div>
        <div className="space-y-2">
          <Label>Tipo de contrato</Label>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger data-testid="select-edit-job-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_TIME">Jornada completa</SelectItem>
              <SelectItem value="PART_TIME">Media jornada</SelectItem>
              <SelectItem value="INTERNSHIP">Prácticas</SelectItem>
              <SelectItem value="FREELANCE">Freelance</SelectItem>
              <SelectItem value="REMOTE">Remoto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Familia Profesional</Label>
          <Select
            value={familiaProfesional}
            onValueChange={(val) => {
              setFamiliaProfesional(val);
              setCicloFormativo("");
            }}
          >
            <SelectTrigger data-testid="select-edit-job-familia">
              <SelectValue placeholder="Selecciona familia" />
            </SelectTrigger>
            <SelectContent>
              {FAMILIAS_PROFESIONALES.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Ciclo Formativo</Label>
          <Select
            value={cicloFormativo}
            onValueChange={setCicloFormativo}
            disabled={ciclosDisponibles.length === 0}
          >
            <SelectTrigger data-testid="select-edit-job-ciclo">
              <SelectValue placeholder="Selecciona ciclo" />
            </SelectTrigger>
            <SelectContent>
              {ciclosDisponibles.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Salario mínimo (EUR)</Label>
          <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="25000" data-testid="input-edit-job-salary-min" />
        </div>
        <div className="space-y-2">
          <Label>Salario máximo (EUR)</Label>
          <Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="40000" data-testid="input-edit-job-salary-max" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Requisitos</Label>
        <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Experiencia, tecnologías, idiomas..." rows={2} data-testid="textarea-edit-job-requirements" />
      </div>
      <div className="space-y-2">
        <Label>Fecha de expiración *</Label>
        <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} min={new Date().toISOString().split("T")[0]} required data-testid="input-edit-job-expires-at" />
        <p className="text-xs text-muted-foreground">La oferta se desactivará automáticamente en esta fecha.</p>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending} data-testid="button-submit-edit-job">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar cambios"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function CompanyProfileForm({ user }: { user: User }) {
  const { refetch } = useAuth();
  const { toast } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [companyName, setCompanyName] = useState(user.companyName || "");
  const [companyDescription, setCompanyDescription] = useState(user.companyDescription || "");
  const [companyWebsite, setCompanyWebsite] = useState(user.companyWebsite || "");
  const [companySector, setCompanySector] = useState(user.companySector || "");
  const [companyEmail, setCompanyEmail] = useState(user.companyEmail || "");
  const [companyCif, setCompanyCif] = useState(user.companyCif || "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/auth/profile", data);
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Perfil actualizado" });
    },
    onError: () => toast({ title: "Error", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ name, phone, companyName, companyDescription, companyWebsite, companySector, companyEmail, companyCif });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads/profile-photo", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || "Error"); }
      await refetch();
      toast({ title: "Foto de perfil actualizada" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async () => {
    try {
      const res = await fetch("/api/uploads/profile-photo", { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Error");
      await refetch();
      toast({ title: "Foto eliminada" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads/company-logo", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || "Error"); }
      await refetch();
      toast({ title: "Logo de empresa actualizado" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleDeleteLogo = async () => {
    try {
      const res = await fetch("/api/uploads/company-logo", { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Error");
      await refetch();
      toast({ title: "Logo eliminado" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5" /> Datos de la Empresa
      </h2>

      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-md bg-accent flex items-center justify-center overflow-hidden border">
            {user.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" data-testid="img-company-profile-photo" />
            ) : (
              <UserIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} data-testid="input-upload-company-photo" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Foto de contacto</p>
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP. Max 5MB.</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto} data-testid="button-upload-company-photo">
                {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                {user.profilePhotoUrl ? "Cambiar" : "Subir"}
              </Button>
              {user.profilePhotoUrl && (
                <Button type="button" variant="ghost" size="sm" className="gap-1 text-destructive" onClick={handleDeletePhoto} data-testid="button-delete-company-photo">
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-md bg-accent flex items-center justify-center overflow-hidden border">
            {user.companyLogoUrl ? (
              <img src={user.companyLogoUrl} alt="Logo de empresa" className="w-full h-full object-cover" data-testid="img-company-logo" />
            ) : (
              <Image className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} data-testid="input-upload-company-logo" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Logo de empresa</p>
            <p className="text-xs text-muted-foreground">JPG, PNG, WebP. Max 5MB.</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} data-testid="button-upload-company-logo">
                {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {user.companyLogoUrl ? "Cambiar" : "Subir"}
              </Button>
              {user.companyLogoUrl && (
                <Button type="button" variant="ghost" size="sm" className="gap-1 text-destructive" onClick={handleDeleteLogo} data-testid="button-delete-company-logo">
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre del contacto</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} data-testid="input-company-contact" />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="input-company-phone" />
          </div>
          <div className="space-y-2">
            <Label>Nombre de la empresa</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} data-testid="input-company-name-edit" />
          </div>
          <div className="space-y-2">
            <Label>Sector</Label>
            <Input value={companySector} onChange={(e) => setCompanySector(e.target.value)} data-testid="input-company-sector-edit" />
          </div>
          <div className="space-y-2">
            <Label>Email corporativo</Label>
            <Input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} data-testid="input-company-email-edit" />
          </div>
          <div className="space-y-2">
            <Label>CIF/NIF</Label>
            <Input value={companyCif} onChange={(e) => setCompanyCif(e.target.value)} data-testid="input-company-cif-edit" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Sitio web</Label>
          <Input value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} data-testid="input-company-website-edit" />
        </div>
        <div className="space-y-2">
          <Label>Descripción de la empresa</Label>
          <Textarea value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} rows={3} data-testid="textarea-company-description" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-md border">
          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
          Consentimiento registrado el {user.consentTimestamp ? new Date(user.consentTimestamp).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
        </div>
        <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-company">
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar cambios"}
        </Button>
      </form>
    </Card>
  );
}

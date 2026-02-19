import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { JobOffer, Application, User } from "@shared/schema";
import { FAMILIAS_PROFESIONALES, CICLOS_POR_FAMILIA } from "@shared/schema";
import {
  Briefcase, Search, User as UserIcon, FileText, LogOut, Loader2, MapPin,
  Clock, Building2, ChevronRight, Trash2, Shield, ExternalLink, Upload, Camera, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { TotpSecuritySection } from "@/components/totp-security";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

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

type JobOfferWithCompany = JobOffer & { company?: { companyName: string | null; name: string } };
type ApplicationWithJob = Application & { jobOffer?: JobOfferWithCompany };

export default function AlumniDashboard() {
  const { user, logout, refetch: refetchUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<JobOfferWithCompany[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: myApplications = [], isLoading: appsLoading } = useQuery<ApplicationWithJob[]>({
    queryKey: ["/api/applications/mine"],
  });

  const applyMutation = useMutation({
    mutationFn: async ({ jobOfferId, coverLetter }: { jobOfferId: string; coverLetter: string }) => {
      const res = await apiRequest("POST", "/api/applications", { jobOfferId, coverLetter });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications/mine"] });
      toast({ title: "Postulación enviada", description: "La empresa podrá ver tu perfil" });
      setApplyJobId(null);
      setCoverLetter("");
    },
    onError: (err: any) => {
      const msg = err.message?.includes("409") ? "Ya te has postulado a esta oferta" : "Error al postularte";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/auth/profile", data);
      return res.json();
    },
    onSuccess: () => {
      refetchUser();
      toast({ title: "Perfil actualizado" });
    },
    onError: () => toast({ title: "Error", description: "No se pudo actualizar el perfil", variant: "destructive" }),
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

  const [filterFamilia, setFilterFamilia] = useState("");

  const filteredJobs = jobs.filter((job) => {
    if (filterFamilia && filterFamilia !== "all" && job.familiaProfesional !== filterFamilia) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q) ||
      job.company?.companyName?.toLowerCase().includes(q) ||
      job.familiaProfesional?.toLowerCase().includes(q) ||
      job.cicloFormativo?.toLowerCase().includes(q)
    );
  });

  const appliedJobIds = new Set(myApplications.map((a) => a.jobOfferId));

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
            <span className="text-sm text-muted-foreground hidden sm:inline">Hola, {user.name}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="jobs" className="gap-2" data-testid="tab-jobs">
              <Search className="w-4 h-4" /> Ofertas
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2" data-testid="tab-applications">
              <FileText className="w-4 h-4" /> Candidaturas
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2" data-testid="tab-profile">
              <UserIcon className="w-4 h-4" /> Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, ubicación, empresa..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-jobs"
                />
              </div>
              <Select value={filterFamilia} onValueChange={setFilterFamilia}>
                <SelectTrigger className="w-[220px]" data-testid="select-filter-familia">
                  <SelectValue placeholder="Todas las familias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las familias</SelectItem>
                  {FAMILIAS_PROFESIONALES.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary">{filteredJobs.length} ofertas</Badge>
            </div>

            {jobsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-5">
                    <Skeleton className="h-5 w-48 mb-3" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-16 w-full" />
                  </Card>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">No hay ofertas disponibles</p>
                <p className="text-sm text-muted-foreground">Vuelve pronto para ver nuevas oportunidades</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-base">{job.title}</h3>
                          <Badge variant="outline" className="text-xs">{jobTypeLabels[job.jobType] || job.jobType}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {job.company?.companyName || "Empresa"}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                          </span>
                          {(job.salaryMin || job.salaryMax) && (
                            <span>
                              {job.salaryMin && job.salaryMax
                                ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} EUR`
                                : job.salaryMin
                                ? `Desde ${job.salaryMin.toLocaleString()} EUR`
                                : `Hasta ${job.salaryMax!.toLocaleString()} EUR`}
                            </span>
                          )}
                        </div>
                        {(job.familiaProfesional || job.cicloFormativo) && (
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {job.familiaProfesional && <Badge variant="outline" className="text-xs">{job.familiaProfesional}</Badge>}
                            {job.cicloFormativo && <Badge variant="secondary" className="text-xs">{job.cicloFormativo}</Badge>}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                        {job.requirements && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Requisitos: {job.requirements}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {appliedJobIds.has(job.id) ? (
                          <Badge variant="secondary">Postulado</Badge>
                        ) : (
                          <Dialog open={applyJobId === job.id} onOpenChange={(open) => { if (!open) setApplyJobId(null); }}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="gap-1" onClick={() => setApplyJobId(job.id)} data-testid={`button-apply-${job.id}`}>
                                Postularme <ChevronRight className="w-3.5 h-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Postularse a: {job.title}</DialogTitle>
                                <DialogDescription>
                                  Al postularte, la empresa podrá ver tu nombre, email, CV y datos de perfil para esta oferta.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 py-2">
                                <div className="p-3 rounded-md bg-accent/50 border text-sm flex items-start gap-2">
                                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                                  <span>Tus datos solo serán visibles para esta empresa y solo para esta oferta concreta.</span>
                                </div>
                                <div className="space-y-2">
                                  <Label>Carta de presentación (opcional)</Label>
                                  <Textarea
                                    placeholder="Cuéntale a la empresa por qué eres un buen candidato..."
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    rows={4}
                                    data-testid="textarea-cover-letter"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setApplyJobId(null)}>Cancelar</Button>
                                <Button
                                  onClick={() => applyMutation.mutate({ jobOfferId: job.id, coverLetter })}
                                  disabled={applyMutation.isPending}
                                  data-testid="button-confirm-apply"
                                >
                                  {applyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar postulación"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                      <Clock className="w-3 h-3" />
                      {new Date(job.createdAt).toLocaleDateString("es-ES")}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <h2 className="text-lg font-semibold">Mis Candidaturas</h2>
            {appsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-5">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </Card>
                ))}
              </div>
            ) : myApplications.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">Sin candidaturas</p>
                <p className="text-sm text-muted-foreground">Explora las ofertas y postúlate</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {myApplications.map((app) => (
                  <Card key={app.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="font-semibold">{app.jobOffer?.title || "Oferta"}</h3>
                        <p className="text-sm text-muted-foreground">
                          {app.jobOffer?.company?.companyName || "Empresa"} - {app.jobOffer?.location}
                        </p>
                        {app.coverLetter && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {app.coverLetter}
                          </p>
                        )}
                      </div>
                      <Badge variant={statusVariants[app.status]} data-testid={`badge-status-${app.id}`}>
                        {statusLabels[app.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Clock className="w-3 h-3" />
                      Enviada el {new Date(app.appliedAt).toLocaleDateString("es-ES")}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <ProfileForm user={user} onSave={(data) => updateProfileMutation.mutate(data)} isPending={updateProfileMutation.isPending} />

            <TotpSecuritySection />

            <Card className="p-6 border-destructive/30">
              <h3 className="font-semibold text-destructive flex items-center gap-2 mb-2">
                <Trash2 className="w-4 h-4" /> Zona peligrosa
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Eliminar tu cuenta borrará permanentemente todos tus datos: perfil, candidaturas y cualquier información asociada. Esta acción es irreversible.
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
                      Esta acción es irreversible. Se eliminarán: tu perfil, todas tus candidaturas y cualquier dato personal almacenado. Esto cumple con tu derecho al olvido (Art. 17 RGPD).
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

function ProfileForm({ user, onSave, isPending }: { user: User; onSave: (data: any) => void; isPending: boolean }) {
  const { refetch: refetchUser } = useAuth();
  const { toast } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [bio, setBio] = useState(user.bio || "");
  const [university, setUniversity] = useState(user.university || "");
  const [graduationYear, setGraduationYear] = useState(user.graduationYear?.toString() || "");
  const [familiaProfesional, setFamiliaProfesional] = useState(user.familiaProfesional || "");
  const [cicloFormativo, setCicloFormativo] = useState(user.cicloFormativo || "");
  const [skills, setSkills] = useState(user.skills || "");
  const [profilePublic, setProfilePublic] = useState(user.profilePublic);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);

  const ciclosDisponibles = familiaProfesional ? CICLOS_POR_FAMILIA[familiaProfesional] || [] : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name, phone, bio, university,
      graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
      familiaProfesional: familiaProfesional || undefined,
      cicloFormativo: cicloFormativo || undefined,
      skills, profilePublic,
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads/profile-photo", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al subir la foto");
      }
      await refetchUser();
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
      if (!res.ok) throw new Error("Error al eliminar la foto");
      await refetchUser();
      toast({ title: "Foto de perfil eliminada" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads/cv", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al subir el CV");
      }
      await refetchUser();
      toast({ title: "CV actualizado" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploadingCv(false);
      if (cvInputRef.current) cvInputRef.current.value = "";
    }
  };

  const handleDeleteCv = async () => {
    try {
      const res = await fetch("/api/uploads/cv", { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Error al eliminar el CV");
      await refetchUser();
      toast({ title: "CV eliminado" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <UserIcon className="w-5 h-5" /> Mi Perfil
      </h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-md bg-accent flex items-center justify-center overflow-hidden border">
            {user.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" data-testid="img-profile-photo" />
            ) : (
              <UserIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} data-testid="input-upload-photo" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Foto de perfil</p>
          <p className="text-xs text-muted-foreground">JPG, PNG o WebP. Máximo 5MB.</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto} data-testid="button-upload-photo">
              {uploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              {user.profilePhotoUrl ? "Cambiar" : "Subir foto"}
            </Button>
            {user.profilePhotoUrl && (
              <Button type="button" variant="ghost" size="sm" className="gap-1 text-destructive" onClick={handleDeletePhoto} data-testid="button-delete-photo">
                <X className="w-3.5 h-3.5" /> Eliminar
              </Button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre completo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} data-testid="input-profile-name" />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 600 000 000" data-testid="input-profile-phone" />
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
              <SelectTrigger data-testid="select-profile-familia">
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
              <SelectTrigger data-testid="select-profile-ciclo">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Centro de FP</Label>
            <Input value={university} onChange={(e) => setUniversity(e.target.value)} data-testid="input-profile-university" />
          </div>
          <div className="space-y-2">
            <Label>Año de promoción</Label>
            <Input type="number" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} data-testid="input-profile-year" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Habilidades</Label>
          <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="JavaScript, Python, React..." data-testid="input-profile-skills" />
        </div>
        <div className="space-y-2">
          <Label>Biografía</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuéntanos sobre ti..." rows={3} data-testid="textarea-profile-bio" />
        </div>

        <div className="space-y-2">
          <Label>Curriculum Vitae (PDF)</Label>
          <div className="flex items-center gap-3 flex-wrap">
            {user.cvUrl ? (
              <div className="flex items-center gap-2 p-2 rounded-md border bg-accent/30 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`/api/uploads/cv/${user.cvUrl.split("/").pop()}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary truncate flex items-center gap-1" data-testid="link-cv">
                  Ver CV <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-md border bg-accent/20 flex-1 min-w-0">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Sin CV subido</span>
              </div>
            )}
            <input ref={cvInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleCvUpload} data-testid="input-upload-cv" />
            <Button type="button" variant="outline" size="sm" className="gap-1 flex-shrink-0" onClick={() => cvInputRef.current?.click()} disabled={uploadingCv} data-testid="button-upload-cv">
              {uploadingCv ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {user.cvUrl ? "Cambiar CV" : "Subir CV"}
            </Button>
            {user.cvUrl && (
              <Button type="button" variant="ghost" size="sm" className="gap-1 text-destructive flex-shrink-0" onClick={handleDeleteCv} data-testid="button-delete-cv">
                <X className="w-3.5 h-3.5" /> Eliminar
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Solo PDF. Máximo 10MB.</p>
        </div>

        <div className="flex items-center justify-between gap-4 p-3 rounded-md bg-accent/50 border">
          <div>
            <p className="text-sm font-medium">Perfil público</p>
            <p className="text-xs text-muted-foreground">Si está activado, tu perfil básico será visible en la plataforma</p>
          </div>
          <Switch checked={profilePublic} onCheckedChange={setProfilePublic} data-testid="switch-profile-public" />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded-md border">
          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
          Consentimiento registrado el {user.consentTimestamp ? new Date(user.consentTimestamp).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
        </div>

        <Button type="submit" disabled={isPending} data-testid="button-save-profile">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar cambios"}
        </Button>
      </form>
    </Card>
  );
}

import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerAlumniSchema, registerCompanySchema, FAMILIAS_PROFESIONALES, CICLOS_POR_FAMILIA } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Briefcase, Loader2, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type AlumniData = z.infer<typeof registerAlumniSchema>;
type CompanyData = z.infer<typeof registerCompanySchema>;

export default function Register() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialRole = params.get("role") === "company" ? "company" : "alumni";
  const [activeTab, setActiveTab] = useState(initialRole);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const alumniForm = useForm<AlumniData>({
    resolver: zodResolver(registerAlumniSchema),
    defaultValues: {
      email: "", password: "", name: "", role: "ALUMNI",
      university: "", graduationYear: undefined,
      familiaProfesional: "", cicloFormativo: "",
      consentGiven: undefined as any,
    },
  });

  const selectedFamilia = alumniForm.watch("familiaProfesional");
  const ciclosDisponibles = selectedFamilia ? CICLOS_POR_FAMILIA[selectedFamilia] || [] : [];

  const companyForm = useForm<CompanyData>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      email: "", password: "", name: "", role: "COMPANY",
      companyName: "", companySector: "", companyWebsite: "",
      consentGiven: undefined as any,
    },
  });

  const handleRegister = async (data: AlumniData | CompanyData) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/register", data);
      await login(data.email, data.password);
      toast({ title: "Cuenta creada", description: "Bienvenido/a a FP Empleo" });
      navigate(data.role === "ALUMNI" ? "/dashboard" : "/company");
    } catch (err: any) {
      const msg = err.message?.includes("409") ? "Este email ya esta registrado" : "Error al crear la cuenta";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto flex items-center gap-2 px-4 py-3 sm:px-6">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg tracking-tight">FP Empleo</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-lg p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-1">Crear Cuenta</h1>
            <p className="text-muted-foreground text-sm">Unete a FP Empleo como titulado de FP o empresa</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="alumni" className="gap-2" data-testid="tab-alumni">
                <GraduationCap className="w-4 h-4" /> Titulado FP
              </TabsTrigger>
              <TabsTrigger value="company" className="gap-2" data-testid="tab-company">
                <Building2 className="w-4 h-4" /> Empresa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alumni">
              <form onSubmit={alumniForm.handleSubmit(handleRegister)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alumni-name">Nombre completo</Label>
                  <Input id="alumni-name" placeholder="Tu nombre" data-testid="input-alumni-name" {...alumniForm.register("name")} />
                  {alumniForm.formState.errors.name && <p className="text-sm text-destructive">{alumniForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumni-email">Email</Label>
                  <Input id="alumni-email" type="email" placeholder="tu@email.com" data-testid="input-alumni-email" {...alumniForm.register("email")} />
                  {alumniForm.formState.errors.email && <p className="text-sm text-destructive">{alumniForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alumni-password">Contrasena</Label>
                  <Input id="alumni-password" type="password" placeholder="Minimo 8 caracteres" data-testid="input-alumni-password" {...alumniForm.register("password")} />
                  {alumniForm.formState.errors.password && <p className="text-sm text-destructive">{alumniForm.formState.errors.password.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Familia Profesional</Label>
                    <Select
                      value={alumniForm.watch("familiaProfesional") || ""}
                      onValueChange={(val) => {
                        alumniForm.setValue("familiaProfesional", val);
                        alumniForm.setValue("cicloFormativo", "");
                      }}
                    >
                      <SelectTrigger data-testid="select-alumni-familia">
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
                      value={alumniForm.watch("cicloFormativo") || ""}
                      onValueChange={(val) => alumniForm.setValue("cicloFormativo", val)}
                      disabled={ciclosDisponibles.length === 0}
                    >
                      <SelectTrigger data-testid="select-alumni-ciclo">
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
                    <Label htmlFor="alumni-university">Centro de FP</Label>
                    <Input id="alumni-university" placeholder="Tu centro de FP" data-testid="input-alumni-university" {...alumniForm.register("university")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alumni-year">Ano de promocion</Label>
                    <Input id="alumni-year" type="number" placeholder="2024" data-testid="input-alumni-year" {...alumniForm.register("graduationYear", { valueAsNumber: true })} />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-md bg-accent/50 border">
                  <Checkbox
                    id="alumni-consent"
                    data-testid="checkbox-alumni-consent"
                    checked={alumniForm.watch("consentGiven") === true}
                    onCheckedChange={(checked) => alumniForm.setValue("consentGiven", checked === true ? true : undefined as any, { shouldValidate: true })}
                  />
                  <label htmlFor="alumni-consent" className="text-sm leading-relaxed cursor-pointer">
                    Acepto el tratamiento de mis datos personales conforme al RGPD. Entiendo que mis datos de perfil solo seran visibles para las empresas en las ofertas a las que me postule voluntariamente. Puedo ejercer mi derecho al olvido en cualquier momento.
                  </label>
                </div>
                {alumniForm.formState.errors.consentGiven && <p className="text-sm text-destructive">{alumniForm.formState.errors.consentGiven.message}</p>}

                <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-alumni">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cuenta de Titulado FP"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="company">
              <form onSubmit={companyForm.handleSubmit(handleRegister)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-contact-name">Nombre del contacto</Label>
                  <Input id="company-contact-name" placeholder="Persona de contacto" data-testid="input-company-name" {...companyForm.register("name")} />
                  {companyForm.formState.errors.name && <p className="text-sm text-destructive">{companyForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nombre de la empresa</Label>
                  <Input id="company-name" placeholder="Nombre de tu empresa" data-testid="input-company-company-name" {...companyForm.register("companyName")} />
                  {companyForm.formState.errors.companyName && <p className="text-sm text-destructive">{companyForm.formState.errors.companyName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email corporativo</Label>
                  <Input id="company-email" type="email" placeholder="empresa@email.com" data-testid="input-company-email" {...companyForm.register("email")} />
                  {companyForm.formState.errors.email && <p className="text-sm text-destructive">{companyForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-password">Contrasena</Label>
                  <Input id="company-password" type="password" placeholder="Minimo 8 caracteres" data-testid="input-company-password" {...companyForm.register("password")} />
                  {companyForm.formState.errors.password && <p className="text-sm text-destructive">{companyForm.formState.errors.password.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-sector">Sector</Label>
                    <Input id="company-sector" placeholder="Tecnologia, Salud..." data-testid="input-company-sector" {...companyForm.register("companySector")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-website">Sitio web</Label>
                    <Input id="company-website" placeholder="https://..." data-testid="input-company-website" {...companyForm.register("companyWebsite")} />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-md bg-accent/50 border">
                  <Checkbox
                    id="company-consent"
                    data-testid="checkbox-company-consent"
                    checked={companyForm.watch("consentGiven") === true}
                    onCheckedChange={(checked) => companyForm.setValue("consentGiven", checked === true ? true : undefined as any, { shouldValidate: true })}
                  />
                  <label htmlFor="company-consent" className="text-sm leading-relaxed cursor-pointer">
                    Acepto el tratamiento de datos conforme al RGPD. Me comprometo a utilizar los datos de los candidatos exclusivamente para los procesos de seleccion y a no compartirlos con terceros.
                  </label>
                </div>
                {companyForm.formState.errors.consentGiven && <p className="text-sm text-destructive">{companyForm.formState.errors.consentGiven.message}</p>}

                <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-company">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cuenta de Empresa"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Ya tienes cuenta?{" "}
            <Link href="/login">
              <span className="text-primary cursor-pointer font-medium" data-testid="link-login">Inicia sesion</span>
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}

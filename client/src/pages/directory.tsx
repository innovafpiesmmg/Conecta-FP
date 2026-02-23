import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase, Search, Building2, Globe,
  Mail, Loader2, Phone, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type PublicCompany = {
  id: string;
  name: string;
  companyName: string | null;
  companyDescription: string | null;
  companyWebsite: string | null;
  companySector: string | null;
  companyLogoUrl: string | null;
  companyEmail: string | null;
  profilePhotoUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
};

export default function Directory() {
  const { user } = useAuth();
  const [searchCompanies, setSearchCompanies] = useState("");

  const { data: companies = [], isLoading: loadingCompanies } = useQuery<PublicCompany[]>({
    queryKey: ["/api/public/companies"],
  });

  const filteredCompanies = companies.filter((c) => {
    const q = searchCompanies.toLowerCase();
    if (!q) return true;
    return (
      (c.companyName || c.name).toLowerCase().includes(q) ||
      c.companySector?.toLowerCase().includes(q) ||
      c.companyDescription?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg tracking-tight">Conecta FP Canarias</span>
            </div>
          </Link>
          <nav className="flex items-center gap-2 flex-wrap">
            {user ? (
              <Link href={user.role === "ADMIN" ? "/admin" : user.role === "ALUMNI" ? "/dashboard" : "/company"}>
                <Button data-testid="button-dashboard">Mi Panel</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" data-testid="button-login">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="button-register">Registrarse</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Directorio de Empresas</h1>
          <p className="text-muted-foreground">Descubre las empresas que colaboran con nuestra plataforma</p>
        </div>

        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, sector..."
            value={searchCompanies}
            onChange={(e) => setSearchCompanies(e.target.value)}
            className="pl-9"
            data-testid="input-search-companies"
          />
        </div>

        {loadingCompanies ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-12 h-12 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </Card>
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">
              {companies.length === 0 ? "Aún no hay empresas públicas" : "Sin resultados"}
            </p>
            <p className="text-sm text-muted-foreground">
              {companies.length === 0
                ? "Las empresas pueden activar su perfil público desde su panel"
                : "Prueba con otros términos de búsqueda"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((c) => (
              <Card key={c.id} className="p-5" data-testid={`card-company-${c.id}`}>
                <div className="flex items-center gap-3 mb-3">
                  {c.companyLogoUrl ? (
                    <img src={c.companyLogoUrl} alt="" className="w-12 h-12 rounded-md object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{c.companyName || c.name}</h3>
                    {c.companySector && (
                      <p className="text-xs text-muted-foreground truncate">{c.companySector}</p>
                    )}
                  </div>
                </div>
                {c.companyDescription && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{c.companyDescription}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {c.companyWebsite && (
                    <a
                      href={c.companyWebsite.startsWith("http") ? c.companyWebsite : `https://${c.companyWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      data-testid={`link-website-${c.id}`}
                    >
                      <Globe className="w-3 h-3" />
                      Web
                    </a>
                  )}
                  {c.companyEmail && (
                    <a
                      href={`mailto:${c.companyEmail}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      data-testid={`link-email-${c.id}`}
                    >
                      <Mail className="w-3 h-3" />
                      Email
                    </a>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Phone className="w-3 h-3" />
                      Llamar
                    </a>
                  )}
                  {c.whatsapp && (
                    <a href={`https://wa.me/${c.whatsapp.replace(/[^0-9+]/g, "").replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-green-600 transition-colors">
                      <MessageCircle className="w-3 h-3" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

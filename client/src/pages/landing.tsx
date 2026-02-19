import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Briefcase, Shield, Users, GraduationCap, Building2, ArrowRight, Lock, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const { user } = useAuth();

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
          <nav className="flex items-center gap-2 flex-wrap">
            {user ? (
              <Link href={user.role === "ALUMNI" ? "/dashboard" : "/company"}>
                <Button data-testid="button-dashboard">Mi Panel</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" data-testid="button-login">Iniciar Sesion</Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="button-register">Registrarse</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm text-muted-foreground mb-6">
              <Shield className="w-3.5 h-3.5" />
              Portal privado con proteccion RGPD
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Conecta talento
              <span className="text-primary"> de FP</span>
              <br />con oportunidades reales
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Plataforma exclusiva para titulados de FP y empresas. Tus datos estan protegidos: 
              solo compartes informacion cuando tu decides postularte.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register?role=alumni">
                <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-register-alumni">
                  <GraduationCap className="w-5 h-5" />
                  Soy Titulado FP
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/register?role=company">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto" data-testid="button-register-company">
                  <Building2 className="w-5 h-5" />
                  Soy Empresa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Como funciona</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Un proceso sencillo y seguro para conectar talento con oportunidades
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Registrate</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Crea tu cuenta como titulado de FP o empresa. Aceptas el tratamiento de datos con total transparencia.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Explora ofertas</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Las empresas publican vacantes y los titulados de FP buscan entre las oportunidades disponibles.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Postulate</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Solo cuando te inscribes en una oferta, la empresa puede ver tu perfil y contacto.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Privacidad por diseno</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Cumplimos con el RGPD y priorizamos la proteccion de tus datos personales
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-semibold">Visibilidad selectiva</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Tu perfil es privado por defecto. Solo se comparte con la empresa cuando te postulas voluntariamente.
              </p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-semibold">Consentimiento explicito</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Registramos la fecha y hora exacta de tu consentimiento para el tratamiento de datos.
              </p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-semibold">Derecho al olvido</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Puedes eliminar tu cuenta y todos tus datos asociados de forma permanente en cualquier momento.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Empieza hoy mismo</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Unete a nuestra comunidad de titulados de FP y empresas. Es gratuito y seguro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register?role=alumni">
              <Button size="lg" variant="secondary" className="gap-2 w-full sm:w-auto" data-testid="button-cta-alumni">
                <GraduationCap className="w-5 h-5" />
                Registrarme como Titulado FP
              </Button>
            </Link>
            <Link href="/register?role=company">
              <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/30 text-primary-foreground w-full sm:w-auto" data-testid="button-cta-company">
                <Building2 className="w-5 h-5" />
                Registrar mi Empresa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span>Conecta FP - Portal de Empleo Privado</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span>Protegido por RGPD</span>
            <span>Datos cifrados</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

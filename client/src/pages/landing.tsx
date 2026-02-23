import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Briefcase, Shield, Users, GraduationCap, Building2, ArrowRight, Lock, Eye, Trash2, MessageSquarePlus, CheckCircle2, Search, FileText, Star, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/images/hero-students.jpg";
import alumniImage from "@/assets/images/feature-alumni.jpg";
import companyImage from "@/assets/images/feature-company.jpg";
import asdLogo from "@assets/ASD_1771889294764.png";

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
              <span className="font-semibold text-lg tracking-tight">Conecta FP Canarias</span>
            </div>
          </Link>
          <nav className="flex items-center gap-2 flex-wrap">
            <Link href="/directorio">
              <Button variant="ghost" data-testid="button-directory">Empresas</Button>
            </Link>
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

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 text-sm text-white/90 mb-6">
              <Shield className="w-3.5 h-3.5" />
              Portal privado con protección RGPD
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 text-white">
              Conecta talento
              <span className="text-blue-300"> de FP</span>
              <br />con oportunidades reales
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl leading-relaxed">
              Plataforma exclusiva para titulados de Formación Profesional y empresas en Canarias.
              Tus datos protegidos: solo compartes información cuando decides postularte.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link href="/register?role=alumni">
                <Button size="lg" className="gap-2 w-full sm:w-auto" data-testid="button-register-alumni">
                  <GraduationCap className="w-5 h-5" />
                  Soy Titulado FP
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/register?role=company">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-white/30 text-white hover:bg-white/10" data-testid="button-register-company">
                  <Building2 className="w-5 h-5" />
                  Soy Empresa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "23", label: "Familias Profesionales" },
              { value: "91", label: "Ciclos Formativos" },
              { value: "131", label: "Centros FP en Canarias" },
              { value: "100%", label: "Gratuito y Seguro" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Cómo funciona</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Un proceso sencillo y seguro para conectar talento con oportunidades
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, step: "1", title: "Regístrate", desc: "Crea tu cuenta como titulado de FP o empresa. Aceptas el tratamiento de datos con total transparencia." },
              { icon: Search, step: "2", title: "Explora ofertas", desc: "Las empresas publican vacantes y los titulados de FP buscan entre las oportunidades disponibles." },
              { icon: FileText, step: "3", title: "Postúlate", desc: "Solo cuando te inscribes en una oferta, la empresa puede ver tu perfil y contacto." },
            ].map((item) => (
              <Card key={item.step} className="p-6 text-center relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute top-3 right-3 text-5xl font-bold text-muted/30 select-none">{item.step}</div>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
                <GraduationCap className="w-4 h-4" />
                Para Titulados FP
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Tu futuro profesional empieza aquí
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Accede a ofertas de empleo exclusivas para titulados de Formación Profesional.
                Crea tu CV digital, recibe notificaciones de ofertas que encajan contigo y gestiona tus candidaturas.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Busca ofertas por familia profesional y ciclo formativo",
                  "Recibe alertas cuando se publiquen ofertas para tu perfil",
                  "Constructor de CV digital integrado",
                  "Tu perfil solo visible cuando tú decides",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register?role=alumni">
                <Button className="gap-2" data-testid="button-section-register-alumni">
                  Crear cuenta de Titulado FP
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img src={alumniImage} alt="Titulados FP trabajando" className="w-full h-72 sm:h-80 object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img src={companyImage} alt="Empresas contratando" className="w-full h-72 sm:h-80 object-cover" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
                <Building2 className="w-4 h-4" />
                Para Empresas
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Encuentra el talento que necesitas
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Publica ofertas de empleo, gestiona candidaturas y contacta directamente con los titulados
                de FP que se ajusten a tu perfil. Todo en un entorno seguro y conforme al RGPD.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Publica ofertas segmentadas por familia y ciclo formativo",
                  "Recibe candidaturas con CV y carta de presentación",
                  "Contacto directo vía email, teléfono o WhatsApp",
                  "Panel de gestión completo para tus ofertas",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register?role=company">
                <Button className="gap-2" data-testid="button-section-register-company">
                  Registrar mi Empresa
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Privacidad por diseño</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Cumplimos con el RGPD y priorizamos la protección de tus datos personales
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Visibilidad selectiva</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Tu perfil es privado por defecto. Solo se comparte con la empresa cuando te postulas voluntariamente.
              </p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Consentimiento explícito</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Registramos la fecha y hora exacta de tu consentimiento para el tratamiento de datos.
              </p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-primary" />
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

      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative max-w-3xl mx-auto text-center px-4 sm:px-6">
          <Star className="w-10 h-10 text-primary-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-primary-foreground">Empieza hoy mismo</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Únete a nuestra comunidad de titulados de FP y empresas en Canarias. Es gratuito y seguro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register?role=alumni">
              <Button size="lg" variant="secondary" className="gap-2 w-full sm:w-auto" data-testid="button-cta-alumni">
                <GraduationCap className="w-5 h-5" />
                Registrarme como Titulado FP
              </Button>
            </Link>
            <Link href="/register?role=company">
              <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/30 text-primary-foreground w-full sm:w-auto hover:bg-white/10" data-testid="button-cta-company">
                <Building2 className="w-5 h-5" />
                Registrar mi Empresa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <HelpCircle className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Preguntas Frecuentes</h2>
            </div>
            <p className="text-muted-foreground text-lg">Resolvemos tus dudas sobre la plataforma</p>
          </div>
          <Card className="p-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger>¿Qué es Conecta FP Canarias?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">Es un portal de empleo privado diseñado específicamente para titulados de Formación Profesional en Canarias. Conectamos a graduados de ciclos formativos con empresas que buscan perfiles técnicos cualificados.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>¿Es gratuito registrarse?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">Sí, el registro es completamente gratuito tanto para titulados FP como para empresas. No tiene coste alguno publicar ofertas ni postularse a ellas.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>¿Cómo se protegen mis datos personales?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">Cumplimos con el RGPD (Reglamento General de Protección de Datos). Tu perfil es privado por defecto: las empresas solo pueden ver tus datos cuando tú decides postularte a una oferta. Además, puedes ejercer tu derecho al olvido y eliminar toda tu información en cualquier momento.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>¿Qué ciclos formativos están disponibles?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">La plataforma incluye las 23 familias profesionales con todos sus ciclos formativos: desde Informática y Comunicaciones (DAW, DAM, ASIR) hasta Administración, Sanidad, Hostelería, Comercio y muchas más. Al registrarte, seleccionas tu familia y ciclo específico.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-5">
                <AccordionTrigger>¿Puedo recibir alertas de nuevas ofertas?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">Sí. Los titulados FP pueden activar notificaciones por email en su perfil. Cuando una empresa publique una oferta que coincida con tu ciclo formativo, recibirás un aviso automáticamente.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-6">
                <AccordionTrigger>¿Las empresas pueden contactarme directamente?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">Solo cuando tú te postulas a una oferta. En ese momento, la empresa puede ver tu perfil, CV y datos de contacto, incluyendo la opción de contactarte por WhatsApp si has proporcionado tu número.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-7">
                <AccordionTrigger>¿Quién está detrás de esta plataforma?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">Conecta FP Canarias es un proyecto promovido por el Departamento de Administración de Empresas del IES Manuel Martín González, con el objetivo de facilitar la inserción laboral de los titulados de FP en las Islas Canarias.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-8">
                <AccordionTrigger>¿Necesito completar mi perfil para postularme?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">Sí. Para garantizar candidaturas de calidad, los titulados FP deben completar su perfil (nombre, teléfono, centro de FP, familia y ciclo formativo) y tener al menos un CV (subido en PDF o creado digitalmente) antes de poder postularse a ofertas.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-9">
                <AccordionTrigger>¿Las ofertas pueden tener varias plazas?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">Sí. Las empresas pueden indicar cuántas plazas tiene cada oferta. A medida que se aceptan candidatos, las plazas disponibles se van descontando. Cuando todas las plazas están cubiertas, la oferta se cierra automáticamente.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>Conecta FP Canarias - Portal de Empleo Privado</span>
            </div>
            <span className="text-xs text-muted-foreground">Un proyecto promovido por el Dpto. de Administración de Empresas del IES Manuel Martín González</span>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/sugerencias">
                <span className="cursor-pointer hover:text-foreground transition-colors flex items-center gap-1" data-testid="link-suggestions-footer">
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  Sugerencias
                </span>
              </Link>
              <Link href="/terms">
                <span className="cursor-pointer hover:text-foreground transition-colors" data-testid="link-terms-footer">Términos y Privacidad</span>
              </Link>
              <span>Protegido por RGPD</span>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <img src={asdLogo} alt="Atreyu Servicios Digitales" className="h-4 w-auto" data-testid="img-asd-logo" />
              Software desarrollado por Atreyu Servicios Digitales
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

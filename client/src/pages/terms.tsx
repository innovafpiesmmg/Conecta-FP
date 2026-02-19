import { Link } from "wouter";
import { Briefcase, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Card className="p-6 sm:p-8 lg:p-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" data-testid="text-terms-title">Términos, Condiciones y Política de Privacidad</h1>
          <p className="text-muted-foreground mb-8">Conecta-FP</p>

          <div className="prose prose-sm max-w-none space-y-6 text-foreground">
            <p className="leading-relaxed">
              Bienvenido/a a Conecta-FP. El uso de esta plataforma implica la aceptación íntegra de los términos y condiciones aquí descritos. Este documento constituye el marco legal que garantiza la seguridad y transparencia en la relación entre los centros educativos, el alumnado titulado y el tejido empresarial.
            </p>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">1. Responsable del Tratamiento de Datos</h2>
              <p className="leading-relaxed text-muted-foreground">
                El Responsable del tratamiento de sus datos personales es el Centro de Enseñanza IES MANUEL MARTÍN GONZÁLEZ, con domicilio en el Sur de Tenerife, conforme a las directrices de la Consejería de Educación, Formación Profesional, Actividad Física y Deportes del Gobierno de Canarias.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">2. Finalidad del Tratamiento</h2>
              <p className="leading-relaxed text-muted-foreground">
                La recogida y tratamiento de datos personales a través de esta plataforma tiene como única finalidad:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Facilitar la inserción laboral de los titulados de FP.</li>
                <li>Gestionar la relación entre empresas y candidatos en el marco de la nueva FP Dual.</li>
                <li>Proporcionar analíticas de empleabilidad (de forma agregada y anónima) para la mejora de la oferta formativa.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">3. Base Jurídica y Consentimiento (RGPD)</h2>
              <p className="leading-relaxed text-muted-foreground">
                En cumplimiento del Reglamento General de Protección de Datos (RGPD - UE 2016/679) y la Ley Orgánica 3/2018 (LOPDGDD), el tratamiento de sus datos se basa en su consentimiento explícito. Al marcar la casilla de aceptación, usted autoriza el tratamiento de sus datos conforme a los fines aquí descritos.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">4. Política de Visibilidad y Privacidad (Control del Usuario)</h2>
              <p className="leading-relaxed text-muted-foreground">
                Para garantizar la soberanía del usuario sobre su propia información, Conecta-FP opera bajo un modelo de postulación voluntaria:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Privacidad del Perfil:</strong> Los datos personales, de contacto y el portafolio del usuario no son públicos ni indexables por motores de búsqueda externos.</li>
                <li><strong className="text-foreground">Visibilidad Restringida:</strong> Su perfil solo será visible para una empresa específica en el momento en que usted decida postularse voluntariamente a una oferta publicada por dicha entidad.</li>
                <li><strong className="text-foreground">Acceso Empresarial:</strong> Las empresas registradas no podrán realizar búsquedas masivas de datos identificativos de los alumnos, salvo que el alumno haya iniciado previamente un proceso de contacto mediante la postulación.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">5. Derechos del Usuario (ARCO+)</h2>
              <p className="leading-relaxed text-muted-foreground">
                Usted tiene derecho a acceder, rectificar, limitar y portar sus datos. Especialmente, destacamos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Derecho al Olvido (Derecho de Supresión):</strong> Usted puede ejercer su derecho al olvido en cualquier momento. Al solicitar la supresión de su cuenta, todos sus datos personales, académicos y profesionales serán eliminados de forma definitiva e irreversible de nuestros servidores activos y copias de seguridad en un plazo máximo de 30 días.</li>
                <li><strong className="text-foreground">Revocación del Consentimiento:</strong> Puede retirar su consentimiento para el tratamiento de sus datos en cualquier momento sin que ello afecte a la licitud del tratamiento previo.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">6. Seguridad de la Información</h2>
              <p className="leading-relaxed text-muted-foreground">
                El sistema utiliza una arquitectura Express.js y base de datos PostgreSQL con cifrado en tránsito y en reposo. Se aplican políticas de seguridad a nivel de fila (Row Level Security) para asegurar que nadie acceda a datos para los que no tiene permiso explícito.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">7. Declaración de Aceptación</h2>
              <p className="leading-relaxed text-muted-foreground">
                Al registrarme en la plataforma y pulsar el botón de aceptación, declaro expresamente que:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">ACEPTO</strong> el tratamiento de mis datos personales conforme al marco del RGPD detallado anteriormente.</li>
                <li><strong className="text-foreground">ENTIENDO</strong> que mis datos de perfil solo serán visibles para las empresas en aquellas ofertas a las que me postule voluntariamente.</li>
                <li><strong className="text-foreground">RECONOZCO</strong> que puedo ejercer mi derecho al olvido y solicitar la eliminación total de mi información en cualquier momento a través del panel de configuración de mi cuenta o mediante comunicación directa al Responsable del Tratamiento.</li>
              </ul>
            </section>

            <div className="pt-4 border-t mt-8">
              <p className="text-sm text-muted-foreground">Fecha de última actualización: Febrero de 2026</p>
              <p className="text-sm text-muted-foreground">Proyecto: Conecta-FP | Red de Innovación de la FP Canaria IES MANUEL MARTÍN GONZÁLEZ</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

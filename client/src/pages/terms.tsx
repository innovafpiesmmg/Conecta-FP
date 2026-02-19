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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" data-testid="text-terms-title">Terminos, Condiciones y Politica de Privacidad</h1>
          <p className="text-muted-foreground mb-8">Conecta-FP</p>

          <div className="prose prose-sm max-w-none space-y-6 text-foreground">
            <p className="leading-relaxed">
              Bienvenido/a a Conecta-FP. El uso de esta plataforma implica la aceptacion integra de los terminos y condiciones aqui descritos. Este documento constituye el marco legal que garantiza la seguridad y transparencia en la relacion entre los centros educativos, el alumnado titulado y el tejido empresarial.
            </p>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">1. Responsable del Tratamiento de Datos</h2>
              <p className="leading-relaxed text-muted-foreground">
                El Responsable del tratamiento de sus datos personales es el Centro de Ensenanza IES MANUEL MARTIN GONZALEZ, con domicilio en el Sur de Tenerife, conforme a las directrices de la Consejeria de Educacion, Formacion Profesional, Actividad Fisica y Deportes del Gobierno de Canarias.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">2. Finalidad del Tratamiento</h2>
              <p className="leading-relaxed text-muted-foreground">
                La recogida y tratamiento de datos personales a traves de esta plataforma tiene como unica finalidad:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Facilitar la insercion laboral de los titulados de FP.</li>
                <li>Gestionar la relacion entre empresas y candidatos en el marco de la nueva FP Dual.</li>
                <li>Proporcionar analiticas de empleabilidad (de forma agregada y anonima) para la mejora de la oferta formativa.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">3. Base Juridica y Consentimiento (RGPD)</h2>
              <p className="leading-relaxed text-muted-foreground">
                En cumplimiento del Reglamento General de Proteccion de Datos (RGPD - UE 2016/679) y la Ley Organica 3/2018 (LOPDGDD), el tratamiento de sus datos se basa en su consentimiento explicito. Al marcar la casilla de aceptacion, usted autoriza el tratamiento de sus datos conforme a los fines aqui descritos.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">4. Politica de Visibilidad y Privacidad (Control del Usuario)</h2>
              <p className="leading-relaxed text-muted-foreground">
                Para garantizar la soberania del usuario sobre su propia informacion, Conecta-FP opera bajo un modelo de postulacion voluntaria:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Privacidad del Perfil:</strong> Los datos personales, de contacto y el portafolio del usuario no son publicos ni indexables por motores de busqueda externos.</li>
                <li><strong className="text-foreground">Visibilidad Restringida:</strong> Su perfil solo sera visible para una empresa especifica en el momento en que usted decida postularse voluntariamente a una oferta publicada por dicha entidad.</li>
                <li><strong className="text-foreground">Acceso Empresarial:</strong> Las empresas registradas no podran realizar busquedas masivas de datos identificativos de los alumnos, salvo que el alumno haya iniciado previamente un proceso de contacto mediante la postulacion.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">5. Derechos del Usuario (ARCO+)</h2>
              <p className="leading-relaxed text-muted-foreground">
                Usted tiene derecho a acceder, rectificar, limitar y portar sus datos. Especialmente, destacamos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Derecho al Olvido (Derecho de Supresion):</strong> Usted puede ejercer su derecho al olvido en cualquier momento. Al solicitar la supresion de su cuenta, todos sus datos personales, academicos y profesionales seran eliminados de forma definitiva e irreversible de nuestros servidores activos y copias de seguridad en un plazo maximo de 30 dias.</li>
                <li><strong className="text-foreground">Revocacion del Consentimiento:</strong> Puede retirar su consentimiento para el tratamiento de sus datos en cualquier momento sin que ello afecte a la licitud del tratamiento previo.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">6. Seguridad de la Informacion</h2>
              <p className="leading-relaxed text-muted-foreground">
                El sistema utiliza una arquitectura Express.js y base de datos PostgreSQL con cifrado en transito y en reposo. Se aplican politicas de seguridad a nivel de fila (Row Level Security) para asegurar que nadie acceda a datos para los que no tiene permiso explicito.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">7. Declaracion de Aceptacion</h2>
              <p className="leading-relaxed text-muted-foreground">
                Al registrarme en la plataforma y pulsar el boton de aceptacion, declaro expresamente que:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">ACEPTO</strong> el tratamiento de mis datos personales conforme al marco del RGPD detallado anteriormente.</li>
                <li><strong className="text-foreground">ENTIENDO</strong> que mis datos de perfil solo seran visibles para las empresas en aquellas ofertas a las que me postule voluntariamente.</li>
                <li><strong className="text-foreground">RECONOZCO</strong> que puedo ejercer mi derecho al olvido y solicitar la eliminacion total de mi informacion en cualquier momento a traves del panel de configuracion de mi cuenta o mediante comunicacion directa al Responsable del Tratamiento.</li>
              </ul>
            </section>

            <div className="pt-4 border-t mt-8">
              <p className="text-sm text-muted-foreground">Fecha de ultima actualizacion: Febrero de 2026</p>
              <p className="text-sm text-muted-foreground">Proyecto: Conecta-FP | Red de Innovacion de la FP Canaria IES MANUEL MARTIN GONZALEZ</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

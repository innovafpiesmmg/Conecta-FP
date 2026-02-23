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
              <span className="font-semibold text-lg tracking-tight">Conecta FP Canarias</span>
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
              <h2 className="text-lg font-semibold">3. Carácter Gratuito y Ausencia de Ánimo de Lucro</h2>
              <p className="leading-relaxed text-muted-foreground">
                La plataforma Conecta-FP es una iniciativa de carácter estrictamente educativo y social. El IES MANUEL MARTÍN GONZÁLEZ presta este servicio de forma totalmente gratuita y sin ningún ánimo de lucro. El centro no recibe contraprestación económica alguna ni por parte de los alumnos ni por parte de las empresas por el uso de la herramienta o la gestión de los contactos.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">4. Exclusión de Garantías y Responsabilidad</h2>
              <p className="leading-relaxed text-muted-foreground">
                El IES MANUEL MARTÍN GONZÁLEZ se esfuerza por mantener la plataforma operativa y segura, sin embargo, el usuario acepta que:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Disponibilidad del Servicio:</strong> El centro no garantiza que la plataforma funcione de manera ininterrumpida, puntual, segura o libre de errores. El servicio se presta "tal cual" y según disponibilidad, pudiendo ser suspendido por mantenimiento o causas técnicas sin previo aviso.</li>
                <li><strong className="text-foreground">Limitación de Responsabilidad:</strong> El centro no se hace responsable de los daños o perjuicios de cualquier naturaleza que pudieran derivarse de la falta de disponibilidad, fallos en el sistema, virus informáticos o desconexiones en la red.</li>
                <li><strong className="text-foreground">Uso del Servicio:</strong> El IES no acepta responsabilidad alguna por la veracidad de la información publicada por terceros (empresas o alumnos), ni por el éxito o resultado de las entrevistas o relaciones laborales que puedan surgir tras el contacto inicial en la plataforma.</li>
                <li><strong className="text-foreground">Alcance General:</strong> El centro queda exento de cualquier responsabilidad civil, mercantil o administrativa derivada del uso de la aplicación por parte de los usuarios.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">5. Base Jurídica y Consentimiento (RGPD)</h2>
              <p className="leading-relaxed text-muted-foreground">
                En cumplimiento del Reglamento General de Protección de Datos (RGPD - UE 2016/679) y la Ley Orgánica 3/2018 (LOPDGDD), el tratamiento de sus datos se basa en su consentimiento explícito. Al marcar la casilla de aceptación, usted autoriza el tratamiento de sus datos conforme a los fines aquí descritos.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">6. Política de Visibilidad y Privacidad (Control del Usuario)</h2>
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
              <h2 className="text-lg font-semibold">7. Derechos del Usuario (ARCO+)</h2>
              <p className="leading-relaxed text-muted-foreground">
                Usted tiene derecho a acceder, rectificar, limitar y portar sus datos. Especialmente, destacamos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Derecho al Olvido (Derecho de Supresión):</strong> Usted puede ejercer su derecho al olvido en cualquier momento. Al solicitar la supresión de su cuenta, todos sus datos personales, académicos y profesionales serán eliminados de forma definitiva e irreversible de nuestros servidores activos y copias de seguridad en un plazo máximo de 30 días.</li>
                <li><strong className="text-foreground">Revocación del Consentimiento:</strong> Puede retirar su consentimiento para el tratamiento de sus datos en cualquier momento sin que ello afecte a la licitud del tratamiento previo.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">8. Seguridad de la Información</h2>
              <p className="leading-relaxed text-muted-foreground">
                El sistema utiliza una arquitectura Express.js y base de datos PostgreSQL con cifrado en tránsito y en reposo. Se aplican políticas de seguridad a nivel de fila (Row Level Security) para asegurar que nadie acceda a datos para los que no tiene permiso explícito.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">9. Política de Cookies</h2>
              <p className="leading-relaxed text-muted-foreground">
                Conecta-FP utiliza exclusivamente cookies técnicas estrictamente necesarias para el funcionamiento de la plataforma. En concreto:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Cookie de sesión:</strong> Se genera una cookie de sesión al iniciar sesión en la plataforma. Su única finalidad es mantener la sesión del usuario activa y autenticada durante la navegación. Esta cookie se elimina automáticamente al cerrar sesión o tras un periodo de inactividad.</li>
                <li><strong className="text-foreground">Ausencia de cookies de terceros:</strong> La plataforma NO utiliza cookies de seguimiento, publicidad, analítica de terceros ni ningún otro tipo de cookie que no sea estrictamente necesaria para la prestación del servicio.</li>
                <li><strong className="text-foreground">Base legal:</strong> Al tratarse de cookies técnicas imprescindibles para el funcionamiento del servicio, su uso está amparado por el artículo 22.2 de la Ley 34/2002 (LSSI-CE) y no requieren consentimiento previo del usuario, conforme a las directrices de la Agencia Española de Protección de Datos (AEPD).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">10. Declaración de Aceptación</h2>
              <p className="leading-relaxed text-muted-foreground">
                Al registrarme en la plataforma y pulsar el botón de aceptación, declaro expresamente que:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">ACEPTO</strong> el tratamiento de mis datos personales conforme al marco del RGPD detallado anteriormente.</li>
                <li><strong className="text-foreground">ENTIENDO</strong> que mis datos de perfil solo serán visibles para las empresas en aquellas ofertas a las que me postule voluntariamente.</li>
                <li><strong className="text-foreground">ACEPTO</strong> las condiciones de exclusión de responsabilidad y el carácter gratuito del servicio prestado por el IES Manuel Martín González.</li>
                <li><strong className="text-foreground">RECONOZCO</strong> que puedo ejercer mi derecho al olvido y solicitar la eliminación total de mi información en cualquier momento a través del panel de configuración de mi cuenta.</li>
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

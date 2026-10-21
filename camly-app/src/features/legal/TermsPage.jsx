import { Link } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
import SEO from '../../components/common/SEO';
import SaaSLogo from '../../components/common/SaaSLogo';

const sections = [
  {
    id: 'servicio', title: '1. Qué ofrece NEGU', body: <p>NEGU es una plataforma web para que comercios creen un catálogo digital, reciban y organicen pedidos, administren productos y consulten información de ventas. Algunas funciones, como ubicación, pagos o mensajería, dependen de servicios externos y de la configuración de cada negocio.</p>,
  },
  {
    id: 'aceptacion', title: '2. Aceptación y capacidad', body: <p>Al crear una cuenta o usar las funciones privadas de NEGU, aceptas estos términos. Si creas una cuenta en nombre de un negocio, declaras que tienes autorización para hacerlo. Debes tener capacidad legal para contratar y proporcionar datos correctos y actualizados.</p>,
  },
  {
    id: 'cuenta', title: '3. Cuenta y seguridad', body: <><p>Eres responsable de custodiar tu contraseña y de la actividad realizada desde tu cuenta. Usa una contraseña única y avísanos si sospechas de un acceso no autorizado. No compartas credenciales con personas que no deban administrar tu negocio.</p><p>El titular de una tienda es responsable de los datos, productos, precios, imágenes, horarios, pedidos y demás contenido que publique, así como de mantenerlo actualizado.</p></>,
  },
  {
    id: 'uso', title: '4. Uso permitido', body: <><p>Utiliza NEGU de forma lícita y respetando los derechos de tus clientes y de terceros. No debes intentar acceder a cuentas o datos ajenos, interferir con el servicio, introducir código malicioso, suplantar a otras personas ni publicar contenido ilícito o engañoso.</p><p>Podemos limitar temporalmente una cuenta cuando sea necesario para proteger la plataforma, a sus usuarios o cumplir una obligación legal; procuraremos avisar al titular cuando sea posible.</p></>,
  },
  {
    id: 'pedidos', title: '5. Pedidos, precios y entregas', body: <p>NEGU facilita herramientas para que el cliente envíe una solicitud al comercio. Salvo que una pantalla indique expresamente lo contrario, NEGU no es vendedor, no prepara ni entrega productos y no forma parte del contrato de compraventa entre cliente y comercio. El comercio define disponibilidad, precios, cargos de envío, medios de pago, cobertura y condiciones de entrega, y debe confirmarlos directamente con el cliente.</p>,
  },
  {
    id: 'mensajeria', title: '6. WhatsApp y servicios externos', body: <p>Algunas acciones abren WhatsApp o enlaces de terceros. El uso de esos servicios se rige también por sus propios términos y políticas. NEGU no controla su disponibilidad, funcionamiento, cobros ni decisiones sobre cuentas o números. El comercio es responsable de tener autorización para contactar a sus clientes y de respetar sus preferencias de comunicación.</p>,
  },
  {
    id: 'planes', title: '7. Prueba, planes y pagos', body: <p>La duración de la prueba y las funciones disponibles se muestran durante el registro o dentro de la plataforma. Si se ofrecen planes pagos, el precio, periodo, forma de pago y renovación deben presentarse antes de contratar. Los cargos del comercio a sus clientes por productos o domicilios son independientes de cualquier plan de NEGU. NEGU no retiene el dinero de las ventas gestionadas por el comercio.</p>,
  },
  {
    id: 'datos', title: '8. Datos personales y contenido', body: <p>NEGU trata información necesaria para operar las cuentas, tiendas y pedidos. El comercio debe contar con base legal para cargar y utilizar los datos personales de sus clientes, comunicarles el uso que les dará y atender sus solicitudes. Los datos y materiales que el comercio incorpore siguen bajo su responsabilidad; concede a NEGU permiso limitado para alojarlos y mostrarlos únicamente al prestar el servicio. Para solicitudes sobre una cuenta o datos, escribe al correo de contacto.</p>,
  },
  {
    id: 'propiedad', title: '9. Propiedad intelectual', body: <p>La plataforma, su código, diseño, marcas y documentación pertenecen a sus respectivos titulares. NEGU concede un permiso limitado, revocable y no transferible para usar las funciones disponibles mientras la cuenta esté habilitada. Estos términos no transfieren derechos de propiedad intelectual al usuario.</p>,
  },
  {
    id: 'disponibilidad', title: '10. Disponibilidad y cambios', body: <p>Trabajamos para mantener NEGU disponible, pero pueden ocurrir interrupciones por mantenimiento, conectividad, fallos técnicos o proveedores externos. Las funciones pueden evolucionar; si un cambio afecta materialmente un servicio contratado, comunicaremos la información correspondiente por un canal disponible.</p>,
  },
  {
    id: 'responsabilidad', title: '11. Responsabilidad', body: <p>En la medida permitida por la ley colombiana, NEGU no responde por acuerdos entre el comercio y sus clientes, por el contenido publicado por los usuarios, por actos de proveedores externos ni por interrupciones fuera de su control razonable. Nada en estos términos elimina derechos irrenunciables ni excluye responsabilidades que la ley no permita limitar.</p>,
  },
  {
    id: 'terminacion', title: '12. Cierre de cuenta', body: <p>Puedes dejar de usar NEGU y solicitar el cierre de tu cuenta mediante los canales de contacto. Podemos suspender el acceso ante incumplimientos graves, riesgos de seguridad u obligaciones legales. Cuando una cuenta se cierre, los datos se conservarán o eliminarán conforme a las obligaciones legales y operativas aplicables.</p>,
  },
  {
    id: 'cambios', title: '13. Cambios a estos términos', body: <p>Podemos actualizar estos términos para reflejar cambios legales, técnicos o del servicio. Publicaremos la versión vigente en esta página e indicaremos su fecha de actualización. Si el cambio requiere una nueva aceptación, la solicitaremos antes de continuar usando la función correspondiente.</p>,
  },
  {
    id: 'ley', title: '14. Ley aplicable', body: <p>Estos términos se interpretan conforme a las leyes de la República de Colombia, sin afectar las normas obligatorias de protección al consumidor que resulten aplicables.</p>,
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <SEO title="Términos del servicio | NEGU" description="Términos para el uso de NEGU, plataforma de catálogos digitales y gestión de pedidos para comercios." canonical="https://negu.pro/terminos" />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" aria-label="Inicio NEGU"><SaaSLogo className="h-8" /></Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft size={16} /> Inicio</Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">Información legal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Términos del servicio</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Estos términos describen el uso de NEGU por parte de comercios y usuarios. Léelos antes de crear una cuenta.</p>
          <a className="mt-3 inline-flex text-sm font-semibold text-sky-800 underline underline-offset-2" href="https://sedeelectronica.sic.gov.co/temas/proteccion-al-consumidor" target="_blank" rel="noreferrer">Consulta tus derechos como consumidor ante la SIC</a>
          <p className="mt-4 text-xs text-slate-500">Vigentes desde el 20 de octubre de 2026 · Versión 1.0</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
          <nav aria-label="Contenido de los términos" className="h-fit rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-6">
            <h2 className="mb-3 text-sm font-bold text-slate-900">Contenido</h2>
            <ol className="space-y-2 text-xs leading-5 text-slate-600">
              {sections.map(section => <li key={section.id}><a className="hover:text-sky-700" href={`#${section.id}`}>{section.title}</a></li>)}
              <li><a className="hover:text-sky-700" href="#contacto">15. Contacto</a></li>
            </ol>
          </nav>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
            <div className="space-y-7">
              {sections.map(section => <section key={section.id} id={section.id} className="scroll-mt-6 border-b border-slate-100 pb-6 last:border-0"><h2 className="text-lg font-bold text-slate-950">{section.title}</h2><div className="mt-2 space-y-3 text-sm leading-6 text-slate-600">{section.body}</div></section>)}
              <section id="contacto" className="scroll-mt-6">
                <h2 className="text-lg font-bold text-slate-950">15. Contacto</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Para consultas relacionadas con estos términos o con tu cuenta, utiliza los siguientes canales:</p>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <a className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sky-800 sm:col-span-2" href="https://wa.me/573143243707"><Phone size={16} /> WhatsApp: +57 314 324 3707</a>
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-500">Creador y responsable de NEGU: Josue Sepulveda. No publicamos documentos personales. El correo empresarial, NIT y dirección para notificaciones se actualizarán cuando estén formalizados.</p>
              </section>
            </div>
          </article>
        </div>
        <footer className="flex flex-wrap justify-center gap-x-5 gap-y-2 py-7 text-xs text-slate-500"><Link className="hover:text-sky-800" to="/">negu.pro</Link><Link className="hover:text-sky-800" to="/privacidad">Privacidad</Link><Link className="hover:text-sky-800" to="/cookies">Cookies</Link><span>© {new Date().getFullYear()} NEGU</span></footer>
      </div>
    </main>
  );
}

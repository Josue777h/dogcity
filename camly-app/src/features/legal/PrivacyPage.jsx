import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, ShieldCheck } from 'lucide-react';
import SEO from '../../components/common/SEO';
import SaaSLogo from '../../components/common/SaaSLogo';

const contact = 'https://wa.me/573143243707';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <SEO title="Privacidad y datos personales | NEGU" description="Cómo NEGU y los comercios que usan la plataforma tratan los datos de cuentas y pedidos." canonical="https://negu.pro/privacidad" />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" aria-label="Inicio NEGU"><SaaSLogo className="h-8" /></Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft size={16} /> Inicio</Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-sky-700"><ShieldCheck size={16} /> Privacidad</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Política de tratamiento de datos personales</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Vigente desde el 20 de octubre de 2026 · Versión 1.0. Explica qué datos se usan al crear una cuenta, visitar un catálogo o gestionar un pedido.</p>
        </div>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <div className="space-y-7 text-sm leading-6 text-slate-600">
            <section><h2 className="text-lg font-bold text-slate-950">1. Responsable y roles</h2><p className="mt-2">NEGU es una plataforma de catálogos y gestión de pedidos creada por Josue Sepulveda. Para los datos de cuenta, soporte, seguridad y funcionamiento de NEGU, el responsable de la plataforma es su titular. En los datos que un cliente entrega para realizar un pedido, el comercio que publica el catálogo decide para qué los utiliza; ese comercio actúa como responsable y NEGU los procesa para alojar y transmitir el pedido bajo las instrucciones de la tienda.</p><p className="mt-2">El comercio debe informar sus propios datos de identificación y contacto, tener su política de tratamiento y atender las solicitudes relacionadas con los pedidos. NEGU podrá suministrar los datos de identificación del oferente a una autoridad competente y, cuando la ley lo permita o exija, a una persona que haya comprado para tramitar una reclamación.</p></section>
            <section><h2 className="text-lg font-bold text-slate-950">2. Datos que podemos tratar</h2><ul className="mt-2 list-disc space-y-1 pl-5"><li>Cuenta del comercio: correo electrónico, nombre del negocio, teléfono y credenciales administradas por el proveedor de autenticación.</li><li>Catálogo y operación: productos, precios, fotos, dirección, horarios, configuración de entregas y medios de pago.</li><li>Pedido: nombre, teléfono, productos, notas, dirección y, si el cliente lo habilita, ubicación aproximada o enlace de mapa. El comercio puede recibir estos datos para atender el pedido.</li><li>Soporte y seguridad: mensajes que nos envíes, información básica del dispositivo y registros técnicos necesarios para prevenir fallos o abusos.</li></ul><p className="mt-2">No incluyas diagnósticos, fórmulas, datos de salud ni otra información sensible en las notas de un pedido. Si administras una farmacia, evita solicitar al comprador información clínica que no sea indispensable para cumplir una obligación legal.</p></section>
            <section><h2 className="text-lg font-bold text-slate-950">3. Finalidades</h2><p className="mt-2">Usamos la información para crear y proteger cuentas, publicar catálogos, recibir y organizar pedidos, permitir seguimiento, calcular entregas cuando se solicita, atender soporte, mantener la plataforma, cumplir obligaciones legales y responder a solicitudes de titulares o autoridades. No vendemos bases de datos personales ni usamos la información de pedidos para publicidad dirigida.</p></section>
            <section><h2 className="text-lg font-bold text-slate-950">4. Proveedores y transferencias</h2><p className="mt-2">NEGU utiliza Supabase para autenticación, base de datos y almacenamiento; servicios de mapas y geocodificación para mostrar mapas o convertir coordenadas en direcciones; Google Fonts para tipografías; y WhatsApp cuando el usuario decide abrir un enlace para comunicarse. Esos proveedores pueden procesar datos técnicos desde infraestructura fuera de Colombia y tienen sus propios términos y políticas. La ubicación solo se solicita cuando la persona activa una función de ubicación.</p></section>
            <section><h2 className="text-lg font-bold text-slate-950">5. Autorización y elección</h2><p className="mt-2">Al crear una cuenta se solicita aceptar la política antes de enviar el formulario y guardamos fecha y versión de esa aceptación junto con los metadatos de la cuenta. Para la ubicación, el navegador pide permiso. El usuario puede no concederlo y usar las alternativas disponibles, como escribir una dirección, si el flujo lo permite. El comercio es responsable de obtener la autorización necesaria para tratar los datos de sus compradores.</p></section>
            <section><h2 className="text-lg font-bold text-slate-950">6. Conservación y seguridad</h2><p className="mt-2">Conservamos los datos mientras sean necesarios para prestar el servicio, atender pedidos, mantener la seguridad y cumplir deberes legales. Las solicitudes de cierre o supresión se evalúan según obligaciones de conservación y necesidades legítimas de operación. Aplicamos controles técnicos y de acceso razonables; ningún servicio conectado a internet puede garantizar riesgo cero.</p></section>
            <section><h2 className="text-lg font-bold text-slate-950">7. Derechos de las personas</h2><p className="mt-2">Puedes solicitar acceso, corrección o actualización de tus datos, pedir prueba de autorización, conocer el uso dado a la información, presentar una reclamación y, cuando proceda, solicitar supresión o revocar la autorización. Para datos de un pedido, comienza contactando al comercio que lo recibió. Si se trata de tu cuenta NEGU o de una solicitud dirigida al titular de la plataforma, escríbenos por WhatsApp. Tramitaremos la solicitud según los plazos y procedimientos de la ley colombiana.</p></section>
            <section><h2 className="text-lg font-bold text-slate-950">8. Contacto y cambios</h2><p className="mt-2">Creador y responsable de NEGU: Josue Sepulveda. Canal de contacto: <a className="font-semibold text-sky-800 underline underline-offset-2" href={contact}>WhatsApp +57 314 324 3707</a>. La política podrá actualizarse para reflejar cambios del servicio o legales; publicaremos aquí la fecha y versión vigentes.</p><p className="mt-2">El correo empresarial, NIT y dirección para notificaciones están pendientes de formalización y se incorporarán a esta política cuando estén disponibles. No publicamos el documento de identidad personal.</p></section>
          </div>
        </article>
        <footer className="flex flex-wrap justify-center gap-x-5 gap-y-2 py-7 text-xs text-slate-500"><Link className="hover:text-sky-800" to="/terminos">Términos</Link><Link className="hover:text-sky-800" to="/cookies">Cookies y almacenamiento</Link><a className="inline-flex items-center gap-1 hover:text-sky-800" href={contact}><Phone size={13} /> Contacto</a></footer>
      </div>
    </main>
  );
}

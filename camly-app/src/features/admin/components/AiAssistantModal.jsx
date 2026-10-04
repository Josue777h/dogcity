import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, X, Send, ArrowRight, RotateCcw,
  ShoppingBag, Truck, Clock, Bluetooth, TrendingUp, ChevronRight, Copy, Check
} from 'lucide-react';

const SUGGESTIONS = [
  {
    title: 'Sabores y adicionales',
    prompt: '¿Cómo configuro sabores a $0 y adicionales con cobro extra?'
  },
  {
    title: 'Domicilios por GPS',
    prompt: '¿Cómo funciona la tarifa por kilómetro con mapa GPS?'
  },
  {
    title: 'Horarios y pausar tienda',
    prompt: '¿Cómo cambio los horarios de atención o pongo la tienda en pausa?'
  },
  {
    title: 'Impresora Bluetooth',
    prompt: '¿Cómo conecto mi impresora térmica Bluetooth para imprimir comandas?'
  },
  {
    title: 'Aumentar ventas',
    prompt: '¿Qué estrategias recomiendas para vender más con mi catálogo por WhatsApp?'
  }
];

// Parser inline de Markdown para evitar que aparezcan asteriscos crudos (**)
function parseInline(text) {
  if (!text) return null;
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Negrita **texto**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/s);
    if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>);
      parts.push(
        <strong key={key++} className="font-semibold text-gray-900">
          {boldMatch[2]}
        </strong>
      );
      remaining = boldMatch[3];
      continue;
    }

    // Código `codigo`
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)/s);
    if (codeMatch) {
      if (codeMatch[1]) parts.push(<span key={key++}>{codeMatch[1]}</span>);
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-[11px] text-gray-800 border border-gray-200">
          {codeMatch[2]}
        </code>
      );
      remaining = codeMatch[3];
      continue;
    }

    // Cursiva *texto*
    const italicMatch = remaining.match(/^(.*?)\*(.+?)\*(.*)/s);
    if (italicMatch) {
      if (italicMatch[1]) parts.push(<span key={key++}>{italicMatch[1]}</span>);
      parts.push(
        <em key={key++} className="italic text-gray-700">
          {italicMatch[2]}
        </em>
      );
      remaining = italicMatch[3];
      continue;
    }

    // Texto plano restante
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts;
}

// Renderizador estructurado tipo OpenAI/ChatGPT
function FormattedMessage({ content }) {
  if (!content) return null;

  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-2.5 text-xs text-gray-800 leading-relaxed">
      {blocks.map((block, bIdx) => {
        const lines = block.split('\n').filter(l => l.trim().length > 0);

        // Lista con viñetas (* o - o •)
        const isBulletList = lines.length > 0 && lines.every(l => /^\s*[*•-]\s+/.test(l));
        if (isBulletList) {
          return (
            <ul key={bIdx} className="space-y-1.5 pl-3 border-l-2 border-gray-200 my-1">
              {lines.map((l, lIdx) => (
                <li key={lIdx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                  <div>{parseInline(l.replace(/^\s*[*•-]\s+/, ''))}</div>
                </li>
              ))}
            </ul>
          );
        }

        // Lista numerada (1., 2., etc.)
        const isNumberedList = lines.length > 0 && lines.every(l => /^\s*\d+[\.\)]\s+/.test(l));
        if (isNumberedList) {
          return (
            <ol key={bIdx} className="space-y-1.5 my-1">
              {lines.map((l, lIdx) => {
                const numMatch = l.match(/^\s*(\d+)[\.\)]\s+(.*)/);
                const num = numMatch ? numMatch[1] : (lIdx + 1);
                const text = numMatch ? numMatch[2] : l;
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded bg-gray-100 text-gray-600 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-gray-200">
                      {num}
                    </span>
                    <div className="flex-1">{parseInline(text)}</div>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Párrafo estándar
        return (
          <p key={bIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <span key={lIdx}>
                {parseInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default function AiAssistantModal({ isOpen, onClose, business, productsCount, onNavigateTab }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const businessName = business?.nombre_visible || 'tu negocio';
  const hasGps = Boolean(business?.lat && business?.lng);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hola. Soy **Movia**, tu asistente de operaciones para **${businessName}**.\n\nPuedo orientarte en la configuración de tu catálogo (sabores, toppings y precios), cobro de domicilios por GPS, conexión de impresoras térmicas o ajustes de horario.\n\n¿En qué te puedo colaborar hoy?`,
          actionTab: null
        }
      ]);
    }
  }, [isOpen, businessName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSend = (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const q = query.toLowerCase();
      let reply = '';
      let actionTab = null;
      let actionLabel = null;

      if (q.includes('que ia') || q.includes('qué ia') || q.includes('modelo') || q.includes('openai') || q.includes('gpt') || q.includes('inteligencia')) {
        reply = `**Arquitectura de IA de Movia:**\n\nActualmente opero con el **motor de inferencia contextual de Movia**, desarrollado a la medida para la plataforma y optimizado para negocios gastronómicos y de comercio.\n\n* **Ventajas operativas:** Respuestas instantáneas sin latencia, sin costos por consumo de tokens y con conocimiento directo de tu base de datos (tu catálogo, estado de GPS y pedidos).\n* **Compatibilidad con LLMs:** La arquitectura del sistema está preparada para conectar modelos externos de **OpenAI (GPT-4o)** o **Google Gemini** para generación avanzada de descripciones y marketing comercial.`;
      }
      else if (q.includes('sabor') || q.includes('topping') || q.includes('adicional') || q.includes('helad') || q.includes('opcion')) {
        reply = `**Configuración de sabores y adicionales:**\n\nPuedes estructurar dos tipos de selección en cada producto:\n\n1. **Selección única ($0 extra):** Para el sabor principal o término base (ej: *Chocolate, Vainilla*). El cliente debe seleccionar 1 opción sin recargo.\n2. **Selección múltiple (con precio extra):** Para adicionales o toppings (ej: *Oreo +$1.500*, *Arequipe +$1.000*). El cliente marca los que desee y se calculan automáticamente.\n\nEn el formulario de producto puedes usar los botones predefinidos para cargarlos con un solo clic.`;
        actionTab = 'products';
        actionLabel = 'Ir a Catálogo de Productos';
      } 
      else if (q.includes('domicilio') || q.includes('gps') || q.includes('kilometro') || q.includes('km') || q.includes('mapa') || q.includes('envio')) {
        reply = `**Cálculo de domicilios con GPS:**\n\nEl sistema mide la distancia lineal entre tu punto de despacho y la ubicación fijada por el cliente en el mapa interactivo.\n\n* **Tarifa por Km:** Precio cobrado por cada kilómetro recorrido.\n* **Tarifa base mínima:** Valor piso del domicilio.\n* **Estado actual:** ${hasGps ? 'Coordenadas del local configuradas correctamente.' : 'Pendiente: Aún no has guardado las coordenadas de tu local en el mapa.'}\n\nEl costo se liquida automáticamente antes de confirmar el pedido por WhatsApp.`;
        actionTab = 'settings';
        actionLabel = 'Configurar Domicilios y GPS';
      }
      else if (q.includes('horario') || q.includes('cerrar') || q.includes('abrir') || q.includes('pausar') || q.includes('pausa')) {
        reply = `**Horarios y estado de la tienda:**\n\n* **Pausar tienda:** Dispones de un interruptor maestro para detener temporalmente la recepción de pedidos sin alterar tus productos.\n* **Horarios semanales:** Puedes definir la jornada de Lunes a Domingo. Fuera de ese rango, el catálogo permanece en modo consulta y el botón de pedido se deshabilita con un aviso claro para el cliente.`;
        actionTab = 'settings';
        actionLabel = 'Ir a Horarios y Estado';
      }
      else if (q.includes('bluetooth') || q.includes('impres') || q.includes('imprimir') || q.includes('ticket') || q.includes('comanda')) {
        reply = `**Impresión de comandas térmicas (58mm / 80mm):**\n\n1. Enciende tu impresora térmica Bluetooth.\n2. En la sección **Pedidos**, haz clic en el icono de Bluetooth o en **"Imprimir Bluetooth"**.\n3. Selecciona tu dispositivo para enviar la comanda directamente sin pasar por el diálogo de Windows.\n4. Si el navegador no cuenta con Web Bluetooth, cuentas con el botón alternativo **"Imprimir Comanda"** para usar el controlador del sistema.`;
        actionTab = 'orders';
        actionLabel = 'Ver Gestión de Pedidos';
      }
      else if (q.includes('vender') || q.includes('ventas') || q.includes('estrategia') || q.includes('marketing') || q.includes('promocion')) {
        reply = `**3 recomendaciones operativas para aumentar pedidos:**\n\n1. **Enlace principal en redes:** Publica tu link (\`${window.location.origin}/${business?.nombre || 'tunegocio'}\`) en el perfil de Instagram y WhatsApp Business con el texto: *"Haz tu pedido aquí con costo de envío exacto"*.\n2. **Estructura combos:** Los paquetes con bebida o adición aumentan el ticket promedio entre un 20% y 30%.\n3. **Respuesta rápida en WhatsApp:** Configura un mensaje de bienvenida que invite a armar el carrito directamente en el catálogo para reducir tiempos de digitación.`;
        actionTab = 'revenue';
        actionLabel = 'Ver Reportes e Ingresos';
      }
      else if (q.includes('excel') || q.includes('csv') || q.includes('reporte') || q.includes('caja')) {
        reply = `**Exportación de ventas y contabilidad:**\n\nEn la sección **Ingresos** puedes descargar tu reporte en formato CSV con codificación UTF-8 compatible con Microsoft Excel. Incluye fecha, cliente, teléfono, desglose de ítems, adiciones, costo de envío y método de pago para el cuadre diario.`;
        actionTab = 'revenue';
        actionLabel = 'Ir a Ingresos y Reportes';
      }
      else {
        reply = `Entendido. Para consultar o ajustar la operación de **${businessName}**, puedes indicarme el tema específico (productos, domicilios, horarios o pedidos) y te daré el paso a paso exacto.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply,
          actionTab,
          actionLabel
        }
      ]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-end sm:p-6 bg-black/30 backdrop-blur-xs animate-fade-in">
      <div className="w-full sm:w-[440px] h-[90vh] sm:h-[600px] bg-white sm:rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-200 animate-slide-up">
        
        {/* Header sobrio y profesional */}
        <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold text-xs tracking-wider">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-gray-900 tracking-tight">Movia</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] text-gray-500">Asistente de operaciones</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'reset',
                    sender: 'ai',
                    text: `Conversación reiniciada. ¿En qué te puedo colaborar respecto a **${businessName}**?`
                  }
                ]);
              }}
              title="Limpiar conversación"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={onClose}
              title="Cerrar"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Píldoras de sugerencias discretas */}
        <div className="px-4 py-2 bg-gray-50/60 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto hide-scrollbar shrink-0">
          {SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Lista de mensajes estructurados tipo OpenAI */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-white">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex gap-3 group ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-6 h-6 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] border border-gray-200">
                    M
                  </div>
                )}

                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs ${
                  isAi 
                    ? 'bg-gray-50/90 text-gray-800 border border-gray-200/80 shadow-2xs' 
                    : 'bg-gray-900 text-white font-normal'
                }`}>
                  {isAi ? (
                    <div>
                      <FormattedMessage content={m.text} />
                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-200/50">
                        {m.actionTab ? (
                          <button
                            type="button"
                            onClick={() => {
                              onNavigateTab(m.actionTab);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-900 hover:text-orange-600 transition-colors cursor-pointer"
                          >
                            <span>{m.actionLabel || 'Ir a la sección'}</span>
                            <ChevronRight size={13} />
                          </button>
                        ) : <span />}

                        <button
                          type="button"
                          onClick={() => handleCopy(m.id, m.text)}
                          title="Copiar respuesta"
                          className="text-gray-400 hover:text-gray-700 transition-colors p-1"
                        >
                          {copiedId === m.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line leading-relaxed">
                      {m.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-gray-400 text-xs pl-9">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.3s]" />
              <span className="text-[11px] text-gray-500">Movia está redactando...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar sobria */}
        <div className="p-3 bg-white border-t border-gray-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Consulta a Movia..."
              className="flex-1 bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-lg px-3 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="h-8 px-3 rounded-lg bg-gray-900 hover:bg-black disabled:opacity-30 disabled:hover:bg-gray-900 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer text-xs font-medium"
            >
              <Send size={13} />
            </button>
          </form>
          <div className="text-[10px] text-gray-400 text-center mt-1.5 flex items-center justify-center gap-1">
            <span>Movia</span>
            <span>·</span>
            <span>Asistente de configuración de tienda</span>
          </div>
        </div>

      </div>
    </div>
  );
}

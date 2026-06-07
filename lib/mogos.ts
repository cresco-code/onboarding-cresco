/**
 * Contenido de la experiencia de onboarding del proyecto mogos-group.
 *
 * Es contenido estructural (no prosa de Notion): el sistema (apps), la
 * arquitectura (stack) y el primer arranque. Se autorea aquí, muy visual,
 * y los tres "lentes" lo renderizan. Verificado contra el repo real.
 */

import type { AppNode, DataChapter, Layer, ProjectData, Tech } from './project';

export const REPO = 'https://github.com/Mogos-Group/mogos-group/tree/main';
export const repoUrl = (path: string) => (path ? `${REPO}/${path}` : `${REPO.replace('/tree/main', '')}`);

/** Qué es mogos — la portada. Para saber dónde estamos parados antes del mapa. */
export const MOGOS = {
  kick: 'el proyecto',
  title: 'mogos group',
  tag: 'Empresa venezolana · logística puerta a puerta · China y EE.UU. → Venezuela',
  ess: 'Es una **empresa venezolana de logística**: lleva carga **puerta a puerta** desde **China y Estados Unidos hasta Venezuela** — y está **expandiéndose a más países de Latinoamérica**. Consolida la mercancía en sus **almacenes de origen** y la mueve por mar o aire hasta la dirección final del cliente. El cliente **crea su cotización desde su perfil en la plataforma** (web o móvil), paga y **sigue su paquete en vivo**; WhatsApp lo acompaña con avisos y pagos, y el equipo lo opera de punta a punta. Y **crescō le lleva la tecnología** — todo lo que ves aquí.',
  flowLabel: 'el recorrido de un paquete',
  /** el recorrido de un paquete, de punta a punta */
  flow: [
    { emoji: '🧮', label: 'cotiza', sub: 'El cliente la crea desde su perfil en la plataforma cliente.' },
    { emoji: '💳', label: 'paga', sub: 'En línea: Stripe, PayPal, Binance o Zelle — incluso dentro de WhatsApp.' },
    { emoji: '📦', label: 'consolida', sub: 'Los almacenes de origen reciben y agrupan la carga.' },
    { emoji: '✈️', label: 'viaja', sub: 'Tránsito hasta Venezuela, por mar o aire.' },
    { emoji: '🚚', label: 'entrega', sub: 'El transportista la lleva con ruta en vivo.' },
  ] as { emoji: string; label: string; sub: string }[],
  /** quiénes lo usan */
  who: [
    { emoji: '🧍', name: 'cliente final', what: 'Cotiza, paga y sigue su carga (web + móvil).' },
    { emoji: '⚙️', name: 'equipo de ops', what: 'Opera todo desde el admin.' },
    { emoji: '📦', name: 'bodega', what: 'Recibe y consolida en el almacén de origen.' },
    { emoji: '🚚', name: 'transportista', what: 'Entrega con mapa en vivo (móvil).' },
  ] as { emoji: string; name: string; what: string }[],
  role: 'El sistema que ves aquí — las 7 apps, el backbone y las integraciones — es lo que hace que ese recorrido funcione.',
};

/** El sistema: las 7 apps del monorepo, conectadas al api. */
export const APPS: AppNode[] = [
  {
    id: 'api', emoji: '⊞', name: 'api', sub: 'nest · supabase', hub: true, pos: [50, 50],
    ess: 'El **backbone** de mogos. Toda la lógica de negocio y los datos pasan por aquí.',
    qhace: 'NestJS sobre Supabase/Postgres. Expone los endpoints que consumen todos los apps: envíos, cotizaciones, clientes, pagos y el sistema de WhatsApp. Si algo "es la verdad", vive aquí.',
    conn: ['supabase', 'whatsapp', '← todos los apps'],
    files: [['apps/api/src/modules', 'Un módulo por dominio (envíos, quotes, clientes).'], ['apps/api/prisma/schema.prisma', 'El modelo de datos — léelo primero.'], ['apps/api/src/whatsapp', 'Templates + flows de WhatsApp.']],
    run: 'npm run dev', repo: 'apps/api',
  },
  {
    id: 'client', emoji: '🖥️', name: 'client', sub: 'next · web', pos: [50, 13],
    ess: 'La **cara de mogos** para el cliente final: cotizar, seguir la carga y pagar.',
    qhace: 'App público (Next.js). Crea envíos, ve el estado en tiempo real del origen a Venezuela, revisa cotizaciones e inicia pagos. Consume el api, comparte packages/ui. No tiene lógica propia.',
    conn: ['→ api', '→ payments-portal', '⋯ Supabase Realtime'],
    files: [['apps/client/app', 'Rutas (App Router) — empieza por "nuevo envío".'], ['apps/client/lib/api', 'El cliente del api.'], ['apps/client/hooks', 'Seguimiento en vivo (Realtime).']],
    run: 'npm run dev', repo: 'apps/client',
  },
  {
    id: 'admin', emoji: '⚙️', name: 'admin', sub: 'next · ops', pos: [16, 29],
    ess: 'El **panel interno**: el equipo de mogos opera todo desde aquí.',
    qhace: 'Next.js para operaciones: gestionar envíos, aprobar cotizaciones, clientes, proveedores y mandar mensajes de WhatsApp. El día a día de David y Andy.',
    conn: ['→ api', '→ whatsapp (vía api)', 'packages/ui'],
    files: [['apps/admin/app', 'Las vistas de operación.'], ['apps/admin/lib/api', 'El cliente del api.']],
    run: 'npm run dev', repo: 'apps/admin',
  },
  {
    id: 'almacen', emoji: '📦', name: 'almacén', sub: 'inventario', pos: [84, 29],
    ess: 'La **bodega**: recibe, consolida y despacha la carga.',
    qhace: 'App de inventario y operación física. Registra lo que llega al almacén de origen (China o EE.UU.), lo consolida y lo prepara para el envío puerta a puerta. Mantiene el estado físico que el cliente ve.',
    conn: ['→ api', 'escáner / etiquetas'],
    files: [['apps/almacen/app', 'Recepción y despacho.'], ['apps/almacen/lib', 'Lógica de consolidación.']],
    run: 'npm run dev', repo: 'apps/almacen',
  },
  {
    id: 'agent', emoji: '🤖', name: 'agent', sub: 'ai', pos: [16, 77],
    ess: 'El **cerebro AI**: procesa mensajes y conocimiento del negocio.',
    qhace: 'El agente de mogos. Lee mensajes (WhatsApp/Lark), entiende intención y ayuda al equipo a responder, apoyado en packages/ai-knowledge como su "company brain".',
    conn: ['→ api', '↔ whatsapp', 'packages/ai-knowledge'],
    files: [['apps/agent/src', 'El loop del agente.'], ['packages/ai-knowledge', 'El conocimiento.']],
    run: 'npm run dev', repo: 'apps/agent',
  },
  {
    id: 'payments-portal', emoji: '💳', name: 'payments-portal', sub: 'pagos', pos: [84, 77],
    ess: 'El **portal de pago**: Stripe, PayPal, Binance, Zelle — incluso dentro de WhatsApp.',
    qhace: 'Recibe un token (JWT) de una cotización y cobra. Cuatro métodos de pago, pagos parciales, y se abre dentro del webview de WhatsApp para que el cliente pague sin salir del chat.',
    conn: ['← client / whatsapp', '→ api · token', '→ pagos'],
    files: [['apps/payments-portal/app/pay', 'La pantalla de pago (token).'], ['apps/payments-portal/components/payment', 'Selector de método/monto.']],
    run: 'npm run dev', repo: 'apps/payments-portal',
  },
  {
    id: 'mobile-client', emoji: '📱', name: 'mobile-client', sub: 'expo · rn', pos: [50, 89],
    ess: 'La **app móvil**: clientes y transportistas, con mapa en vivo.',
    qhace: 'React Native (Expo). Para el cliente en el teléfono y para el transportista (ruta con Google Maps). Comparte packages/mobile-ui. La vertical que más crece.',
    conn: ['→ api', '→ google maps', 'packages/mobile-ui'],
    files: [['apps/mobile-client/app', 'Pantallas (expo router).'], ['packages/mobile-ui', 'Componentes móviles.']],
    run: 'npx expo start', repo: 'apps/mobile-client',
  },
];

/** La arquitectura: el stack por capas. */
export const LAYERS: Layer[] = [
  { id: 'Experiencia', k: 'lo que el usuario toca', items: ['next', 'rq', 'expo', 'ui'] },
  { id: 'API', k: 'la lógica · el backbone', items: ['nest', 'prisma', 'zod'], bone: true },
  { id: 'Datos', k: 'la verdad', items: ['supa'] },
  { id: 'Plataforma', k: 'el cimiento', items: ['turbo', 'eas', 'posthog'] },
];
export const INTEG = ['wa', 'pay', 'maps', 'mail'];
export const TECH: Record<string, Tech> = {
  next: { id: 'next', emoji: '▲', name: 'Next.js', layer: 'Experiencia', tag: 'web', ess: 'El framework web (React, App Router) de los 4 apps web.', why: 'Los 4 apps web (client, admin, almacén, payments-portal) son Next.js. SSR con @supabase/ssr.', where: 'apps/client', repo: 'apps/client' },
  rq: { id: 'rq', emoji: '◵', name: 'TanStack Query', layer: 'Experiencia', tag: 'datos', ess: 'Fetching y caché de datos contra el api.', why: 'Cada app web pide datos al api con React Query — caché y estados sin reinventar.', where: 'lib/api', repo: 'apps/client' },
  expo: { id: 'expo', emoji: '📱', name: 'Expo · React Native', layer: 'Experiencia', tag: 'móvil', ess: 'El app móvil — clientes y transportistas.', why: 'El app mobile-client es React Native con Expo Router; rutas con Google Maps; se buildea con EAS.', where: 'apps/mobile-client', repo: 'apps/mobile-client' },
  ui: { id: 'ui', emoji: '🧩', name: 'packages/ui', layer: 'Experiencia', tag: 'design system', ess: 'Los componentes compartidos entre apps.', why: 'Un solo sistema de UI para no repetir botones/tablas/formularios.', where: 'packages/ui', repo: 'packages/ui' },
  nest: { id: 'nest', emoji: '⊞', name: 'NestJS', layer: 'API', tag: 'backbone', ess: 'El backbone: la API modular donde vive la lógica.', why: 'Un módulo por dominio. JWT + Passport (auth), Swagger (/docs), Throttler, Schedule (crons).', where: 'apps/api/src/modules', repo: 'apps/api' },
  prisma: { id: 'prisma', emoji: '◧', name: 'Prisma', layer: 'API', tag: 'orm', ess: 'El ORM sobre Postgres — el schema es la verdad del modelo.', why: 'Define tablas y relaciones en un archivo. Léelo antes que nada.', where: 'apps/api/prisma/schema.prisma', repo: 'apps/api' },
  zod: { id: 'zod', emoji: '✓', name: 'Zod', layer: 'API', tag: 'validación', ess: 'Valida entradas y salidas (DTOs, payloads de WhatsApp).', why: 'Cada cosa que entra se valida con un schema Zod.', where: 'apps/api/src', repo: 'apps/api' },
  supa: { id: 'supa', emoji: '🗄️', name: 'Supabase', layer: 'Datos', tag: 'postgres · auth · realtime', ess: 'La base de datos, el auth y el tiempo real.', why: 'Postgres + Auth (@supabase/ssr) + Realtime (seguimiento en vivo) + Storage.', where: 'supabase/', repo: 'supabase' },
  wa: { id: 'wa', emoji: '💬', name: 'WhatsApp Cloud API', layer: 'Integraciones', tag: 'canal', ess: 'El canal principal con el cliente.', why: 'Templates, flows y webview de pago — el cliente recibe avisos y paga sin salir de WhatsApp.', where: 'apps/api/src/whatsapp', repo: 'apps/api' },
  pay: { id: 'pay', emoji: '💳', name: 'Pagos', layer: 'Integraciones', tag: 'stripe · paypal · binance · zelle', ess: 'Cuatro métodos de pago, con tokens JWT.', why: 'El módulo payment-gateway genera el token; payments-portal cobra.', where: 'apps/api/src/payment-gateway', repo: 'apps/payments-portal' },
  maps: { id: 'maps', emoji: '🗺️', name: 'Google Maps', layer: 'Integraciones', tag: 'rutas', ess: 'Las rutas del transportista en el móvil.', why: 'El app del transportista usa Google Maps para la navegación.', where: 'apps/mobile-client', repo: 'apps/mobile-client' },
  mail: { id: 'mail', emoji: '✉️', name: 'Postmark', layer: 'Integraciones', tag: 'email', ess: 'Los correos transaccionales.', why: 'Verificación, bienvenida, avisos de pago — vía Postmark desde el api.', where: 'apps/api/src/email', repo: 'apps/api' },
  turbo: { id: 'turbo', emoji: '⚡', name: 'Turborepo', layer: 'Plataforma', tag: 'monorepo', ess: 'El monorepo: orquesta builds y dev de apps + packages.', why: 'Combina npm workspaces + Turbo. El turbo.json define las tareas; dev de todo a la vez.', where: 'turbo.json', repo: '' },
  eas: { id: 'eas', emoji: '🚀', name: 'EAS', layer: 'Plataforma', tag: 'expo build', ess: 'Builds y releases del app móvil.', why: 'Expo Application Services compila y publica mobile-client.', where: 'eas.json', repo: '' },
  posthog: { id: 'posthog', emoji: '📊', name: 'PostHog', layer: 'Plataforma', tag: 'observabilidad', ess: 'Analítica y observabilidad de producto.', why: 'Eventos y métricas; packages/observability centraliza la instrumentación.', where: 'packages/observability', repo: 'packages/observability' },
};

/** Primer arranque: requisitos, env (1Password), scripts, docs. */
export const SCRIPTS: [string, string][] = [
  ['npm run dev', 'Entorno **dev** + turbo dev. El del día a día.'],
  ['npm run staging', 'Entorno **staging** + turbo dev. Probar contra datos de staging.'],
  ['npm run prod', 'Entorno **prod** + turbo dev. **Con cuidado** — apunta a producción.'],
  ['npm run build', 'Turbo build — compila todos los apps.'],
  ['npm run lint · format', 'Turbo lint · Prettier en todo el repo.'],
  ['npm run e2e', 'Playwright (e2e:admin, e2e:seed para sembrar usuarios).'],
];
export const DOCS: { emoji: string; name: string; path: string }[] = [
  { emoji: '📖', name: 'README', path: 'README.md' },
  { emoji: '🤖', name: 'CLAUDE · AGENTS', path: 'AGENTS.md' },
  { emoji: '⊞', name: 'API patterns', path: 'API_PATTERNS.md' },
  { emoji: '💄', name: 'Frontend commandments', path: 'FRONTEND_COMMANDMENTS.md' },
  { emoji: '⚡', name: 'Realtime quickstart', path: 'REALTIME_QUICKSTART.md' },
  { emoji: '🗺️', name: 'Google Maps setup', path: 'docs/google-maps-api-setup.md' },
  { emoji: '📤', name: 'S3 file upload', path: 'docs/S3_FILE_UPLOAD.md' },
  { emoji: '📁', name: 'docs/ · todo', path: 'docs' },
];

/**
 * Los datos: un recorrido narrativo por el schema de Prisma, por capítulos.
 * Anclado a apps/api/prisma/schema.prisma (verificado). Nombres de modelo en
 * PascalCase y tablas en @@map tal cual están en el repo.
 */
export const SCHEMA_FILE = 'apps/api/prisma/schema.prisma';
export const DATA: DataChapter[] = [
  {
    id: 'geo', n: '01', title: 'La geografía', kicker: 'dónde existe mogos',
    lead: 'Antes de mover nada, mogos define **dónde** opera. Y todo cuelga de una ruta: el corredor. Es la espina — cada envío, cotización y salida sabe a qué corredor pertenece.',
    models: [
      { emoji: '🛫', name: 'Corridor', table: 'corridors', one: 'La ruta. Une un país origen con uno destino — p. ej. China o EE.UU. → Venezuela.', fields: ['code · único', 'originCountry → destCountry', 'emoji · isActive', 'config (Json)'], links: ['→ Country (origen / destino)', '→ Warehouse (vía WarehouseCorridor)', '→ Order · Freight · Departure'], note: 'El corredor es el eje del negocio: casi todo lo que se mueve apunta a uno. Cada ruta nueva (otro país) es un corredor más.' },
      { emoji: '🌍', name: 'Country', table: 'countries', one: 'El país. Origen o destino de un corredor; fija el sistema de unidades (métrico / imperial).', fields: ['iso · único', 'unitSystem', 'active'], links: ['→ State → City', '→ Warehouse', '→ Corridor'] },
      { emoji: '📍', name: 'State · City', table: 'states · cities', one: 'La división política. Cuelgan del país y aterrizan en direcciones y almacenes.', fields: ['name', 'country / state'], links: ['→ Address', '→ Warehouse'] },
      { emoji: '🏬', name: 'Warehouse', table: 'warehouses', one: 'El almacén físico, con GPS. Atiende envíos y/o guarda mercancía.', fields: ['latitude · longitude', 'supportsShipping', 'supportsStorage', 'totalStorageCbm'], links: ['→ Country · City', '→ Freight (origen / destino)', '→ Departure', '→ StorageReservation'], note: 'Un mismo almacén puede despachar y guardar — los flags supportsShipping / supportsStorage lo deciden.' },
      { emoji: '🔗', name: 'WarehouseCorridor', table: 'warehouse_corridors', one: 'El puente: qué almacén sirve a qué corredor, con qué rol y cuánto CBM tiene asignado.', fields: ['role (ORIGIN / TRANSIT / DEST)', 'cbmAllocated', 'priority'], links: ['Warehouse ↔ Corridor'] },
    ],
  },
  {
    id: 'gente', n: '02', title: 'La gente', kicker: 'quién manda y quién recibe',
    lead: 'Una sola tabla de personas, separada por rol, y la dirección donde termina el viaje. La identidad es una sola, dentro y fuera del sistema.',
    models: [
      { emoji: '👤', name: 'User', table: 'users', one: 'Toda persona: cliente, agente, admin o manager. Un cliente tiene su agente; un agente, su cartera.', fields: ['role (CLIENT / AGENT / ADMIN / MANAGER)', 'agentId → clients', 'dni · email · phone', 'emailVerified · phoneVerified'], links: ['→ Order · Freight · Quotation', '→ Conversation · Lead', '→ RbacRole'], note: 'El id no se autogenera: viene de Supabase Auth. Una identidad para autenticación y negocio.' },
      { emoji: '🏠', name: 'Address', table: 'addresses', one: 'La puerta final. Con GPS, tipo de lugar, torre / piso / unidad y a quién entregar.', fields: ['latitude · longitude · gpsAccuracy', 'placeType', 'recipientName · recipientPhone', 'isPrimary'], links: ['→ Country · State · City', '→ User', '→ Order'] },
      { emoji: '🛡️', name: 'RbacRole', table: 'rbac_roles', one: 'Permisos finos para el admin: roles con conjuntos de permisos (recurso × acción).', fields: ['isSystem · isSuperAdmin', 'permissions[]'], links: ['→ User', '→ RbacRolePermission'] },
    ],
  },
  {
    id: 'carga', n: '03', title: 'La carga', kicker: 'el viaje de un paquete',
    lead: 'El corazón. Del origen a la puerta, cada nivel agrupa al anterior: caja → envío → contenedor → salida. Y una bitácora lo narra todo.',
    models: [
      { emoji: '📦', name: 'Order', table: 'orders', one: 'El paquete del cliente: su tracking, sus dimensiones, sus fotos al recibir, y un estado entre 17.', fields: ['trackingId · único', 'cbm · weight · boxes', 'status (17 estados)', 'shippingType (AIR / SEA)', 'isApproved · approvalStatus'], links: ['→ User · Address', '→ Freight', '→ Warehouse origen / destino', '→ Corridor'], note: 'El estado viaja: PENDING → WAREHOUSE_RECEIVED → … → IN_TRANSIT → … → READY_FOR_PICKUP → DELIVERED.' },
      { emoji: '🚚', name: 'Freight', table: 'freights', one: 'El envío: agrupa varias orders de un cliente bajo un código, listo para entrar a un contenedor.', fields: ['code · único', 'status', 'shippingType'], links: ['→ Order[]', '→ Container', '→ User', '→ Warehouse origen / destino'] },
      { emoji: '🛳️', name: 'Container', table: 'containers', one: 'El contenedor físico (marítimo o aéreo). Lleva freights y conoce su ubicación y progreso.', fields: ['code · único', 'carrier · trackingId', 'currentLocation · progress', 'shippingType (SEA / AIR)'], links: ['→ Freight[]', '→ Departure', '→ ContainerRouteStop[]'] },
      { emoji: '⚓', name: 'ContainerRouteStop', table: 'container_route_stops', one: 'Cada parada de la ruta: puerto o aeropuerto, en secuencia, con estado y rol.', fields: ['sequence (único por contenedor)', 'portName · portCode', 'status (PLANNED / REACHED / DEPARTED…)', 'planned / actual · arrival / departure'], links: ['→ Container', '→ StatusUpdate'], note: 'Container.currentLocation y progress se sincronizan desde la última parada alcanzada.' },
      { emoji: '🗓️', name: 'Departure', table: 'departures', one: 'La salida programada: un almacén origen → destino, con fecha límite de carga y fecha de zarpe.', fields: ['loadDeadline', 'departureDate · estimatedArrivalDate', 'status (OPEN…)'], links: ['→ Container[]', '→ Warehouse', '→ Corridor'] },
      { emoji: '🛰️', name: 'StatusUpdate', table: 'status_updates', one: 'La bitácora. Cada cambio de estado de cualquier entidad — y puede cascadear de un contenedor a todas sus orders.', fields: ['entityType · entityId (polimórfico)', 'status', 'cascade · regression', 'parent → children'], links: ['→ ContainerRouteStop', '→ User (createdBy)'], note: 'Una sola tabla narra la historia de todo lo que se mueve: apunta por tipo + id, no por relación fija.' },
    ],
  },
  {
    id: 'dinero', n: '04', title: 'El dinero', kicker: 'cobrar con trazabilidad',
    lead: 'Se cotiza, se intenta pagar (todo intento queda registrado), y solo lo que entra de verdad se vuelve pago y comprobante. Contabilidad a prueba de auditoría.',
    models: [
      { emoji: '🧾', name: 'Quotation', table: 'quotations', one: 'La cotización. Apunta polimórficamente a lo que cobra (un freight, un storage…), con subtotal, descuentos y saldo.', fields: ['quotationNumber · único', 'entityType · entityId', 'totalAmount · amountPaid', 'status · dueDate · currency'], links: ['→ QuotationLineItem[]', '→ Transaction[] · Payment[]'] },
      { emoji: '➕', name: 'QuotationLineItem', table: 'quotation_line_items', one: 'El desglose: cada cargo de la cotización (flete, seguro, manejo…) con cantidad y precio.', fields: ['itemType', 'quantity · unitPrice · amount', 'calculationDetails (Json)'], links: ['→ Quotation'] },
      { emoji: '💳', name: 'Transaction', table: 'payment_transactions', one: 'Cada intento de pago — con su proveedor, su respuesta cruda y su estado.', fields: ['transactionRef · único', 'provider (Stripe / PayPal / Binance / Zelle)', 'status · errorCode', 'providerResponse (Json) · ipAddress'], links: ['→ Quotation', '→ Payment (0 ó 1)'], note: 'Registra TODOS los intentos, exitosos y fallidos. El método se guarda aquí para trazabilidad contable.' },
      { emoji: '✅', name: 'Payment', table: 'payments', one: 'Solo pagos exitosos. Verificable y anulable: quién lo verificó, quién lo anuló y por qué.', fields: ['amount · currency', 'verifiedBy · verifiedAt', 'voidedBy · voidReason', 'paidAt (banco) vs createdAt (reporte)'], links: ['→ Quotation · Transaction', '→ Receipt'], note: '1:1 con una Transaction exitosa. paidAt es cuándo pasó en el banco; createdAt, cuándo se reportó en mogos.' },
      { emoji: '📄', name: 'Receipt', table: 'receipts', one: 'El comprobante oficial, con su PDF.', fields: ['receiptNumber · único', 'pdfUrl · pdfGeneratedAt'], links: ['→ Payment (1:1)'], note: 'Se crea automáticamente al crear el Payment.' },
      { emoji: '🪙', name: 'MoguiLedgerEntry', table: 'mogui_ledger_entries', one: 'El libro de recompensas "mogui" del agente: 0.05 × CBM por order acreditada.', fields: ['type (EARNED / REVERSED)', 'cbm · amount · rate', 'originatingEntry (la reversa)'], links: ['→ agent · client (User)', '→ Order · Freight'], note: 'Append-only: nunca se modifica. Una reversión es una fila nueva con monto negativo. La historia no se reescribe.' },
    ],
  },
  {
    id: 'deposito', n: '05', title: 'El depósito', kicker: 'almacenar, no solo despachar',
    lead: 'Algunos almacenes guardan carga: un depósito cobrado por CBM y por tiempo, con su propio ciclo de facturación.',
    models: [
      { emoji: '📐', name: 'StoragePricingTier', table: 'storage_pricing_tiers', one: 'La tarifa por rango de CBM: por día o mensual, con cargo de retiro.', fields: ['minCbm – maxCbm', 'billingType', 'ratePerDayPerCbm / monthlyRate', 'withdrawalFee'], links: ['→ StorageReservation'] },
      { emoji: '📋', name: 'StorageReservation', table: 'storage_reservations', one: 'La reserva del cliente en un almacén: CBM reservado vs usado, ciclo y saldo.', fields: ['reservationCode', 'reservedCbm · usedCbm', 'nextBillingDate', 'status · currentBalance'], links: ['→ User · Warehouse · PricingTier', '→ StorageEntry[]'] },
      { emoji: '📥', name: 'StorageEntry', table: 'storage_entries', one: 'Cada bulto guardado: dimensiones, fecha de entrada y tarifa congelada al entrar.', fields: ['entryCode · único', 'cbm · dimensiones', 'entryDate', 'status (STORED…)'], links: ['→ StorageReservation', '→ StorageEntryService[]'] },
      { emoji: '🔁', name: 'Modification · Withdrawal', table: 'storage_…_requests', one: 'Pedir más / menos espacio o sacar la carga — cada solicitud con su flujo de aprobación.', fields: ['requestType / requestCode', 'status', 'proRataAmount / withdrawalFee'], links: ['→ StorageReservation'] },
    ],
  },
  {
    id: 'chat', n: '06', title: 'La conversación', kicker: 'cómo entra el cliente',
    lead: 'Un hilo por canal, cada mensaje guardado, y el prospecto antes de volverse cliente. Así empieza casi todo.',
    models: [
      { emoji: '💬', name: 'Conversation', table: 'conversations', one: 'El hilo, único por canal + identidad. Humano o bot, asignable a un agente.', fields: ['channel (WHATSAPP / INSTAGRAM / TIKTOK)', 'phoneNumber · handle', 'isHuman · assignedAgent', 'lastMessageAt'], links: ['→ Message[]', '→ Lead[]', '→ User · Tag'] },
      { emoji: '✉️', name: 'Message', table: 'messages', one: 'Cada mensaje, entrante o saliente, con su tipo, su template y su estado de entrega.', fields: ['direction (IN / OUT)', 'type (TEXT / IMAGE / …)', 'templateName', 'deliveryStatus (sent / delivered / read)'], links: ['→ Conversation · User', '→ replyTo → replies'] },
      { emoji: '🎯', name: 'Lead', table: 'leads', one: 'El prospecto: de dónde vino, qué quiere mover y a qué agente se asignó — antes de ser User.', fields: ['source · status (NEW…)', 'origin · destination · packageType', 'rawData (Json)'], links: ['→ Conversation · User', '→ agente (User)'] },
      { emoji: '🏷️', name: 'Tag', table: 'tags', one: 'Etiquetas por canal para clasificar conversaciones.', fields: ['name · color', 'channel'], links: ['→ Conversation (vía ConversationTag)'] },
    ],
  },
];
/** Lo que queda fuera del recorrido — para ser honestos sobre el alcance. */
export const DATA_MORE: string[] = [
  'Notification', 'Announcement', 'Promotion · UserPromotion', 'ServiceQuote (+ líneas e historial)',
  'AIConversation', 'Tutorial · LearningSession', 'ExchangeRate', 'Catalog · ShippingLocation',
  'PaymentMethod · ChannelToken', 'DeliverySignature · SignatureToken', 'PhoneVerification',
  'Log · EntityNote · PermissionAuditLog',
];
export const DATA_TOTAL = 60;

/** El bundle que consume <ProjectExperience/>. */
export const mogosProject: ProjectData = {
  repo: REPO,
  slug: 'mogos',
  overview: MOGOS,
  apps: APPS,
  layers: LAYERS,
  integ: INTEG,
  tech: TECH,
  scripts: SCRIPTS,
  docs: DOCS,
  data: DATA,
  dataMore: DATA_MORE,
  dataTotal: DATA_TOTAL,
  schemaFile: SCHEMA_FILE,
  dataHook: 'de la ruta al paquete, del cobro al chat',
  glance: ['7 apps', 'monorepo', 'WhatsApp', 'pagos', 'tiempo real'],
  packages: ['ui', 'shared', 'mobile-ui', 'ai-knowledge', 'observability'],
  repoName: 'mogos-group',
  vault: 'mogos',
  ports: 'api :3000 · admin :3001 · client :3002 · …',
};

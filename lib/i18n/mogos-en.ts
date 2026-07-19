/**
 * Onboarding experience content for the mogos-group project.
 *
 * This is structural content (not Notion prose): the system (apps), the
 * architecture (stack) and the first boot-up. It's authored here, very visual,
 * and the three "lenses" render it. Verified against the real repo.
 */

import type { AppNode, DataChapter, Layer, ProjectData, Tech } from '../project';

export const REPO = 'https://github.com/Mogos-Group/mogos-group/tree/main';
export const repoUrl = (path: string) => (path ? `${REPO}/${path}` : `${REPO.replace('/tree/main', '')}`);

/** What mogos is — the cover. To know where we stand before the map. */
export const MOGOS = {
  kick: 'the project',
  title: 'mogos group',
  tag: 'Venezuelan company · door-to-door logistics · China and the US → Venezuela',
  ess: "It's a **Venezuelan logistics company**: it carries cargo **door to door** from **China and the United States to Venezuela** — and it's **expanding to more countries in Latin America**. It consolidates the merchandise in its **origin warehouses** and moves it by sea or air to the customer's final address. The customer **creates their quotation from their profile on the platform** (web or mobile), pays and **tracks their package live**; WhatsApp accompanies them with notices and payments, and the team operates it end to end. And **crescō handles the technology** — everything you see here.",
  flowLabel: "a package's journey",
  /** a package's journey, end to end */
  flow: [
    { emoji: '🧮', label: 'quote', sub: 'The customer creates it from their profile on the client platform.' },
    { emoji: '💳', label: 'pay', sub: 'Online: Stripe, PayPal, Binance or Zelle — even inside WhatsApp.' },
    { emoji: '📦', label: 'consolidate', sub: 'The origin warehouses receive and group the cargo.' },
    { emoji: '✈️', label: 'travel', sub: 'Transit to Venezuela, by sea or air.' },
    { emoji: '🚚', label: 'deliver', sub: 'The carrier delivers it with a live route.' },
  ] as { emoji: string; label: string; sub: string }[],
  /** who uses it */
  who: [
    { emoji: '🧍', name: 'end customer', what: 'Quotes, pays and tracks their cargo (web + mobile).' },
    { emoji: '⚙️', name: 'ops team', what: 'Runs everything from the admin.' },
    { emoji: '📦', name: 'warehouse', what: 'Receives and consolidates at the origin warehouse.' },
    { emoji: '🚚', name: 'carrier', what: 'Delivers with a live map (mobile).' },
  ] as { emoji: string; name: string; what: string }[],
  role: 'The system you see here — the 7 apps, the backbone and the integrations — is what makes that journey work.',
};

/** The system: the 7 monorepo apps, connected to the api. */
export const APPS: AppNode[] = [
  {
    id: 'api', emoji: '⊞', name: 'api', sub: 'nest · supabase', hub: true, pos: [50, 50],
    ess: 'The **backbone** of mogos. All the business logic and data pass through here.',
    qhace: 'NestJS on top of Supabase/Postgres. Exposes the endpoints that every app consumes: shipments, quotations, customers, payments and the WhatsApp system. If something "is the truth", it lives here.',
    conn: ['supabase', 'whatsapp', '← all the apps'],
    files: [['apps/api/src/modules', 'One module per domain (shipments, quotes, customers).'], ['apps/api/prisma/schema.prisma', 'The data model — read it first.'], ['apps/api/src/whatsapp', 'WhatsApp templates + flows.']],
    run: 'npm run dev', repo: 'apps/api',
  },
  {
    id: 'client', emoji: '🖥️', name: 'client', sub: 'next · web', pos: [50, 13],
    ess: 'The **face of mogos** for the end customer: quote, track the cargo and pay.',
    qhace: 'Public app (Next.js). Creates shipments, sees the real-time status from origin to Venezuela, reviews quotations and initiates payments. Consumes the api, shares packages/ui. It has no logic of its own.',
    conn: ['→ api', '→ payments-portal', '⋯ Supabase Realtime'],
    files: [['apps/client/app', 'Routes (App Router) — start with "new shipment".'], ['apps/client/lib/api', 'The api client.'], ['apps/client/hooks', 'Live tracking (Realtime).']],
    run: 'npm run dev', repo: 'apps/client',
  },
  {
    id: 'admin', emoji: '⚙️', name: 'admin', sub: 'next · ops', pos: [16, 29],
    ess: 'The **internal panel**: the mogos team operates everything from here.',
    qhace: 'Next.js for operations: manage shipments, approve quotations, customers, suppliers and send WhatsApp messages. The day-to-day of David and Andy.',
    conn: ['→ api', '→ whatsapp (via api)', 'packages/ui'],
    files: [['apps/admin/app', 'The operations views.'], ['apps/admin/lib/api', 'The api client.']],
    run: 'npm run dev', repo: 'apps/admin',
  },
  {
    id: 'almacen', emoji: '📦', name: 'almacén', sub: 'inventory', pos: [84, 29],
    ess: 'The **warehouse**: receives, consolidates and dispatches the cargo.',
    qhace: 'Inventory and physical operations app. Registers what arrives at the origin warehouse (China or the US), consolidates it and prepares it for the door-to-door shipment. Maintains the physical status the customer sees.',
    conn: ['→ api', 'scanner / labels'],
    files: [['apps/almacen/app', 'Receiving and dispatch.'], ['apps/almacen/lib', 'Consolidation logic.']],
    run: 'npm run dev', repo: 'apps/almacen',
  },
  {
    id: 'agent', emoji: '🤖', name: 'agent', sub: 'ai', pos: [16, 77],
    ess: 'The **AI brain**: processes messages and business knowledge.',
    qhace: "mogos's agent. Reads messages (WhatsApp/Lark), understands intent and helps the team respond, backed by packages/ai-knowledge as its \"company brain\".",
    conn: ['→ api', '↔ whatsapp', 'packages/ai-knowledge'],
    files: [['apps/agent/src', "The agent's loop."], ['packages/ai-knowledge', 'The knowledge.']],
    run: 'npm run dev', repo: 'apps/agent',
  },
  {
    id: 'payments-portal', emoji: '💳', name: 'payments-portal', sub: 'payments', pos: [84, 77],
    ess: 'The **payment portal**: Stripe, PayPal, Binance, Zelle — even inside WhatsApp.',
    qhace: "Receives a token (JWT) from a quotation and charges. Four payment methods, partial payments, and it opens inside the WhatsApp webview so the customer can pay without leaving the chat.",
    conn: ['← client / whatsapp', '→ api · token', '→ payments'],
    files: [['apps/payments-portal/app/pay', 'The payment screen (token).'], ['apps/payments-portal/components/payment', 'Method/amount selector.']],
    run: 'npm run dev', repo: 'apps/payments-portal',
  },
  {
    id: 'mobile-client', emoji: '📱', name: 'mobile-client', sub: 'expo · rn', pos: [50, 89],
    ess: 'The **mobile app**: customers and carriers, with a live map.',
    qhace: 'React Native (Expo). For the customer on their phone and for the carrier (route with Google Maps). Shares packages/mobile-ui. The fastest-growing vertical.',
    conn: ['→ api', '→ google maps', 'packages/mobile-ui'],
    files: [['apps/mobile-client/app', 'Screens (expo router).'], ['packages/mobile-ui', 'Mobile components.']],
    run: 'npx expo start', repo: 'apps/mobile-client',
  },
];

/** The architecture: the stack by layers. */
export const LAYERS: Layer[] = [
  { id: 'Experience', k: 'what the user touches', items: ['next', 'rq', 'expo', 'ui'] },
  { id: 'API', k: 'the logic · the backbone', items: ['nest', 'prisma', 'zod'], bone: true },
  { id: 'Data', k: 'the truth', items: ['supa'] },
  { id: 'Platform', k: 'the foundation', items: ['turbo', 'eas', 'posthog'] },
  // (Layer.id is a display title, Layer.k a subtitle — both translated; items are TECH keys, unchanged)
];
export const INTEG = ['wa', 'pay', 'maps', 'mail'];
export const TECH: Record<string, Tech> = {
  next: { id: 'next', emoji: '▲', name: 'Next.js', layer: 'Experience', tag: 'web', ess: 'The web framework (React, App Router) of the 4 web apps.', why: 'The 4 web apps (client, admin, almacén, payments-portal) are Next.js. SSR with @supabase/ssr.', where: 'apps/client', repo: 'apps/client' },
  rq: { id: 'rq', emoji: '◵', name: 'TanStack Query', layer: 'Experience', tag: 'data', ess: 'Data fetching and caching against the api.', why: 'Every web app requests data from the api with React Query — caching and states without reinventing them.', where: 'lib/api', repo: 'apps/client' },
  expo: { id: 'expo', emoji: '📱', name: 'Expo · React Native', layer: 'Experience', tag: 'mobile', ess: 'The mobile app — customers and carriers.', why: 'The mobile-client app is React Native with Expo Router; routes with Google Maps; built with EAS.', where: 'apps/mobile-client', repo: 'apps/mobile-client' },
  ui: { id: 'ui', emoji: '🧩', name: 'packages/ui', layer: 'Experience', tag: 'design system', ess: 'The components shared across apps.', why: 'A single UI system so we don\'t repeat buttons/tables/forms.', where: 'packages/ui', repo: 'packages/ui' },
  nest: { id: 'nest', emoji: '⊞', name: 'NestJS', layer: 'API', tag: 'backbone', ess: 'The backbone: the modular API where the logic lives.', why: 'One module per domain. JWT + Passport (auth), Swagger (/docs), Throttler, Schedule (crons).', where: 'apps/api/src/modules', repo: 'apps/api' },
  prisma: { id: 'prisma', emoji: '◧', name: 'Prisma', layer: 'API', tag: 'orm', ess: 'The ORM on top of Postgres — the schema is the truth of the model.', why: 'Defines tables and relations in a single file. Read it before anything else.', where: 'apps/api/prisma/schema.prisma', repo: 'apps/api' },
  zod: { id: 'zod', emoji: '✓', name: 'Zod', layer: 'API', tag: 'validation', ess: 'Validates inputs and outputs (DTOs, WhatsApp payloads).', why: 'Everything that comes in is validated with a Zod schema.', where: 'apps/api/src', repo: 'apps/api' },
  supa: { id: 'supa', emoji: '🗄️', name: 'Supabase', layer: 'Data', tag: 'postgres · auth · realtime', ess: 'The database, the auth and the real-time.', why: 'Postgres + Auth (@supabase/ssr) + Realtime (live tracking) + Storage.', where: 'supabase/', repo: 'supabase' },
  wa: { id: 'wa', emoji: '💬', name: 'WhatsApp Cloud API', layer: 'Integrations', tag: 'channel', ess: 'The main channel with the customer.', why: 'Templates, flows and payment webview — the customer gets notices and pays without leaving WhatsApp.', where: 'apps/api/src/whatsapp', repo: 'apps/api' },
  pay: { id: 'pay', emoji: '💳', name: 'Payments', layer: 'Integrations', tag: 'stripe · paypal · binance · zelle', ess: 'Four payment methods, with JWT tokens.', why: 'The payment-gateway module generates the token; payments-portal charges.', where: 'apps/api/src/payment-gateway', repo: 'apps/payments-portal' },
  maps: { id: 'maps', emoji: '🗺️', name: 'Google Maps', layer: 'Integrations', tag: 'routes', ess: "The carrier's routes on mobile.", why: "The carrier's app uses Google Maps for navigation.", where: 'apps/mobile-client', repo: 'apps/mobile-client' },
  mail: { id: 'mail', emoji: '✉️', name: 'Postmark', layer: 'Integrations', tag: 'email', ess: 'The transactional emails.', why: 'Verification, welcome, payment notices — via Postmark from the api.', where: 'apps/api/src/email', repo: 'apps/api' },
  turbo: { id: 'turbo', emoji: '⚡', name: 'Turborepo', layer: 'Platform', tag: 'monorepo', ess: 'The monorepo: orchestrates builds and dev of apps + packages.', why: 'Combines npm workspaces + Turbo. The turbo.json defines the tasks; dev everything at once.', where: 'turbo.json', repo: '' },
  eas: { id: 'eas', emoji: '🚀', name: 'EAS', layer: 'Platform', tag: 'expo build', ess: 'Builds and releases of the mobile app.', why: 'Expo Application Services compiles and publishes mobile-client.', where: 'eas.json', repo: '' },
  posthog: { id: 'posthog', emoji: '📊', name: 'PostHog', layer: 'Platform', tag: 'observability', ess: 'Product analytics and observability.', why: 'Events and metrics; packages/observability centralizes the instrumentation.', where: 'packages/observability', repo: 'packages/observability' },
};

/** First boot-up: requirements, env (1Password), scripts, docs. */
export const SCRIPTS: [string, string][] = [
  ['npm run dev', '**dev** environment + turbo dev. The day-to-day one.'],
  ['npm run staging', '**staging** environment + turbo dev. Testing against staging data.'],
  ['npm run prod', '**prod** environment + turbo dev. **Careful** — it points to production.'],
  ['npm run build', 'Turbo build — compiles all the apps.'],
  ['npm run lint · format', 'Turbo lint · Prettier across the whole repo.'],
  ['npm run e2e', 'Playwright (e2e:admin, e2e:seed to seed users).'],
];
export const DOCS: { emoji: string; name: string; path: string }[] = [
  { emoji: '📖', name: 'README', path: 'README.md' },
  { emoji: '🤖', name: 'CLAUDE · AGENTS', path: 'AGENTS.md' },
  { emoji: '⊞', name: 'API patterns', path: 'API_PATTERNS.md' },
  { emoji: '💄', name: 'Frontend commandments', path: 'FRONTEND_COMMANDMENTS.md' },
  { emoji: '⚡', name: 'Realtime quickstart', path: 'REALTIME_QUICKSTART.md' },
  { emoji: '🗺️', name: 'Google Maps setup', path: 'docs/google-maps-api-setup.md' },
  { emoji: '📤', name: 'S3 file upload', path: 'docs/S3_FILE_UPLOAD.md' },
  { emoji: '📁', name: 'docs/ · everything', path: 'docs' },
];

/**
 * The data: a narrative walkthrough of the Prisma schema, by chapters.
 * Anchored to apps/api/prisma/schema.prisma (verified). Model names in
 * PascalCase and tables in @@map exactly as they are in the repo.
 */
export const SCHEMA_FILE = 'apps/api/prisma/schema.prisma';
export const DATA: DataChapter[] = [
  {
    id: 'geo', n: '01', title: 'The geography', kicker: 'where mogos exists',
    lead: 'Before moving anything, mogos defines **where** it operates. And everything hangs off a route: the corridor. It\'s the spine — every shipment, quotation and departure knows which corridor it belongs to.',
    models: [
      { emoji: '🛫', name: 'Corridor', table: 'corridors', one: 'The route. Links an origin country with a destination one — e.g. China or the US → Venezuela.', fields: ['code · unique', 'originCountry → destCountry', 'emoji · isActive', 'config (Json)'], links: ['→ Country (origin / destination)', '→ Warehouse (via WarehouseCorridor)', '→ Order · Freight · Departure'], note: 'The corridor is the axis of the business: almost everything that moves points to one. Each new route (another country) is one more corridor.' },
      { emoji: '🌍', name: 'Country', table: 'countries', one: "The country. Origin or destination of a corridor; sets the unit system (metric / imperial).", fields: ['iso · unique', 'unitSystem', 'active'], links: ['→ State → City', '→ Warehouse', '→ Corridor'] },
      { emoji: '📍', name: 'State · City', table: 'states · cities', one: 'The political division. They hang off the country and land in addresses and warehouses.', fields: ['name', 'country / state'], links: ['→ Address', '→ Warehouse'] },
      { emoji: '🏬', name: 'Warehouse', table: 'warehouses', one: 'The physical warehouse, with GPS. Serves shipments and/or stores merchandise.', fields: ['latitude · longitude', 'supportsShipping', 'supportsStorage', 'totalStorageCbm'], links: ['→ Country · City', '→ Freight (origin / destination)', '→ Departure', '→ StorageReservation'], note: 'A single warehouse can dispatch and store — the supportsShipping / supportsStorage flags decide it.' },
      { emoji: '🔗', name: 'WarehouseCorridor', table: 'warehouse_corridors', one: 'The bridge: which warehouse serves which corridor, in what role and how much CBM is allocated to it.', fields: ['role (ORIGIN / TRANSIT / DEST)', 'cbmAllocated', 'priority'], links: ['Warehouse ↔ Corridor'] },
    ],
  },
  {
    id: 'gente', n: '02', title: 'The people', kicker: 'who sends and who receives',
    lead: 'A single people table, separated by role, and the address where the journey ends. Identity is one, inside and outside the system.',
    models: [
      { emoji: '👤', name: 'User', table: 'users', one: 'Every person: customer, agent, admin or manager. A customer has their agent; an agent, their portfolio.', fields: ['role (CLIENT / AGENT / ADMIN / MANAGER)', 'agentId → clients', 'dni · email · phone', 'emailVerified · phoneVerified'], links: ['→ Order · Freight · Quotation', '→ Conversation · Lead', '→ RbacRole'], note: "The id isn't auto-generated: it comes from Supabase Auth. One identity for authentication and business." },
      { emoji: '🏠', name: 'Address', table: 'addresses', one: 'The final door. With GPS, place type, tower / floor / unit and who to deliver to.', fields: ['latitude · longitude · gpsAccuracy', 'placeType', 'recipientName · recipientPhone', 'isPrimary'], links: ['→ Country · State · City', '→ User', '→ Order'] },
      { emoji: '🛡️', name: 'RbacRole', table: 'rbac_roles', one: 'Fine-grained permissions for the admin: roles with sets of permissions (resource × action).', fields: ['isSystem · isSuperAdmin', 'permissions[]'], links: ['→ User', '→ RbacRolePermission'] },
    ],
  },
  {
    id: 'carga', n: '03', title: 'The cargo', kicker: "a package's journey",
    lead: 'The heart. From origin to the door, each level groups the previous one: box → shipment → container → departure. And a log narrates it all.',
    models: [
      { emoji: '📦', name: 'Order', table: 'orders', one: "The customer's package: its tracking, its dimensions, its photos on receipt, and one status out of 17.", fields: ['trackingId · unique', 'cbm · weight · boxes', 'status (17 states)', 'shippingType (AIR / SEA)', 'isApproved · approvalStatus'], links: ['→ User · Address', '→ Freight', '→ Warehouse origin / destination', '→ Corridor'], note: 'The status travels: PENDING → WAREHOUSE_RECEIVED → … → IN_TRANSIT → … → READY_FOR_PICKUP → DELIVERED.' },
      { emoji: '🚚', name: 'Freight', table: 'freights', one: "The shipment: groups several of a customer's orders under one code, ready to go into a container.", fields: ['code · unique', 'status', 'shippingType'], links: ['→ Order[]', '→ Container', '→ User', '→ Warehouse origin / destination'] },
      { emoji: '🛳️', name: 'Container', table: 'containers', one: 'The physical container (sea or air). It carries freights and knows its location and progress.', fields: ['code · unique', 'carrier · trackingId', 'currentLocation · progress', 'shippingType (SEA / AIR)'], links: ['→ Freight[]', '→ Departure', '→ ContainerRouteStop[]'] },
      { emoji: '⚓', name: 'ContainerRouteStop', table: 'container_route_stops', one: 'Each stop on the route: port or airport, in sequence, with status and role.', fields: ['sequence (unique per container)', 'portName · portCode', 'status (PLANNED / REACHED / DEPARTED…)', 'planned / actual · arrival / departure'], links: ['→ Container', '→ StatusUpdate'], note: 'Container.currentLocation and progress are synced from the last stop reached.' },
      { emoji: '🗓️', name: 'Departure', table: 'departures', one: 'The scheduled departure: an origin warehouse → destination, with a load deadline and a sailing date.', fields: ['loadDeadline', 'departureDate · estimatedArrivalDate', 'status (OPEN…)'], links: ['→ Container[]', '→ Warehouse', '→ Corridor'] },
      { emoji: '🛰️', name: 'StatusUpdate', table: 'status_updates', one: 'The log. Every status change of any entity — and it can cascade from a container to all its orders.', fields: ['entityType · entityId (polymorphic)', 'status', 'cascade · regression', 'parent → children'], links: ['→ ContainerRouteStop', '→ User (createdBy)'], note: 'A single table narrates the history of everything that moves: it points by type + id, not by a fixed relation.' },
    ],
  },
  {
    id: 'dinero', n: '04', title: 'The money', kicker: 'charging with traceability',
    lead: 'It gets quoted, payment is attempted (every attempt is recorded), and only what truly comes in becomes a payment and a receipt. Audit-proof accounting.',
    models: [
      { emoji: '🧾', name: 'Quotation', table: 'quotations', one: 'The quotation. Points polymorphically to what it charges (a freight, a storage…), with subtotal, discounts and balance.', fields: ['quotationNumber · unique', 'entityType · entityId', 'totalAmount · amountPaid', 'status · dueDate · currency'], links: ['→ QuotationLineItem[]', '→ Transaction[] · Payment[]'] },
      { emoji: '➕', name: 'QuotationLineItem', table: 'quotation_line_items', one: 'The breakdown: each charge on the quotation (freight, insurance, handling…) with quantity and price.', fields: ['itemType', 'quantity · unitPrice · amount', 'calculationDetails (Json)'], links: ['→ Quotation'] },
      { emoji: '💳', name: 'Transaction', table: 'payment_transactions', one: 'Each payment attempt — with its provider, its raw response and its status.', fields: ['transactionRef · unique', 'provider (Stripe / PayPal / Binance / Zelle)', 'status · errorCode', 'providerResponse (Json) · ipAddress'], links: ['→ Quotation', '→ Payment (0 or 1)'], note: 'Records ALL attempts, successful and failed. The method is stored here for accounting traceability.' },
      { emoji: '✅', name: 'Payment', table: 'payments', one: 'Only successful payments. Verifiable and voidable: who verified it, who voided it and why.', fields: ['amount · currency', 'verifiedBy · verifiedAt', 'voidedBy · voidReason', 'paidAt (bank) vs createdAt (report)'], links: ['→ Quotation · Transaction', '→ Receipt'], note: '1:1 with a successful Transaction. paidAt is when it happened at the bank; createdAt, when it was reported in mogos.' },
      { emoji: '📄', name: 'Receipt', table: 'receipts', one: 'The official receipt, with its PDF.', fields: ['receiptNumber · unique', 'pdfUrl · pdfGeneratedAt'], links: ['→ Payment (1:1)'], note: 'It is created automatically when the Payment is created.' },
      { emoji: '🪙', name: 'MoguiLedgerEntry', table: 'mogui_ledger_entries', one: "The agent's \"mogui\" rewards ledger: 0.05 × CBM per credited order.", fields: ['type (EARNED / REVERSED)', 'cbm · amount · rate', 'originatingEntry (the reversal)'], links: ['→ agent · client (User)', '→ Order · Freight'], note: 'Append-only: it is never modified. A reversal is a new row with a negative amount. History is not rewritten.' },
    ],
  },
  {
    id: 'deposito', n: '05', title: 'The storage', kicker: 'storing, not just dispatching',
    lead: 'Some warehouses store cargo: storage charged by CBM and by time, with its own billing cycle.',
    models: [
      { emoji: '📐', name: 'StoragePricingTier', table: 'storage_pricing_tiers', one: 'The rate per CBM range: per day or monthly, with a withdrawal fee.', fields: ['minCbm – maxCbm', 'billingType', 'ratePerDayPerCbm / monthlyRate', 'withdrawalFee'], links: ['→ StorageReservation'] },
      { emoji: '📋', name: 'StorageReservation', table: 'storage_reservations', one: "The customer's reservation at a warehouse: reserved vs used CBM, cycle and balance.", fields: ['reservationCode', 'reservedCbm · usedCbm', 'nextBillingDate', 'status · currentBalance'], links: ['→ User · Warehouse · PricingTier', '→ StorageEntry[]'] },
      { emoji: '📥', name: 'StorageEntry', table: 'storage_entries', one: 'Each stored package: dimensions, entry date and rate frozen on entry.', fields: ['entryCode · unique', 'cbm · dimensions', 'entryDate', 'status (STORED…)'], links: ['→ StorageReservation', '→ StorageEntryService[]'] },
      { emoji: '🔁', name: 'Modification · Withdrawal', table: 'storage_…_requests', one: 'Request more / less space or take the cargo out — each request with its approval flow.', fields: ['requestType / requestCode', 'status', 'proRataAmount / withdrawalFee'], links: ['→ StorageReservation'] },
    ],
  },
  {
    id: 'chat', n: '06', title: 'The conversation', kicker: 'how the customer comes in',
    lead: 'One thread per channel, every message saved, and the prospect before becoming a customer. That\'s how almost everything starts.',
    models: [
      { emoji: '💬', name: 'Conversation', table: 'conversations', one: 'The thread, unique per channel + identity. Human or bot, assignable to an agent.', fields: ['channel (WHATSAPP / INSTAGRAM / TIKTOK)', 'phoneNumber · handle', 'isHuman · assignedAgent', 'lastMessageAt'], links: ['→ Message[]', '→ Lead[]', '→ User · Tag'] },
      { emoji: '✉️', name: 'Message', table: 'messages', one: 'Each message, inbound or outbound, with its type, its template and its delivery status.', fields: ['direction (IN / OUT)', 'type (TEXT / IMAGE / …)', 'templateName', 'deliveryStatus (sent / delivered / read)'], links: ['→ Conversation · User', '→ replyTo → replies'] },
      { emoji: '🎯', name: 'Lead', table: 'leads', one: 'The prospect: where they came from, what they want to move and which agent they were assigned to — before being a User.', fields: ['source · status (NEW…)', 'origin · destination · packageType', 'rawData (Json)'], links: ['→ Conversation · User', '→ agent (User)'] },
      { emoji: '🏷️', name: 'Tag', table: 'tags', one: 'Per-channel labels to classify conversations.', fields: ['name · color', 'channel'], links: ['→ Conversation (via ConversationTag)'] },
    ],
  },
];
/** What's left out of the walkthrough — to be honest about the scope. */
export const DATA_MORE: string[] = [
  'Notification', 'Announcement', 'Promotion · UserPromotion', 'ServiceQuote (+ line items and history)',
  'AIConversation', 'Tutorial · LearningSession', 'ExchangeRate', 'Catalog · ShippingLocation',
  'PaymentMethod · ChannelToken', 'DeliverySignature · SignatureToken', 'PhoneVerification',
  'Log · EntityNote · PermissionAuditLog',
];
export const DATA_TOTAL = 60;

/** The bundle consumed by <ProjectExperience/>. */
export const mogosProjectEn: ProjectData = {
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
  dataHook: 'from the route to the package, from the payment to the chat',
  glance: ['7 apps', 'monorepo', 'WhatsApp', 'payments', 'real-time'],
  packages: ['ui', 'shared', 'mobile-ui', 'ai-knowledge', 'observability'],
  repoName: 'mogos-group',
  vault: 'mogos',
  ports: 'api :3000 · admin :3001 · client :3002 · …',
};

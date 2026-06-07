/**
 * Data de la experiencia de onboarding del proyecto amedi.
 *
 * amedi es una plataforma de salud venezolana (médicos ↔ pacientes). Contenido
 * anclado a apps/api/prisma/schema.prisma (verificado). Mismo cascarón que mogos,
 * distinta data. Ver lib/project.ts para los tipos.
 */
import type { ProjectData, ProjectOverview, AppNode, Layer, Tech, DataChapter } from './project';

const REPO = 'https://github.com/amedi-app/amedi/tree/main';

const OVERVIEW: ProjectOverview = {
  kick: 'el proyecto',
  title: 'amedi',
  tag: 'Plataforma de salud venezolana · médicos y pacientes',
  ess: 'Es una **plataforma de salud venezolana**: conecta **pacientes con médicos** para agendar citas —presencial, virtual o a domicilio—, llevar la **historia clínica** y cobrar la consulta. Los médicos se **verifican contra SACS** (el registro sanitario), arman su agenda y su consultorio digital; el paciente busca, reserva (también **por WhatsApp**), asiste y paga. Y **crescō le lleva la tecnología** — todo lo que ves aquí.',
  flowLabel: 'el recorrido de una consulta',
  flow: [
    { emoji: '🔎', label: 'busca', sub: 'El paciente busca un médico por especialidad o nombre.' },
    { emoji: '🗓️', label: 'agenda', sub: 'Reserva su cita: presencial, virtual o a domicilio (también por WhatsApp).' },
    { emoji: '🩺', label: 'consulta', sub: 'El médico atiende y registra con su plantilla por especialidad.' },
    { emoji: '📋', label: 'historia', sub: 'Queda en la historia clínica del paciente.' },
    { emoji: '💳', label: 'paga', sub: 'Paga la consulta; el médico confirma el pago.' },
  ],
  who: [
    { emoji: '🧑‍⚕️', name: 'médico', what: 'Verifica su perfil (SACS), agenda y atiende desde el consultorio.' },
    { emoji: '🧑', name: 'paciente', what: 'Busca, reserva, asiste y lleva su historia (web).' },
    { emoji: '🧑‍💼', name: 'secretaria', what: 'Gestiona la agenda y el chat del médico.' },
    { emoji: '⚙️', name: 'equipo Amedi', what: 'Verifica médicos y cura especialidades y plantillas (admin).' },
  ],
  role: 'El sistema que ves aquí —las 4 apps, el backbone y las integraciones (SACS, Google Meet, WhatsApp)— es lo que hace posible esa consulta.',
};

/** El sistema: las 4 apps del monorepo, conectadas al api. */
const APPS: AppNode[] = [
  {
    id: 'api', emoji: '⊞', name: 'api', sub: 'nest · supabase', hub: true, pos: [50, 50],
    ess: 'El **backbone** de amedi. Toda la lógica clínica y los datos pasan por aquí.',
    qhace: 'NestJS sobre Supabase/Postgres. Expone los endpoints de médicos, pacientes, citas, consultas, pagos y notificaciones; verifica médicos contra SACS, agenda video-consultas (Google Meet) y manda correos (Postmark). Si algo "es la verdad", vive aquí.',
    conn: ['supabase', 'SACS · Google Meet · WhatsApp', '← todas las apps'],
    files: [['apps/api/src', 'Un módulo por dominio (doctors, appointments, consultation-records…).'], ['apps/api/prisma/schema.prisma', 'El modelo de datos — léelo primero.'], ['apps/api/src/auth', 'JWT de Supabase + guards (RBAC).']],
    run: 'npm run dev', repo: 'apps/api',
  },
  {
    id: 'client', emoji: '🧑', name: 'client', sub: 'next · paciente', pos: [50, 14],
    ess: 'La **app del paciente**: busca médicos, agenda, chatea, paga y lleva su historia.',
    qhace: 'Next.js público. Encuentra médicos por especialidad o slug, reserva citas (presencial, virtual o a domicilio), chatea con el consultorio, paga la consulta y administra su historia clínica y antecedentes. Consume el api, comparte packages/ui.',
    conn: ['→ api', '→ Google Maps', 'packages/ui'],
    files: [['apps/client/app', 'Rutas (App Router) — empieza por la búsqueda de médicos.'], ['apps/client/app/(main)', 'El área del paciente autenticado.']],
    run: 'npm run dev', repo: 'apps/client',
  },
  {
    id: 'consultorio', emoji: '🩺', name: 'consultorio', sub: 'next · médico', pos: [22, 80],
    ess: 'El **consultorio digital**: el workspace del médico y su secretaria.',
    qhace: 'Next.js para el médico: gestiona su agenda y excepciones, atiende citas, llena la consulta con plantillas por especialidad, firma historias, administra su equipo (secretarias) y sus métodos de pago.',
    conn: ['→ api', 'rutas doctor/ · secretary/', 'packages/ui'],
    files: [['apps/consultorio/app/doctor', 'El workspace del médico.'], ['apps/consultorio/app/secretary', 'El workspace de la secretaria.']],
    run: 'npm run dev', repo: 'apps/consultorio',
  },
  {
    id: 'admin', emoji: '⚙️', name: 'admin', sub: 'next · ops', pos: [78, 80],
    ess: 'El **panel interno** de Amedi: verifica médicos y cura el catálogo.',
    qhace: 'Next.js para el equipo Amedi: revisa y aprueba verificaciones de médicos (SACS o manual), gestiona clínicas, especialidades y plantillas, y envía comunicaciones.',
    conn: ['→ api', '→ SACS (revisión)', 'packages/ui'],
    files: [['apps/admin/app/(dashboard)', 'Las vistas internas.'], ['apps/admin/app/(auth)', 'El acceso del equipo.']],
    run: 'npm run dev', repo: 'apps/admin',
  },
];

/** La arquitectura: el stack por capas. */
const LAYERS: Layer[] = [
  { id: 'Experiencia', k: 'lo que el usuario toca', items: ['next', 'rq', 'ui', 'editor'] },
  { id: 'API', k: 'la lógica · el backbone', items: ['nest', 'prisma', 'zod'], bone: true },
  { id: 'Datos', k: 'la verdad', items: ['supa'] },
  { id: 'Plataforma', k: 'el cimiento', items: ['turbo', 'posthog'] },
];
const INTEG = ['sacs', 'meet', 'wa', 'mail', 'ai', 'maps'];
const TECH: Record<string, Tech> = {
  next: { id: 'next', emoji: '▲', name: 'Next.js', layer: 'Experiencia', tag: 'web', ess: 'El framework web (React, App Router) de las 3 apps web.', why: 'Las 3 apps web (client, consultorio, admin) son Next.js. SSR con @supabase/ssr.', where: 'apps/client', repo: 'apps/client' },
  rq: { id: 'rq', emoji: '◵', name: 'TanStack Query', layer: 'Experiencia', tag: 'datos', ess: 'Fetching y caché de datos contra el api.', why: 'Cada app web pide datos al api con React Query — caché y estados sin reinventar.', where: 'apps/client/lib', repo: 'apps/client' },
  ui: { id: 'ui', emoji: '🧩', name: 'packages/ui', layer: 'Experiencia', tag: 'design system', ess: 'Los componentes compartidos entre apps.', why: 'Un solo sistema de UI (shadcn/Radix) para no repetir botones, tablas y formularios.', where: 'packages/ui', repo: 'packages/ui' },
  editor: { id: 'editor', emoji: '✍️', name: 'novel · tiptap', layer: 'Experiencia', tag: 'editor', ess: 'El editor de texto rico.', why: 'Notas de consulta y perfiles del médico se editan con novel (sobre tiptap).', where: 'apps/consultorio', repo: 'apps/consultorio' },
  nest: { id: 'nest', emoji: '⊞', name: 'NestJS', layer: 'API', tag: 'backbone', ess: 'El backbone: la API modular donde vive la lógica.', why: 'Un módulo por dominio. JWT de Supabase + Passport, Swagger (/docs), Throttler, Schedule (crons).', where: 'apps/api/src', repo: 'apps/api' },
  prisma: { id: 'prisma', emoji: '◧', name: 'Prisma', layer: 'API', tag: 'orm', ess: 'El ORM sobre Postgres — el schema es la verdad del modelo.', why: 'Define tablas y relaciones en un archivo. Léelo antes que nada.', where: 'apps/api/prisma/schema.prisma', repo: 'apps/api' },
  zod: { id: 'zod', emoji: '✓', name: 'Zod', layer: 'API', tag: 'validación', ess: 'Valida entradas y salidas (DTOs, payloads).', why: 'Cada cosa que entra se valida con un schema Zod (junto a class-validator).', where: 'apps/api/src', repo: 'apps/api' },
  supa: { id: 'supa', emoji: '🗄️', name: 'Supabase', layer: 'Datos', tag: 'postgres · auth · storage', ess: 'La base de datos, el auth y el storage.', why: 'Postgres + Auth (@supabase/ssr, JWT) + Storage de documentos (vía S3).', where: 'supabase/', repo: 'supabase' },
  turbo: { id: 'turbo', emoji: '⚡', name: 'Turborepo', layer: 'Plataforma', tag: 'monorepo', ess: 'El monorepo: orquesta builds y dev de apps + packages.', why: 'Combina npm workspaces + Turbo. El turbo.json define las tareas; dev de todo a la vez.', where: 'turbo.json', repo: '' },
  posthog: { id: 'posthog', emoji: '📊', name: 'PostHog', layer: 'Plataforma', tag: 'observabilidad', ess: 'Analítica y observabilidad de producto.', why: 'Eventos y métricas con posthog-js (web) y posthog-node (api).', where: 'apps/client', repo: '' },
  sacs: { id: 'sacs', emoji: '🛂', name: 'SACS', layer: 'Integraciones', tag: 'verificación', ess: 'El registro sanitario venezolano.', why: 'Verifica la licencia del médico (DoctorVerification) — automático (scraping) o revisión manual del admin.', where: 'apps/api/src/doctors', repo: 'apps/api' },
  meet: { id: 'meet', emoji: '🎥', name: 'Google Meet', layer: 'Integraciones', tag: 'video', ess: 'Las video-consultas.', why: 'Genera el enlace de la cita virtual (videoCallUrl) vía Google Meet.', where: 'apps/api/src/google-meet', repo: 'apps/api' },
  wa: { id: 'wa', emoji: '💬', name: 'WhatsApp', layer: 'Integraciones', tag: 'canal', ess: 'Reservas y avisos por WhatsApp.', why: 'Flujo de reserva por WhatsApp (WhatsAppConversationState) y avisos/links de pago.', where: 'apps/api/src', repo: 'apps/api' },
  mail: { id: 'mail', emoji: '✉️', name: 'Postmark', layer: 'Integraciones', tag: 'email', ess: 'Los correos transaccionales.', why: 'Verificación, recordatorios de cita y avisos — vía Postmark desde el api.', where: 'apps/api/src/email', repo: 'apps/api' },
  ai: { id: 'ai', emoji: '🤖', name: 'Gemini', layer: 'Integraciones', tag: 'ia', ess: 'El asistente de IA.', why: 'Google Generative AI (Gemini) + packages/ai-knowledge alimentan el AIConversation.', where: 'apps/api/src/ai', repo: 'apps/api' },
  maps: { id: 'maps', emoji: '🗺️', name: 'Google Maps', layer: 'Integraciones', tag: 'mapas', ess: 'Direcciones y clínicas en el mapa.', why: 'El paciente ubica clínicas y su dirección con Google Maps (@vis.gl/react-google-maps).', where: 'apps/client', repo: 'apps/client' },
};

const SCRIPTS: [string, string][] = [
  ['npm run dev', 'Entorno **dev** + turbo dev. El del día a día.'],
  ['npm run staging', 'Entorno **staging** + turbo dev. Probar contra datos de staging.'],
  ['npm run prod', 'Entorno **prod** + turbo dev. **Con cuidado** — apunta a producción.'],
  ['npm run build', 'Turbo build — compila todas las apps.'],
  ['npm run lint · format', 'Turbo lint · Prettier en todo el repo.'],
];

const DOCS: { emoji: string; name: string; path: string }[] = [
  { emoji: '📖', name: 'README', path: 'README.md' },
  { emoji: '🤖', name: 'CLAUDE · agente', path: 'CLAUDE.md' },
  { emoji: '⊞', name: 'API patterns', path: 'API_PATTERNS.md' },
  { emoji: '💄', name: 'Frontend commandments', path: 'FRONTEND_COMMANDMENTS.md' },
  { emoji: '🗄️', name: 'Database schema', path: 'docs/database-schema.md' },
  { emoji: '🔔', name: 'Notifications', path: 'NOTIFICATIONS_SYSTEM_VERIFICATION.md' },
  { emoji: '📊', name: 'PostHog setup', path: 'posthog-setup-report.md' },
  { emoji: '📁', name: 'docs/ · todo', path: 'docs' },
];

const SCHEMA_FILE = 'apps/api/prisma/schema.prisma';

/** Los datos: el recorrido por el modelo, empezando por la gente. */
const DATA: DataChapter[] = [
  {
    id: 'gente', n: '01', title: 'La gente', kicker: 'quién es quién',
    lead: 'Todo arranca con una identidad. Un **Profile** base, y según su rol se vuelve médico, paciente o admin. De ahí cuelga el resto.',
    models: [
      { emoji: '👤', name: 'Profile', table: 'profiles', one: 'La identidad base de toda persona. Según su rol, se extiende a Patient, Doctor o Admin.', fields: ['email · phone · único', 'roles (RoleType[])', 'gender · birthdate', 'avatarUrl'], links: ['→ Patient / Doctor / Admin (1:1)', '→ Notification · AuditLog'], note: 'El id viene de Supabase Auth. Una sola identidad, dentro y fuera del sistema.' },
      { emoji: '🧑‍⚕️', name: 'Doctor', table: 'doctors', one: 'El médico: licencia, especialidades, agenda y perfil público.', fields: ['licenseNumber · único', 'slug (perfil público)', 'consultationFee', 'offersVirtual / inPerson / homeVisit', 'isVerified'], links: ['→ Profile (1:1)', '→ Specialty (principal + N:N)', '→ Availability · Appointment', '→ DoctorPaymentMethod'], note: 'Su perfil se publica por slug; ratingAvg y reviewCount salen de las reseñas.' },
      { emoji: '🛂', name: 'DoctorVerification', table: 'doctor_verifications', one: 'La verificación contra SACS: prueba que la licencia es real.', fields: ['status (pending / verified / failed…)', 'sacsData (Json)', 'source (automatic / manual)', 'retryCount · nextRetryAt'], links: ['→ Doctor'], note: 'Automática (scraping de SACS) o revisada a mano por un admin. Con reintentos.' },
      { emoji: '🧑', name: 'Patient', table: 'patients', one: 'El paciente: número de historia, datos clínicos y de contacto.', fields: ['medicalHistoryNumber (HM-)', 'nationalIdNumber (cédula)', 'bloodType · height · weight', 'chronicConditions · currentMedications'], links: ['→ Profile (1:1)', '→ Appointment · MedicalRecord', '→ PatientAntecedentes (1:1)'] },
      { emoji: '🧑‍💼', name: 'DoctorSecretary', table: 'doctor_secretaries', one: 'El equipo: liga a una secretaria con el o los médicos que asiste.', fields: ['status (pending / active / revoked)', 'invitedAt · acceptedAt'], links: ['Doctor ↔ Profile (secretaria)'], note: 'N:N real: una secretaria puede trabajar para varios médicos, y un médico tener varias.' },
    ],
  },
  {
    id: 'catalogo', n: '02', title: 'El catálogo', kicker: 'lo que el médico ofrece',
    lead: 'Lo que un médico es y ofrece sale de catálogos compartidos: su especialidad, los motivos que atiende, las clínicas donde pasa consulta, los seguros que acepta.',
    models: [
      { emoji: '🩺', name: 'Specialty', table: 'specialties', one: 'Las especialidades médicas (cardiología, pediatría…).', fields: ['name', 'specialtyId'], links: ['→ Doctor (principal)', '→ DoctorSpecialty (N:N)', '→ SpecialtyTemplate'] },
      { emoji: '📝', name: 'VisitReason', table: 'visit_reasons', one: 'Los motivos de consulta que un médico atiende.', fields: ['name'], links: ['→ DoctorReason (N:N)', '→ Appointment'] },
      { emoji: '🏥', name: 'Clinic', table: 'clinics', one: 'Los centros donde el médico pasa consulta.', fields: ['name · address', 'latitude · longitude'], links: ['→ DoctorClinic (N:N)', '→ Availability · Appointment'] },
      { emoji: '🛡️', name: 'InsuranceProvider', table: 'insurance_providers', one: 'Los seguros que el médico acepta.', fields: ['name'], links: ['→ DoctorInsuranceProvider (N:N)'] },
      { emoji: '🔗', name: 'Relaciones médico-catálogo', table: 'doctor_*', one: 'Las tablas puente que conectan al médico con cada catálogo.', fields: ['DoctorSpecialty · DoctorReason', 'DoctorLanguage', 'DoctorClinic · DoctorInsuranceProvider'], links: ['Doctor ↔ catálogos'], note: 'Cada una es un N:N: el médico elige sus especialidades, motivos, idiomas, clínicas y seguros.' },
    ],
  },
  {
    id: 'agenda', n: '03', title: 'La agenda', kicker: 'cuándo y dónde',
    lead: 'Con el médico definido, viene el tiempo. Su disponibilidad semanal, sus excepciones, y la **cita**: el punto donde paciente y médico se encuentran.',
    models: [
      { emoji: '🗓️', name: 'Availability', table: 'availability', one: 'La disponibilidad semanal del médico: franjas por día, con duración de slot.', fields: ['weekday · startTime · endTime', 'slotDurationMinutes', 'modality (presencial / virtual)', 'clinicId'], links: ['→ Doctor · Clinic'] },
      { emoji: '🚫', name: 'AvailabilityException', table: 'availability_exceptions', one: 'Excepciones a la agenda: vacaciones, feriados, bloqueos puntuales.', fields: ['exceptionDate', 'isBlocked', 'reason · source'], links: ['→ Doctor'] },
      { emoji: '📅', name: 'Appointment', table: 'appointments', one: 'La cita: el hub. Une paciente, médico, clínica, motivo y especialidad.', fields: ['date · startTime · endTime', 'type (presencial / virtual / domicilio)', 'source (platform / whatsapp)', 'status', 'videoCallUrl', 'shareHistoryWithDoctor'], links: ['→ Patient · Doctor · Clinic', '→ VisitReason · Specialty', '→ MedicalRecord · ConsultationRecord · ConsultationPayment'], note: 'El paciente decide si comparte su historia (shareHistoryWithDoctor). Una cita virtual lleva su enlace de Google Meet.' },
      { emoji: '🛰️', name: 'AppointmentHistory', table: 'appointment_history', one: 'La bitácora de la cita: cada cambio de estado o de fecha.', fields: ['previousStatus → newStatus', 'previousDate → newDate', 'changeReason'], links: ['→ Appointment'] },
      { emoji: '📎', name: 'AppointmentDocument', table: 'appointment_documents', one: 'Archivos adjuntos a la cita (exámenes, órdenes).', fields: ['fileName · fileType · fileUrl'], links: ['→ Appointment'] },
    ],
  },
  {
    id: 'consulta', n: '04', title: 'La consulta', kicker: 'el acto médico',
    lead: 'El corazón clínico. El médico atiende y registra la consulta con una **plantilla por especialidad**; queda en la historia del paciente, que persiste entre visitas.',
    models: [
      { emoji: '🩺', name: 'ConsultationRecord', table: 'consultation_records', one: 'El registro estructurado de la consulta: secciones clínicas en JSON, según la plantilla, firmado.', fields: ['sections (Json)', 'templateSnapshot', 'summaryText', 'signedAt · correctsRecordId'], links: ['→ Appointment (1:1)', '→ Patient · Doctor · Specialty'], note: 'Guarda una foto de la plantilla usada (templateSnapshot). Una corrección apunta al registro que reemplaza.' },
      { emoji: '📋', name: 'MedicalRecord', table: 'medical_records', one: 'Un registro clínico tipado (diagnóstico, receta, examen…) con sus documentos.', fields: ['type', 'title · comments', 'recordDate'], links: ['→ Appointment · Patient · Doctor', '→ MedicalRecordDocument[]'] },
      { emoji: '🧬', name: 'PatientAntecedentes', table: 'patient_antecedentes', one: 'Los antecedentes del paciente: personales y familiares, persisten entre visitas.', fields: ['chronicConditions · allergies (Json)', 'surgeries', 'familyConditions'], links: ['→ Patient (1:1)'] },
      { emoji: '🔐', name: 'SharedHistoryAccessLog', table: 'shared_history_access_logs', one: 'Auditoría: qué médico accedió a la historia compartida y cuándo.', fields: ['accessedAt'], links: ['→ Appointment · ConsultationRecord · Doctor'], note: 'Cuando el paciente comparte su historia, cada acceso de otro médico queda registrado.' },
      { emoji: '🧩', name: 'Plantillas de consulta', table: 'section_* · *_templates', one: 'El sistema de plantillas: secciones versionadas, una sugerencia por especialidad (Amedi) y el override del médico.', fields: ['SectionDefinition → SectionVersion', 'SpecialtyTemplate (curada por Amedi)', 'DoctorTemplate (override)'], links: ['→ Specialty · Doctor'], note: 'Append-only y versionado: una versión publicada nunca se modifica.' },
    ],
  },
  {
    id: 'dinero', n: '05', title: 'El dinero', kicker: 'cobrar la consulta',
    lead: 'Cada médico cobra a su manera. Define sus métodos de pago, y cada consulta genera un cobro con su comprobante.',
    models: [
      { emoji: '💳', name: 'DoctorPaymentMethod', table: 'doctor_payment_methods', one: 'Los métodos de pago del médico (Zelle, Pago Móvil…), con su comisión.', fields: ['name', 'currency', 'commission (%)', 'paymentData (Json)'], links: ['→ Doctor', '→ ConsultationPayment'] },
      { emoji: '🧾', name: 'ConsultationPayment', table: 'consultation_payments', one: 'El cobro de una consulta: monto, referencia del paciente y confirmación del médico.', fields: ['amount · currency', 'status', 'reference · referenceImageUrl', 'token (página pública)', 'whatsappSentTo'], links: ['→ Appointment (1:1)', '→ Doctor · Patient · PaymentMethod'], note: 'Lleva un token para la página de pago pública y rastrea el envío del cobro por WhatsApp.' },
    ],
  },
  {
    id: 'chat', n: '06', title: 'La conversación', kicker: 'cómo se hablan',
    lead: 'Fuera de la cita, paciente y médico siguen en contacto: un hilo por pareja, avisos por varios canales, y la reserva por WhatsApp.',
    models: [
      { emoji: '💬', name: 'Conversation', table: 'conversations', one: 'El hilo de chat entre un paciente y un médico — uno por pareja.', fields: ['status', 'lastMessageAt', 'patientLastReadAt · doctorLastReadAt'], links: ['→ Patient · Doctor', '→ ChatMessage[]'], note: 'Único por (médico, paciente), exista o no una cita.' },
      { emoji: '✉️', name: 'ChatMessage', table: 'chat_messages', one: 'Cada mensaje, con su remitente, tipo, visibilidad y estado de entrega.', fields: ['senderRole', 'type · content', 'visibility (TEAM…)', 'deliveryStatus'], links: ['→ Conversation', '→ Appointment (contexto)'], note: 'La secretaria puede escribir; la visibilidad controla quién ve qué.' },
      { emoji: '🔔', name: 'Notification', table: 'notifications', one: 'Los avisos al usuario, por varios canales, con sus preferencias.', fields: ['type · channel', 'status · priority', 'entityType · entityId'], links: ['→ Profile', '→ NotificationPreference'] },
      { emoji: '🟢', name: 'WhatsAppConversationState', table: 'whatsapp_conversation_states', one: 'La máquina de estados del flujo de reserva por WhatsApp, por número.', fields: ['state (IDLE…)', 'lastInboundAt'], links: ['(por phoneNumber)'], note: 'Permite reservar una cita conversando por WhatsApp.' },
    ],
  },
];

const DATA_MORE: string[] = [
  'Admin', 'Role · RolePermission · PermissionAuditLog', 'AuditLog', 'ClinicRequest',
  'Review · PatientFavorite', 'DoctorEducation · DoctorFaq · DoctorSocialLink',
  'DoctorDocument · DoctorContractSignature', 'Post · Announcement · Communication',
  'AIConversation', 'AllergyCategory · PatientAllergy · PatientAddress', 'Language', 'NotificationPreference',
];
const DATA_TOTAL = 56;

/** El bundle que consume <ProjectExperience/>. */
export const amediProject: ProjectData = {
  repo: REPO,
  slug: 'amedi',
  overview: OVERVIEW,
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
  dataHook: 'de la gente a la cita, de la consulta al pago',
  glance: ['4 apps', 'monorepo', 'SACS', 'Google Meet', 'WhatsApp'],
  packages: ['ui', 'ai-knowledge', 'eslint-config', 'typescript-config'],
  repoName: 'amedi',
  vault: 'amedi',
  ports: 'api :4000 · admin :4001 · client :4002 · consultorio :4003',
};

/**
 * Data for the amedi project onboarding experience.
 *
 * amedi is a Venezuelan health platform (doctors ↔ patients). Content anchored
 * to apps/api/prisma/schema.prisma (verified). Same shell as mogos, different
 * data. See lib/project.ts for the types.
 */
import type { ProjectData, ProjectOverview, AppNode, Layer, Tech, DataChapter } from '../project';

const REPO = 'https://github.com/amedi-app/amedi/tree/main';

const OVERVIEW: ProjectOverview = {
  kick: 'the project',
  title: 'amedi',
  tag: 'Venezuelan health platform · doctors and patients',
  ess: 'It is a **Venezuelan health platform**: it connects **patients with doctors** to book appointments —in person, virtual, or at home—, keep the **medical history**, and charge for the consultation. Doctors get **verified against SACS** (the health registry), build their schedule and their digital practice; the patient searches, books (also **via WhatsApp**), attends, and pays. And **crescō brings the technology** — everything you see here.',
  flowLabel: 'the journey of a consultation',
  flow: [
    { emoji: '🔎', label: 'search', sub: 'The patient searches for a doctor by specialty or name.' },
    { emoji: '🗓️', label: 'book', sub: 'Books their appointment: in person, virtual, or at home (also via WhatsApp).' },
    { emoji: '🩺', label: 'consult', sub: 'The doctor sees the patient and records with their specialty template.' },
    { emoji: '📋', label: 'history', sub: 'It stays in the patient\'s medical history.' },
    { emoji: '💳', label: 'pay', sub: 'Pays for the consultation; the doctor confirms the payment.' },
  ],
  who: [
    { emoji: '🧑‍⚕️', name: 'doctor', what: 'Verifies their profile (SACS), schedules, and sees patients from the practice.' },
    { emoji: '🧑', name: 'patient', what: 'Searches, books, attends, and keeps their history (web).' },
    { emoji: '🧑‍💼', name: 'secretary', what: 'Manages the doctor\'s schedule and chat.' },
    { emoji: '⚙️', name: 'Amedi team', what: 'Verifies doctors and curates specialties and templates (admin).' },
  ],
  role: 'The system you see here —the 4 apps, the backbone, and the integrations (SACS, Google Meet, WhatsApp)— is what makes that consultation possible.',
};

/** The system: the 4 apps of the monorepo, connected to the api. */
const APPS: AppNode[] = [
  {
    id: 'api', emoji: '⊞', name: 'api', sub: 'nest · supabase', hub: true, pos: [50, 50],
    ess: 'The **backbone** of amedi. All the clinical logic and data flows through here.',
    qhace: 'NestJS on top of Supabase/Postgres. Exposes the endpoints for doctors, patients, appointments, consultations, payments, and notifications; verifies doctors against SACS, schedules video consultations (Google Meet), and sends emails (Postmark). If something "is the truth", it lives here.',
    conn: ['supabase', 'SACS · Google Meet · WhatsApp', '← all the apps'],
    files: [['apps/api/src', 'One module per domain (doctors, appointments, consultation-records…).'], ['apps/api/prisma/schema.prisma', 'The data model — read it first.'], ['apps/api/src/auth', 'Supabase JWT + guards (RBAC).']],
    run: 'npm run dev', repo: 'apps/api',
  },
  {
    id: 'client', emoji: '🧑', name: 'client', sub: 'next · patient', pos: [50, 14],
    ess: 'The **patient app**: searches for doctors, books, chats, pays, and keeps their history.',
    qhace: 'Public Next.js. Finds doctors by specialty or slug, books appointments (in person, virtual, or at home), chats with the practice, pays for the consultation, and manages their medical history and background. Consumes the api, shares packages/ui.',
    conn: ['→ api', '→ Google Maps', 'packages/ui'],
    files: [['apps/client/app', 'Routes (App Router) — start with the doctor search.'], ['apps/client/app/(main)', 'The authenticated patient area.']],
    run: 'npm run dev', repo: 'apps/client',
  },
  {
    id: 'consultorio', emoji: '🩺', name: 'consultorio', sub: 'next · doctor', pos: [22, 80],
    ess: 'The **digital practice**: the workspace of the doctor and their secretary.',
    qhace: 'Next.js for the doctor: manages their schedule and exceptions, sees appointments, fills in the consultation with specialty templates, signs histories, manages their team (secretaries) and their payment methods.',
    conn: ['→ api', 'routes doctor/ · secretary/', 'packages/ui'],
    files: [['apps/consultorio/app/doctor', 'The doctor\'s workspace.'], ['apps/consultorio/app/secretary', 'The secretary\'s workspace.']],
    run: 'npm run dev', repo: 'apps/consultorio',
  },
  {
    id: 'admin', emoji: '⚙️', name: 'admin', sub: 'next · ops', pos: [78, 80],
    ess: 'The **internal panel** of Amedi: verifies doctors and curates the catalog.',
    qhace: 'Next.js for the Amedi team: reviews and approves doctor verifications (SACS or manual), manages clinics, specialties, and templates, and sends communications.',
    conn: ['→ api', '→ SACS (review)', 'packages/ui'],
    files: [['apps/admin/app/(dashboard)', 'The internal views.'], ['apps/admin/app/(auth)', 'The team\'s access.']],
    run: 'npm run dev', repo: 'apps/admin',
  },
];

/** The architecture: the stack by layers. */
const LAYERS: Layer[] = [
  { id: 'Experience', k: 'what the user touches', items: ['next', 'rq', 'ui', 'editor'] },
  { id: 'API', k: 'the logic · the backbone', items: ['nest', 'prisma', 'zod'], bone: true },
  { id: 'Data', k: 'the truth', items: ['supa'] },
  { id: 'Platform', k: 'the foundation', items: ['turbo', 'posthog'] },
];
const INTEG = ['sacs', 'meet', 'wa', 'mail', 'ai', 'maps'];
const TECH: Record<string, Tech> = {
  next: { id: 'next', emoji: '▲', name: 'Next.js', layer: 'Experience', tag: 'web', ess: 'The web framework (React, App Router) of the 3 web apps.', why: 'The 3 web apps (client, consultorio, admin) are Next.js. SSR with @supabase/ssr.', where: 'apps/client', repo: 'apps/client' },
  rq: { id: 'rq', emoji: '◵', name: 'TanStack Query', layer: 'Experience', tag: 'data', ess: 'Data fetching and caching against the api.', why: 'Each web app requests data from the api with React Query — caching and states without reinventing them.', where: 'apps/client/lib', repo: 'apps/client' },
  ui: { id: 'ui', emoji: '🧩', name: 'packages/ui', layer: 'Experience', tag: 'design system', ess: 'The components shared across apps.', why: 'A single UI system (shadcn/Radix) so we don\'t repeat buttons, tables, and forms.', where: 'packages/ui', repo: 'packages/ui' },
  editor: { id: 'editor', emoji: '✍️', name: 'novel · tiptap', layer: 'Experience', tag: 'editor', ess: 'The rich text editor.', why: 'Consultation notes and doctor profiles are edited with novel (on top of tiptap).', where: 'apps/consultorio', repo: 'apps/consultorio' },
  nest: { id: 'nest', emoji: '⊞', name: 'NestJS', layer: 'API', tag: 'backbone', ess: 'The backbone: the modular API where the logic lives.', why: 'One module per domain. Supabase JWT + Passport, Swagger (/docs), Throttler, Schedule (crons).', where: 'apps/api/src', repo: 'apps/api' },
  prisma: { id: 'prisma', emoji: '◧', name: 'Prisma', layer: 'API', tag: 'orm', ess: 'The ORM on top of Postgres — the schema is the truth of the model.', why: 'Defines tables and relations in one file. Read it before anything else.', where: 'apps/api/prisma/schema.prisma', repo: 'apps/api' },
  zod: { id: 'zod', emoji: '✓', name: 'Zod', layer: 'API', tag: 'validation', ess: 'Validates inputs and outputs (DTOs, payloads).', why: 'Everything that comes in is validated with a Zod schema (alongside class-validator).', where: 'apps/api/src', repo: 'apps/api' },
  supa: { id: 'supa', emoji: '🗄️', name: 'Supabase', layer: 'Data', tag: 'postgres · auth · storage', ess: 'The database, the auth, and the storage.', why: 'Postgres + Auth (@supabase/ssr, JWT) + document Storage (via S3).', where: 'supabase/', repo: 'supabase' },
  turbo: { id: 'turbo', emoji: '⚡', name: 'Turborepo', layer: 'Platform', tag: 'monorepo', ess: 'The monorepo: orchestrates builds and dev of apps + packages.', why: 'Combines npm workspaces + Turbo. The turbo.json defines the tasks; dev of everything at once.', where: 'turbo.json', repo: '' },
  posthog: { id: 'posthog', emoji: '📊', name: 'PostHog', layer: 'Platform', tag: 'observability', ess: 'Product analytics and observability.', why: 'Events and metrics with posthog-js (web) and posthog-node (api).', where: 'apps/client', repo: '' },
  sacs: { id: 'sacs', emoji: '🛂', name: 'SACS', layer: 'Integrations', tag: 'verification', ess: 'The Venezuelan health registry.', why: 'Verifies the doctor\'s license (DoctorVerification) — automatic (scraping) or manual admin review.', where: 'apps/api/src/doctors', repo: 'apps/api' },
  meet: { id: 'meet', emoji: '🎥', name: 'Google Meet', layer: 'Integrations', tag: 'video', ess: 'The video consultations.', why: 'Generates the link for the virtual appointment (videoCallUrl) via Google Meet.', where: 'apps/api/src/google-meet', repo: 'apps/api' },
  wa: { id: 'wa', emoji: '💬', name: 'WhatsApp', layer: 'Integrations', tag: 'channel', ess: 'Bookings and notices via WhatsApp.', why: 'Booking flow via WhatsApp (WhatsAppConversationState) and notices/payment links.', where: 'apps/api/src', repo: 'apps/api' },
  mail: { id: 'mail', emoji: '✉️', name: 'Postmark', layer: 'Integrations', tag: 'email', ess: 'The transactional emails.', why: 'Verification, appointment reminders, and notices — via Postmark from the api.', where: 'apps/api/src/email', repo: 'apps/api' },
  ai: { id: 'ai', emoji: '🤖', name: 'Gemini', layer: 'Integrations', tag: 'ai', ess: 'The AI assistant.', why: 'Google Generative AI (Gemini) + packages/ai-knowledge feed the AIConversation.', where: 'apps/api/src/ai', repo: 'apps/api' },
  maps: { id: 'maps', emoji: '🗺️', name: 'Google Maps', layer: 'Integrations', tag: 'maps', ess: 'Addresses and clinics on the map.', why: 'The patient locates clinics and their address with Google Maps (@vis.gl/react-google-maps).', where: 'apps/client', repo: 'apps/client' },
};

const SCRIPTS: [string, string][] = [
  ['npm run dev', '**dev** environment + turbo dev. The day-to-day one.'],
  ['npm run staging', '**staging** environment + turbo dev. Test against staging data.'],
  ['npm run prod', '**prod** environment + turbo dev. **Careful** — it points to production.'],
  ['npm run build', 'Turbo build — compiles all the apps.'],
  ['npm run lint · format', 'Turbo lint · Prettier across the whole repo.'],
];

const DOCS: { emoji: string; name: string; path: string }[] = [
  { emoji: '📖', name: 'README', path: 'README.md' },
  { emoji: '🤖', name: 'CLAUDE · agent', path: 'CLAUDE.md' },
  { emoji: '⊞', name: 'API patterns', path: 'API_PATTERNS.md' },
  { emoji: '💄', name: 'Frontend commandments', path: 'FRONTEND_COMMANDMENTS.md' },
  { emoji: '🗄️', name: 'Database schema', path: 'docs/database-schema.md' },
  { emoji: '🔔', name: 'Notifications', path: 'NOTIFICATIONS_SYSTEM_VERIFICATION.md' },
  { emoji: '📊', name: 'PostHog setup', path: 'posthog-setup-report.md' },
  { emoji: '📁', name: 'docs/ · everything', path: 'docs' },
];

const SCHEMA_FILE = 'apps/api/prisma/schema.prisma';

/** The data: the journey through the model, starting with the people. */
const DATA: DataChapter[] = [
  {
    id: 'gente', n: '01', title: 'The people', kicker: 'who\'s who',
    lead: 'It all starts with an identity. A base **Profile**, and depending on their role it becomes a doctor, patient, or admin. Everything else hangs off of that.',
    models: [
      { emoji: '👤', name: 'Profile', table: 'profiles', one: 'The base identity of every person. Depending on their role, it extends to Patient, Doctor, or Admin.', fields: ['email · phone · unique', 'roles (RoleType[])', 'gender · birthdate', 'avatarUrl'], links: ['→ Patient / Doctor / Admin (1:1)', '→ Notification · AuditLog'], note: 'The id comes from Supabase Auth. A single identity, inside and outside the system.' },
      { emoji: '🧑‍⚕️', name: 'Doctor', table: 'doctors', one: 'The doctor: license, specialties, schedule, and public profile.', fields: ['licenseNumber · unique', 'slug (public profile)', 'consultationFee', 'offersVirtual / inPerson / homeVisit', 'isVerified'], links: ['→ Profile (1:1)', '→ Specialty (primary + N:N)', '→ Availability · Appointment', '→ DoctorPaymentMethod'], note: 'Their profile is published by slug; ratingAvg and reviewCount come from the reviews.' },
      { emoji: '🛂', name: 'DoctorVerification', table: 'doctor_verifications', one: 'The verification against SACS: proves the license is real.', fields: ['status (pending / verified / failed…)', 'sacsData (Json)', 'source (automatic / manual)', 'retryCount · nextRetryAt'], links: ['→ Doctor'], note: 'Automatic (SACS scraping) or reviewed by hand by an admin. With retries.' },
      { emoji: '🧑', name: 'Patient', table: 'patients', one: 'The patient: medical history number, clinical and contact data.', fields: ['medicalHistoryNumber (HM-)', 'nationalIdNumber (national ID)', 'bloodType · height · weight', 'chronicConditions · currentMedications'], links: ['→ Profile (1:1)', '→ Appointment · MedicalRecord', '→ PatientAntecedentes (1:1)'] },
      { emoji: '🧑‍💼', name: 'DoctorSecretary', table: 'doctor_secretaries', one: 'The team: links a secretary with the doctor or doctors they assist.', fields: ['status (pending / active / revoked)', 'invitedAt · acceptedAt'], links: ['Doctor ↔ Profile (secretary)'], note: 'A real N:N: one secretary can work for several doctors, and one doctor can have several.' },
    ],
  },
  {
    id: 'catalogo', n: '02', title: 'The catalog', kicker: 'what the doctor offers',
    lead: 'What a doctor is and offers comes from shared catalogs: their specialty, the reasons they treat, the clinics where they see patients, the insurances they accept.',
    models: [
      { emoji: '🩺', name: 'Specialty', table: 'specialties', one: 'The medical specialties (cardiology, pediatrics…).', fields: ['name', 'specialtyId'], links: ['→ Doctor (primary)', '→ DoctorSpecialty (N:N)', '→ SpecialtyTemplate'] },
      { emoji: '📝', name: 'VisitReason', table: 'visit_reasons', one: 'The visit reasons a doctor treats.', fields: ['name'], links: ['→ DoctorReason (N:N)', '→ Appointment'] },
      { emoji: '🏥', name: 'Clinic', table: 'clinics', one: 'The centers where the doctor sees patients.', fields: ['name · address', 'latitude · longitude'], links: ['→ DoctorClinic (N:N)', '→ Availability · Appointment'] },
      { emoji: '🛡️', name: 'InsuranceProvider', table: 'insurance_providers', one: 'The insurances the doctor accepts.', fields: ['name'], links: ['→ DoctorInsuranceProvider (N:N)'] },
      { emoji: '🔗', name: 'Doctor-catalog relations', table: 'doctor_*', one: 'The bridge tables that connect the doctor with each catalog.', fields: ['DoctorSpecialty · DoctorReason', 'DoctorLanguage', 'DoctorClinic · DoctorInsuranceProvider'], links: ['Doctor ↔ catalogs'], note: 'Each one is an N:N: the doctor chooses their specialties, reasons, languages, clinics, and insurances.' },
    ],
  },
  {
    id: 'agenda', n: '03', title: 'The schedule', kicker: 'when and where',
    lead: 'With the doctor defined, time comes next. Their weekly availability, their exceptions, and the **appointment**: the point where patient and doctor meet.',
    models: [
      { emoji: '🗓️', name: 'Availability', table: 'availability', one: 'The doctor\'s weekly availability: time slots per day, with slot duration.', fields: ['weekday · startTime · endTime', 'slotDurationMinutes', 'modality (in person / virtual)', 'clinicId'], links: ['→ Doctor · Clinic'] },
      { emoji: '🚫', name: 'AvailabilityException', table: 'availability_exceptions', one: 'Exceptions to the schedule: vacations, holidays, one-off blocks.', fields: ['exceptionDate', 'isBlocked', 'reason · source'], links: ['→ Doctor'] },
      { emoji: '📅', name: 'Appointment', table: 'appointments', one: 'The appointment: the hub. Ties together patient, doctor, clinic, reason, and specialty.', fields: ['date · startTime · endTime', 'type (in person / virtual / home)', 'source (platform / whatsapp)', 'status', 'videoCallUrl', 'shareHistoryWithDoctor'], links: ['→ Patient · Doctor · Clinic', '→ VisitReason · Specialty', '→ MedicalRecord · ConsultationRecord · ConsultationPayment'], note: 'The patient decides whether to share their history (shareHistoryWithDoctor). A virtual appointment carries its Google Meet link.' },
      { emoji: '🛰️', name: 'AppointmentHistory', table: 'appointment_history', one: 'The appointment\'s log: every change of status or date.', fields: ['previousStatus → newStatus', 'previousDate → newDate', 'changeReason'], links: ['→ Appointment'] },
      { emoji: '📎', name: 'AppointmentDocument', table: 'appointment_documents', one: 'Files attached to the appointment (tests, orders).', fields: ['fileName · fileType · fileUrl'], links: ['→ Appointment'] },
    ],
  },
  {
    id: 'consulta', n: '04', title: 'The consultation', kicker: 'the medical act',
    lead: 'The clinical heart. The doctor sees the patient and records the consultation with a **specialty template**; it stays in the patient\'s history, which persists across visits.',
    models: [
      { emoji: '🩺', name: 'ConsultationRecord', table: 'consultation_records', one: 'The structured record of the consultation: clinical sections in JSON, per the template, signed.', fields: ['sections (Json)', 'templateSnapshot', 'summaryText', 'signedAt · correctsRecordId'], links: ['→ Appointment (1:1)', '→ Patient · Doctor · Specialty'], note: 'It stores a snapshot of the template used (templateSnapshot). A correction points to the record it replaces.' },
      { emoji: '📋', name: 'MedicalRecord', table: 'medical_records', one: 'A typed clinical record (diagnosis, prescription, test…) with its documents.', fields: ['type', 'title · comments', 'recordDate'], links: ['→ Appointment · Patient · Doctor', '→ MedicalRecordDocument[]'] },
      { emoji: '🧬', name: 'PatientAntecedentes', table: 'patient_antecedentes', one: 'The patient\'s background: personal and family, persists across visits.', fields: ['chronicConditions · allergies (Json)', 'surgeries', 'familyConditions'], links: ['→ Patient (1:1)'] },
      { emoji: '🔐', name: 'SharedHistoryAccessLog', table: 'shared_history_access_logs', one: 'Audit: which doctor accessed the shared history and when.', fields: ['accessedAt'], links: ['→ Appointment · ConsultationRecord · Doctor'], note: 'When the patient shares their history, every access by another doctor is recorded.' },
      { emoji: '🧩', name: 'Consultation templates', table: 'section_* · *_templates', one: 'The template system: versioned sections, one suggestion per specialty (Amedi) and the doctor\'s override.', fields: ['SectionDefinition → SectionVersion', 'SpecialtyTemplate (curated by Amedi)', 'DoctorTemplate (override)'], links: ['→ Specialty · Doctor'], note: 'Append-only and versioned: a published version is never modified.' },
    ],
  },
  {
    id: 'dinero', n: '05', title: 'The money', kicker: 'charging for the consultation',
    lead: 'Each doctor charges their own way. They define their payment methods, and each consultation generates a charge with its proof.',
    models: [
      { emoji: '💳', name: 'DoctorPaymentMethod', table: 'doctor_payment_methods', one: 'The doctor\'s payment methods (Zelle, Pago Móvil…), with their commission.', fields: ['name', 'currency', 'commission (%)', 'paymentData (Json)'], links: ['→ Doctor', '→ ConsultationPayment'] },
      { emoji: '🧾', name: 'ConsultationPayment', table: 'consultation_payments', one: 'The charge for a consultation: amount, patient reference, and doctor confirmation.', fields: ['amount · currency', 'status', 'reference · referenceImageUrl', 'token (public page)', 'whatsappSentTo'], links: ['→ Appointment (1:1)', '→ Doctor · Patient · PaymentMethod'], note: 'It carries a token for the public payment page and tracks the sending of the charge via WhatsApp.' },
    ],
  },
  {
    id: 'chat', n: '06', title: 'The conversation', kicker: 'how they talk',
    lead: 'Outside the appointment, patient and doctor stay in touch: one thread per pair, notices across several channels, and booking via WhatsApp.',
    models: [
      { emoji: '💬', name: 'Conversation', table: 'conversations', one: 'The chat thread between a patient and a doctor — one per pair.', fields: ['status', 'lastMessageAt', 'patientLastReadAt · doctorLastReadAt'], links: ['→ Patient · Doctor', '→ ChatMessage[]'], note: 'Unique per (doctor, patient), whether or not an appointment exists.' },
      { emoji: '✉️', name: 'ChatMessage', table: 'chat_messages', one: 'Each message, with its sender, type, visibility, and delivery status.', fields: ['senderRole', 'type · content', 'visibility (TEAM…)', 'deliveryStatus'], links: ['→ Conversation', '→ Appointment (context)'], note: 'The secretary can write; visibility controls who sees what.' },
      { emoji: '🔔', name: 'Notification', table: 'notifications', one: 'The notices to the user, across several channels, with their preferences.', fields: ['type · channel', 'status · priority', 'entityType · entityId'], links: ['→ Profile', '→ NotificationPreference'] },
      { emoji: '🟢', name: 'WhatsAppConversationState', table: 'whatsapp_conversation_states', one: 'The state machine of the WhatsApp booking flow, per number.', fields: ['state (IDLE…)', 'lastInboundAt'], links: ['(by phoneNumber)'], note: 'Lets you book an appointment by chatting over WhatsApp.' },
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

/** The bundle consumed by <ProjectExperience/>. */
export const amediProjectEn: ProjectData = {
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
  dataHook: 'from the people to the appointment, from the consultation to the payment',
  glance: ['4 apps', 'monorepo', 'SACS', 'Google Meet', 'WhatsApp'],
  packages: ['ui', 'ai-knowledge', 'eslint-config', 'typescript-config'],
  repoName: 'amedi',
  vault: 'amedi',
  ports: 'api :4000 · admin :4001 · client :4002 · consultorio :4003',
};

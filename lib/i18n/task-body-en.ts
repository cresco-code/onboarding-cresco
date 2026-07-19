import type { CBlock } from '@/lib/notion-content';

/**
 * Cuerpo en inglés de las 17 tareas estándar del onboarding.
 *
 * El cuerpo en español SIEMPRE vive en Notion (fuente de verdad, editable ahí).
 * El inglés es una traducción de código — si editas el cuerpo en español en
 * Notion, este archivo NO se actualiza solo. Tocalo a mano cuando cambie algo
 * importante.
 *
 * Las 5 tareas de lectura que embeben cresco-design.pages.dev (stack,
 * metodología, mi-trabajo, sistema-tareas, workspace) siguen embebiendo esa
 * página — es un sitio aparte, en español, fuera de este repo — con una nota
 * corta avisándolo.
 */

const DESIGN = process.env.NEXT_PUBLIC_DESIGN_URL ?? 'https://cresco-design.pages.dev';

const p = (text: string): CBlock => ({ type: 'p', rich: [{ text }] });
const ol = (text: string): CBlock => ({ type: 'ol', rich: [{ text }] });
const ul = (text: string): CBlock => ({ type: 'ul', rich: [{ text }] });
const h2 = (text: string): CBlock => ({ type: 'h2', rich: [{ text, bold: true }] });
const link = (label: string, url: string): CBlock => ({ type: 'p', rich: [{ text: label, href: url }] });
const italicNote = (text: string): CBlock => ({ type: 'p', rich: [{ text, italic: true }] });
const embed = (url: string): CBlock => ({ type: 'embed', url });

const SPANISH_ONLY_NOTE = 'This deep-dive is only available in Spanish for now.';

export const TASK_BODY_EN: Record<string, CBlock[]> = {
  'acepta tu google workspace': [
    p('Your @cresco.so account is the key to everything else: Gmail, Slack, Notion. Start here.'),
    ol('Open the invite email you received.'),
    ol('Accept it and create your password.'),
    ol('Confirm you can log into Gmail with your @cresco.so.'),
    link('Open Gmail', 'https://mail.google.com'),
  ],
  'entra a slack con tu correo': [
    p('Slack is where the team talks. Every client and project has its own channel.'),
    ol('Open Slack and sign in with your @cresco.so email.'),
    ol('Turn on notifications.'),
    ol('Introduce yourself in #general.'),
    link('Open Slack', 'https://slack.com/signin'),
  ],
  'entra a notion con tu correo': [
    p("Notion is the studio's memory: projects, tasks, meetings and wiki."),
    ol('Open Notion and sign in with Google (@cresco.so).'),
    ol('Accept the invite to the crescō workspace.'),
    ol("Find the studio's HQ."),
    link('Open Notion', 'https://notion.so'),
  ],
  'configura github': [
    p("All of crescō's code lives on GitHub. You need access to the organization and your account protected with 2FA."),
    ol('Accept the invite to the crescō organization (it arrives by email).'),
    ol('Turn on two-factor authentication (2FA) on your account.'),
    ol('Upload your SSH key so you can clone without typing a password.'),
    link('GitHub security', 'https://github.com/settings/security'),
  ],
  'configura el repo de tu cliente': [
    p('Every client has their own repository. Clone it, install it and run it locally to start building.'),
    ol("Ask in your Slack channel for your client's repo."),
    ol('Clone it and read the README.'),
    ol('Install the dependencies and start the local environment.'),
    ol('Confirm it runs before picking up your first task.'),
  ],
  'instala claude code': [
    p('At crescō we work with Claude Code: an AI-powered terminal that runs our skills and agents. Install it and connect to the team plugin.'),
    ol('Install Claude Code in your terminal.'),
    ol('Sign in with your account.'),
    ol('Install the team plugin (cresco-skills).'),
    ol('Try a skill — for example /mi-dia.'),
    link('Claude Code', 'https://claude.com/claude-code'),
  ],
  'conecta tus conectores en notion': [
    p("Notion becomes far more powerful once it knows your world: your calendar, your chats and your repos. Connect them once and the skills (mi-día, meetings) work with your full context."),
    h2('Connect them all'),
    ul('Google Calendar — your meetings and your availability.'),
    ul('Gmail and Google Drive — emails and documents.'),
    ul("Slack — the team's conversations."),
    ul('GitHub — PRs and issues.'),
    h2('How'),
    ol('In Notion: Settings → Connections.'),
    ol('Connect each one with your @cresco.so account and authorize the permissions.'),
    ol('Confirm they show as connected.'),
  ],
  'conoce el stack: con qué construimos': [
    p("crescō's technical map: web, mobile and a single API in one monorepo. You don't need to master it on day one, but you should know where everything lives."),
    italicNote(SPANISH_ONLY_NOTE),
    embed(`${DESIGN}/stack/`),
  ],
  'lee la metodología de crescō': [
    p('Take these few minutes. This is how we think and execute at crescō: from the meeting to execution.'),
    italicNote(SPANISH_ONLY_NOTE),
    embed(`${DESIGN}/metodologia/`),
  ],
  'conoce tu día a día: my work y el triage': [
    p('Almost your entire day runs through two pages in Notion: My Work and Meeting Task Triage. Get to know them and bookmark them.'),
    italicNote(SPANISH_ONLY_NOTE),
    embed(`${DESIGN}/mi-trabajo/`),
  ],
  'entiende el sistema: teamspace y la base tasks': [
    p('How crescō is set up in Notion: the teamspace and the Tasks base with all its relationships. Take a few minutes.'),
    italicNote(SPANISH_ONLY_NOTE),
    embed(`${DESIGN}/sistema-tareas/`),
  ],
  'conoce el workspace': [
    p("The studio's map in Notion: the areas and the six bases that hold everything together."),
    italicNote(SPANISH_ONLY_NOTE),
    embed(`${DESIGN}/hq/`),
  ],
  'crescō skills: la fábrica del equipo': [
    p('A skill is a packaged capability: a flow anyone on the team can invoke and repeat without reinventing it — from creating a task to putting together a PR with its mockups.'),
    h2('How you use them'),
    ul('You install them once with the team plugin (cresco-skills) in Claude Code.'),
    ul('You invoke them by typing /skill-name.'),
    ul("Every skill already knows our Notion bases, our brand, and our voice."),
    h2('How you create your own'),
    p("If you do something repeatable that's worth standardizing, turn it into a skill with the factory (skill-factory). It gets documented, validated, and shipped to the team via a PR to main — which also syncs it to the Skills base in Notion."),
  ],
  'el sistema operativo del estudio': [
    p('crescō works like an operating system: three layers sitting on top of six databases in Notion, with the studio at the center.'),
    h2('The three layers'),
    ul('Homes — the dashboards where you see your day, your projects, your client.'),
    ul('Skills — the capabilities you invoke by hand when you need them.'),
    ul('Agents — skills that run on their own, on a schedule, without you calling them (like your morning summary).'),
    h2('The six bases'),
    p("Customers, Team, Projects, Tasks, Meetings and more: the studio's shared memory. Everything else connects to them."),
  ],
  'graba tu primera reunión': [
    p('At crescō, no decision gets lost. Every meeting is recorded, transcribed, and lives in the Meetings base in Notion. AI summarizes and proposes tasks; people decide.'),
    ol('On your next meeting, create a page in the Meetings base (or use the template).'),
    ol('Turn on recording / meeting notes.'),
    ol('When it ends, review the summary and next steps.'),
    ol('Link the tasks that came out of the conversation.'),
  ],
  'conoce a tu cliente y proyecto': [
    p("You're going to build for a real client. Get to know them before you touch any code."),
    ol('Open the Customers base and find your client.'),
    ol('Read their project in Projects: goals, status, deliverables.'),
    ol("Review the project's recent meetings."),
    ol('Write down your questions for your first 1:1.'),
  ],
  'agarra tu primera tarea': [
    p('The best way to learn crescō is by doing it. Grab a small task and see it through, start to finish.'),
    ol('Open the Tasks base and filter by your project.'),
    ol('Pick a small task in your area.'),
    ol("Assign it to yourself and move it to 'In Progress'."),
    ol("When you're done, mark it 'Done' or open a PR."),
  ],
};

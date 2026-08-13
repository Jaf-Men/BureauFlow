import { Component, useEffect, useMemo, useState, type ErrorInfo, type FormEvent, type ReactNode } from "react";
import {
  AlertCircle, ArrowLeft, ArrowRight, Bot, Building2, Check, CheckCircle2, ChevronRight,
  ClipboardList, Copy, Eye, EyeOff, FilePlus2, FileText, FolderKanban, KeyRound, LayoutDashboard,
  Link2, LoaderCircle, LogOut, Mail, MessageCircle, Moon, PanelLeftClose, PanelLeftOpen, Plus,
  Scale, Send, Shield, ShieldCheck, Signature, Sparkles, Sun, UserPlus, Users, UsersRound,
  WifiOff, XCircle,
} from "lucide-react";
import brandSheet from "../imports/image.png";
import AuditCenterModule from "./AuditCenterModule";
import BureauIAModule from "./BureauIAModule";
import DocumentManagementModule from "./DocumentManagementModule";
import ElectronicSignaturesModule from "./ElectronicSignaturesModule";
import ProcessesModule from "../features/processes/ProcessesModule";
import { api, type Session } from "./api";

type View = "login" | "register" | "verify" | "recovery-request" | "recovery-reset" | "recovery-expired" | "recovery-used" | "onboarding" | "invite" | "accept" | "dashboard" | "processes" | "documents" | "signatures" | "bureauia" | "auditoria" | "states" | "map";
type Role = "advogado" | "escritorio" | "despachante" | "empresa" | "cliente" | "";
type Tone = "info" | "success" | "error" | "warning";
type InviteStatus = "enviado" | "visualizado" | "aceito" | "expirado" | "cancelado";
type VerificationChannel = "email" | "whatsapp";

type TeamProfile = "advogado" | "colaborador" | "gestor";
type RegistrationTeamMember = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  profile: TeamProfile;
  roleTitle: string;
  oab: string;
  section: string;
};
type Registration = {
  masterName: string;
  masterCpf: string;
  masterEmail: string;
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  cpf: string;
  document: string;
  phone: string;
  address: string;
  zipCode: string;
  state: string;
  city: string;
  district: string;
  street: string;
  streetNumber: string;
  complement: string;
  entity: string;
  oab: string;
  section: string;
  company: string;
  createTeamNow: boolean;
  employeeName: string;
  employeeCpf: string;
  employeeEmail: string;
  employeePhone: string;
  employeeRoleTitle: string;
  legalRepresentativeEmail: string;
  teamMembers: RegistrationTeamMember[];
  verificationChannel: VerificationChannel;
  terms: boolean;
  messages: boolean;
};
type Invite = { name: string; email: string; whatsapp: string; entity: "Pessoa física" | "Pessoa jurídica"; relation: string; process: string; expiry: string; message: string; invitedRole: Exclude<Role, "">; emailChannel: boolean; whatsappChannel: boolean; linkChannel: boolean };

const publicIds: Record<Exclude<Role, "">, string> = { advogado: "BF-USR-8K4P29", escritorio: "BF-ORG-4P8L22", despachante: "BF-USR-5D7R11", empresa: "BF-ORG-4P8L22", cliente: "BF-CLI-7M2X91" };
const emptyRegistration: Registration = {
  masterName: "",
  masterCpf: "",
  masterEmail: "",
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
  cpf: "",
  document: "",
  phone: "",
  address: "",
  zipCode: "",
  state: "",
  city: "",
  district: "",
  street: "",
  streetNumber: "",
  complement: "",
  entity: "",
  oab: "",
  section: "",
  company: "",
  createTeamNow: false,
  employeeName: "",
  employeeCpf: "",
  employeeEmail: "",
  employeePhone: "",
  employeeRoleTitle: "Representante legal",
  legalRepresentativeEmail: "",
  teamMembers: [],
  verificationChannel: "email",
  terms: false,
  messages: false,
};
const emptyInvite: Invite = { name: "", email: "", whatsapp: "", entity: "Pessoa física", relation: "Cliente / parte interessada", process: "", expiry: "2026-08-06", message: "Olá, gostaria de compartilhar este processo com você.", invitedRole: "cliente", emailChannel: true, whatsappChannel: false, linkChannel: false };
const roles = [
  ["advogado", "Advogado autônomo", "Organize sua atuação individual.", Scale],
  ["escritorio", "Escritório de Advocacia", "Cadastre seu escritório com CNPJ e equipe jurídica.", Building2],
  ["despachante", "Representante legal (despachante) autônomo", "Atue de forma autônoma, com clientes próprios e possibilidade de nomeação por empresas e escritórios em processos.", ClipboardList],
  ["empresa", "Empresa", "Acompanhe demandas da operação.", Building2],
  ["cliente", "Cliente", "Acesse itens compartilhados.", UsersRound],
] as const;

function maskDocument(value: string, cnpj: boolean) { const d = value.replace(/\D/g, "").slice(0, cnpj ? 14 : 11); if (cnpj) return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2"); return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"); }
function maskPhone(value: string) { const d = value.replace(/\D/g, "").slice(0, 11); return d.length < 3 ? d : d.length < 7 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : `(${d.slice(0, 2)}) ${d.slice(2, 7)}${d.slice(7) ? `-${d.slice(7)}` : ""}`; }

function BureauFlowMark({ compact = false }: { compact?: boolean; inverse?: boolean }) { return <span aria-label="BureauFlow" className={`brand-logo ${compact ? "brand-logo-bureauflow-compact" : "brand-logo-bureauflow"}`} style={{ backgroundImage: `url(${brandSheet})` }} />; }
function FluxHubMark({ compact = false }: { compact?: boolean; inverse?: boolean }) { return <span aria-label="FluxHub" className={`brand-logo ${compact ? "brand-logo-fluxhub-compact" : "brand-logo-fluxhub"}`} style={{ backgroundImage: `url(${brandSheet})` }} />; }
function Logo() { return <BureauFlowMark />; }
function Swirl({ dark = false }: { dark?: boolean }) { return <svg aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-full w-[46%] opacity-70" viewBox="0 0 400 700" fill="none"><path d="M405 -28C221 75 394 133 207 224S30 376 209 445s-98 134-208 247" stroke={dark ? "#8067df" : "#c7d6ff"} strokeWidth="2"/><path d="M415 73C295 123 370 207 241 280S104 402 245 493s-39 116-154 175" stroke={dark ? "#3c5eaf" : "#ddd5fe"} strokeWidth="1"/></svg>; }
function Button({ children, onClick, secondary = false, disabled = false, type = "button", className = "" }: { children: ReactNode; onClick?: () => void; secondary?: boolean; disabled?: boolean; type?: "button" | "submit"; className?: string }) { return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none ${secondary ? "border border-border bg-card text-foreground hover:bg-muted" : "bg-[#2f63e5] text-white shadow-[0_8px_20px_rgba(47,99,229,.2)] hover:bg-[#2454ce]"} ${className}`}>{children}</button>; }
function Field({ id, label, value, onChange, error, hint, type = "text", required = false, placeholder = "" }: { id: string; label: string; value: string; onChange: (value: string) => void; error?: string; hint?: string; type?: string; required?: boolean; placeholder?: string }) { const [visible, setVisible] = useState(false); const password = type === "password"; return <div className="space-y-1.5"><label htmlFor={id} className="block text-sm font-semibold">{label}{required && <span aria-hidden="true" className="ml-1 text-[#b42318]">*</span>}</label><div className="relative"><input id={id} required={required} type={password && visible ? "text" : type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} className={`min-h-12 w-full rounded-xl border bg-card px-3.5 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed] ${error ? "border-[#d92d20]" : "border-border"}`}/>{password && <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Ocultar senha" : "Revelar senha"} className="absolute right-0 top-0 grid size-12 place-items-center text-muted-foreground focus-visible:outline-2 focus-visible:outline-[#7c3aed]">{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button>}</div>{error && <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-sm text-[#b42318]"><AlertCircle size={15}/>{error}</p>}{hint && !error && <p id={`${id}-hint`} className="text-xs leading-5 text-muted-foreground">{hint}</p>}</div>; }
function Notice({ tone = "info", title, children }: { tone?: Tone; title: string; children: ReactNode }) { const styles: Record<Tone, string> = { info: "border-[#b9ccff] bg-[#f2f6ff] text-[#183b9e] dark:border-[#3855a0] dark:bg-[#172752] dark:text-[#cfdaff]", success: "border-[#a9df9e] bg-[#f1fbed] text-[#196515] dark:border-[#427b3e] dark:bg-[#15351b] dark:text-[#c9f7c1]", error: "border-[#f5b5ad] bg-[#fff3f1] text-[#9e261d] dark:border-[#813b40] dark:bg-[#401d25] dark:text-[#ffd0cc]", warning: "border-[#f1d095] bg-[#fff8e8] text-[#825700] dark:border-[#735a24] dark:bg-[#3c2e0d] dark:text-[#ffdfa0]" }; const Icon = tone === "success" ? CheckCircle2 : tone === "warning" ? AlertCircle : tone === "error" ? XCircle : AlertCircle; return <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border p-3.5 ${styles}`}><div className="flex gap-2.5"><Icon size={19} className="mt-0.5 shrink-0"/><div><p className="text-sm font-semibold">{title}</p><div className="mt-0.5 text-sm leading-5 opacity-90">{children}</div></div></div></div>; }
function Shell({ eyebrow, title, children, back, aside, asideAction }: { eyebrow: string; title: ReactNode; children: ReactNode; back?: () => void; aside?: ReactNode; asideAction?: ReactNode }) {
  return (
    <section className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_70px_rgba(28,44,89,.1)] lg:grid-cols-[1.15fr_.85fr]">
      <div className="relative p-5 sm:p-10 lg:p-14">
        <Swirl />
        <div className="relative mx-auto max-w-xl">
          {back && (
            <button onClick={back} className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#7c3aed]">
              <ArrowLeft size={18} />
              Voltar
            </button>
          )}
          <p className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-[#6247c8]">{eyebrow}</p>
          <h1 className="max-w-lg text-[clamp(1.9rem,4vw,2.6rem)] font-semibold leading-[1.12] tracking-[-.035em]">{title}</h1>
          <div className="mt-8">{children}</div>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-[#10275b] p-12 text-white lg:block xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(98,144,255,.18),transparent_38%),radial-gradient(circle_at_86%_84%,rgba(50,199,0,.14),transparent_32%)]"
        />
        <Swirl dark />

        <div className="relative flex h-full flex-col justify-between">
          <div>
            {asideAction && <div className="mb-6 flex justify-end">{asideAction}</div>}
            <div className="mb-9 h-px w-28 bg-gradient-to-r from-[#32c700] via-[#8ab7ff] to-transparent" />
            <div className="h-6" aria-hidden="true" />
            <h2 className="mt-5 text-[clamp(2.35rem,3.5vw,3.1rem)] font-semibold leading-[1.05] tracking-[-.03em]">
              Fluxos claros.
              <br />
              Processos sob controle.
            </h2>

            {aside || (
              <div className="mt-9 space-y-7">
                <p className="max-w-sm text-[1.03rem] leading-8 text-[#dbe5ff]">
                  Processos, clientes, documentos e automações em uma única operação com contexto do início ao fim.
                </p>
                <ul className="space-y-4 text-base font-semibold">
                  <li className="rounded-xl border border-white/45 bg-white/18 px-4 py-3 text-[#8fc0ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.36),0_6px_14px_rgba(9,20,48,0.18)]">Visibilidade em tempo real das etapas</li>
                  <li className="rounded-xl border border-white/45 bg-white/18 px-4 py-3 text-[#d8b4fe] shadow-[inset_0_1px_0_rgba(255,255,255,0.36),0_6px_14px_rgba(9,20,48,0.18)]">Convites com trilha de status e validade</li>
                  <li className="rounded-xl border border-white/45 bg-white/18 px-4 py-3 text-[#b8f58a] shadow-[inset_0_1px_0_rgba(255,255,255,0.36),0_6px_14px_rgba(9,20,48,0.18)]">Ações guiadas para continuidade do trabalho</li>
                </ul>
              </div>
            )}
          </div>

          <div className="mt-9 rounded-xl border border-white/25 bg-white/[0.12] px-5 py-4 text-base font-semibold text-[#eef4ff]">
            Seu fluxo ativo, do cadastro ao convite, em uma jornada única.
          </div>
        </div>
      </aside>
    </section>
  );
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Falha de renderização capturada:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-5 py-10">
        <section className="w-full rounded-2xl border border-[#f5b5ad] bg-[#fff3f1] p-6 text-[#9e261d]">
          <h1 className="text-xl font-semibold">Não foi possível carregar esta tela.</h1>
          <p className="mt-2 text-sm">Recarregue a página para sincronizar com a versão atual da aplicação.</p>
          <button onClick={() => window.location.reload()} className="mt-5 min-h-11 rounded-lg border border-[#e58f86] bg-white px-4 text-sm font-semibold hover:bg-[#fff8f7]">
            Recarregar agora
          </button>
        </section>
      </main>
    );
  }
}

function WorkspaceSidebar({ view, go, session, onLogout }: { view: View; go: (view: View) => void; session: { name: string; roleLabel: string }; onLogout: () => void }) {
  const items: Array<{ label: string; view: View; icon: ReactNode }> = [
    { label: "Início", view: "onboarding", icon: <LayoutDashboard size={16} /> },
    { label: "Painel", view: "dashboard", icon: <PanelLeftOpen size={16} /> },
    { label: "Processos", view: "processes", icon: <FolderKanban size={16} /> },
    { label: "Clientes", view: "invite", icon: <Users size={16} /> },
    { label: "Documentos", view: "documents", icon: <FileText size={16} /> },
    { label: "Assinaturas", view: "signatures", icon: <Signature size={16} /> },
    { label: "BureauIA", view: "bureauia", icon: <Sparkles size={16} /> },
    { label: "Auditoria", view: "auditoria", icon: <Shield size={16} /> },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#d6e3ff] bg-[#10275b] p-4 text-white md:flex md:flex-col">
      <div className="mb-4 border-b border-white/20 pb-4">
        <Logo />
        <p className="mt-3 text-xs text-[#d6e3ff]">Usuário: {session.name}</p>
        <p className="text-xs text-[#d6e3ff]">Perfil: {session.roleLabel}</p>
      </div>

      <p className="mb-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#aebfff]">Espaço de trabalho</p>
      <nav className="space-y-1">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => go(item.view)}
            className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm ${view === item.view ? "bg-white/15 font-semibold text-white" : "text-[#d6e3ff] hover:bg-white/10"}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button onClick={onLogout} className="mt-auto flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#ffb6b2] bg-[#ffefee] px-3 text-sm font-semibold text-[#9e261d] hover:bg-[#ffe4e2]">
        <LogOut size={16} />
        Sair
      </button>
    </aside>
  );
}

export default function App() {
  const [view, setView] = useState<View>(() => {
    try {
      const inviteToken = new URLSearchParams(window.location.search).get("invite");
      if (inviteToken) return "accept";
      const auth = localStorage.getItem("bf-auth") === "1";
      const savedView = localStorage.getItem("bf-view") as View | null;
      if (auth && savedView && savedView !== "login") return savedView;
      return auth ? "dashboard" : "login";
    } catch {
      return "login";
    }
  });
  const [incomingInviteToken] = useState<string>(() => {
    try {
      return new URLSearchParams(window.location.search).get("invite") ?? "";
    } catch {
      return "";
    }
  });
  const [dark, setDark] = useState(false); const [role, setRole] = useState<Role>(""); const [registerStep, setRegisterStep] = useState(0); const [registration, setRegistration] = useState<Registration>(emptyRegistration); const [saved, setSaved] = useState(false); const [toast, setToast] = useState(""); const [invite, setInvite] = useState<Invite>(emptyInvite); const [inviteStatus, setInviteStatus] = useState<InviteStatus>("enviado");
  const [verificationState, setVerificationState] = useState<{ channel: VerificationChannel; destination: string; url: string }>({
    channel: "email",
    destination: "",
    url: "",
  });
  const [accessToken, setAccessToken] = useState<string>(() => {
    try {
      return localStorage.getItem("bf-token") ?? "";
    } catch {
      return "";
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem("bf-auth") === "1";
    } catch {
      return false;
    }
  });
  const [activeSession, setActiveSession] = useState<{ name: string; roleLabel: string }>(() => {
    try {
      const raw = localStorage.getItem("bf-session");
      if (!raw) return { name: "Paulina", roleLabel: "Escritorio" };
      const parsed = JSON.parse(raw) as { name?: string; roleLabel?: string };
      return { name: parsed.name ?? "Paulina", roleLabel: parsed.roleLabel ?? "Escritorio" };
    } catch {
      return { name: "Paulina", roleLabel: "Escritorio" };
    }
  });
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3500); };
  const steps = useMemo(() => role === "escritorio" || role === "empresa" ? ["Dados da organização", "Endereco", "Equipe (opcional)", "Seguranca e consentimento"] : ["Perfil e contato", "Dados cadastrais", "Seguranca e consentimento"], [role]);
  useEffect(() => { if (!role) return; setSaved(false); const timer = window.setTimeout(() => setSaved(true), 600); return () => window.clearTimeout(timer); }, [registration, role]);
  const setReg = <K extends keyof Registration>(key: K, value: Registration[K]) => setRegistration(current => ({ ...current, [key]: value }));
  const setInv = <K extends keyof Invite>(key: K, value: Invite[K]) => setInvite(current => ({ ...current, [key]: value }));
  const startRegistration = () => { setRole(""); setRegisterStep(0); setRegistration(emptyRegistration); setView("register"); };
  const handleAuthenticated = (session: Session) => {
    const roleLabel = session.user.role ? session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1) : "Usuario";
    setIsAuthenticated(true);
    setAccessToken(session.accessToken);
    setActiveSession({ name: session.user.name, roleLabel });
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessToken("");
    setActiveSession({ name: "Paulina", roleLabel: "Escritorio" });
    setView("login");
  };

  useEffect(() => {
    try {
      if (!isAuthenticated) {
        localStorage.removeItem("bf-auth");
        localStorage.removeItem("bf-session");
        localStorage.removeItem("bf-view");
        localStorage.removeItem("bf-token");
        return;
      }
      localStorage.setItem("bf-auth", "1");
      localStorage.setItem("bf-session", JSON.stringify(activeSession));
      if (accessToken) localStorage.setItem("bf-token", accessToken);
      if (view !== "login") localStorage.setItem("bf-view", view);
    } catch {
      // Ignore storage issues to avoid interrupting navigation.
    }
  }, [isAuthenticated, activeSession, accessToken, view]);

  const publicId = role ? publicIds[role] : "BF-USR-8K4P29";
  const viewsWithSidebar: View[] = ["invite", "processes", "documents", "signatures", "bureauia", "auditoria"];
  const shouldShowWorkspaceSidebar = isAuthenticated && viewsWithSidebar.includes(view);

  return <AppErrorBoundary><main className={`${dark ? "dark" : ""} min-h-screen bg-background font-[DM_Sans] text-foreground selection:bg-[#cdd9ff]`}><div className={`min-h-screen bg-[radial-gradient(circle_at_90%_0%,rgba(124,58,237,.08),transparent_27rem)] dark:bg-[radial-gradient(circle_at_90%_0%,rgba(124,58,237,.16),transparent_27rem)] ${shouldShowWorkspaceSidebar ? "md:pl-64" : ""}`}>
    {shouldShowWorkspaceSidebar && <WorkspaceSidebar view={view} go={setView} session={activeSession} onLogout={handleLogout} />}
    <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8"><Logo/><div className="flex items-center gap-3"><span className="hidden items-center gap-2 sm:flex"><FluxHubMark compact/><span className="text-xs text-muted-foreground">plataforma proprietária</span></span><button onClick={() => setDark(!dark)} aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"} className="grid size-11 place-items-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button></div></header>
    {view === "login" && <Login go={setView} notify={notify} startRegistration={startRegistration} onAuthenticated={handleAuthenticated}/>} {view === "register" && <Register role={role} setRole={setRole} step={registerStep} setStep={setRegisterStep} steps={steps} values={registration} setValue={setReg} saved={saved} go={setView} onVerificationReady={setVerificationState}/>} {view === "verify" && <Verify id={publicId} go={setView} notify={notify} verification={verificationState}/>} {view === "recovery-request" && <RecoveryRequest go={setView}/>} {view === "recovery-reset" && <RecoveryReset go={setView} notify={notify}/>} {view === "recovery-expired" && <RecoveryProblem kind="expired" go={setView}/>} {view === "recovery-used" && <RecoveryProblem kind="used" go={setView}/>} {view === "onboarding" && <Onboarding go={setView} session={activeSession} onLogout={handleLogout}/>} {view === "invite" && <Invitation values={invite} setValue={setInv} status={inviteStatus} setStatus={setInviteStatus} go={setView} notify={notify} token={accessToken}/>} {view === "accept" && <AcceptInvitation go={setView} notify={notify} token={incomingInviteToken}/>} {view === "dashboard" && <DashboardV2 id={publicId} go={setView} notify={notify} session={activeSession} onLogout={handleLogout}/>} {view === "processes" && <ProcessesModule goToDashboard={() => setView("dashboard")} goToDocuments={() => setView("documents")} goToSignatures={() => setView("signatures")} goToBureauIA={() => setView("bureauia")} goToAudit={() => setView("auditoria")} />} {view === "documents" && <DocumentManagementModule goBack={() => setView("dashboard")} />} {view === "signatures" && <ElectronicSignaturesModule goBack={() => setView("dashboard")} />} {view === "bureauia" && <BureauIAModule goBack={() => setView("dashboard")} />} {view === "auditoria" && <AuditCenterModule goBack={() => setView("dashboard")} openAuditFlow={() => setView("documents")} />} {view === "states" && <StateLibrary go={setView}/>} {view === "map" && <PrototypeMap go={setView}/>} 
    <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8"><span className="flex items-center gap-2">© 2026 <BureauFlowMark compact/> <span>Todos os direitos reservados.</span></span>{view === "login" && <p className="max-w-xl text-right text-[11px] italic text-muted-foreground/85">Nunca, jamais desanimeis, embora venham ventos contrários. Confiai sempre muito na Divina Providência</p>}</footer>
    {toast && <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-2 rounded-xl bg-[#12306f] px-4 py-3 text-sm font-medium text-white shadow-xl"><CheckCircle2 size={18} className="text-[#8af27b]"/>{toast}</div>}
  </div></main></AppErrorBoundary>;
}

function Login({ go, notify, startRegistration, onAuthenticated }: { go: (view: View) => void; notify: (m: string) => void; startRegistration: () => void; onAuthenticated: (session: Session) => void }) { const [email, setEmail] = useState("paulina@fluxhub.com"); const [password, setPassword] = useState("Bureau@2026"); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const submit = async (event: FormEvent) => { event.preventDefault(); setError(""); setBusy(true); const normalizedEmail = email.trim().toLowerCase(); const allowedMockEmails = new Set(["paulina@fluxhub.com", "paulina@fluxhub", "paulina@flushub.com", "paulina@flushub"]); const isMockAccess = allowedMockEmails.has(normalizedEmail) && password === "Bureau@2026"; if (isMockAccess) { onAuthenticated({ accessToken: "mock-access-token", user: { id: "mock-paulina", name: "Paulina", email: "paulina@fluxhub.com", role: "escritorio", emailVerified: true } }); go("onboarding"); setBusy(false); return; } try { const session = await api<Session>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); onAuthenticated(session); go("onboarding"); } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível acessar sua conta agora. Tente novamente."); } finally { setBusy(false); } }; return <Shell eyebrow="Acesso seguro" title="Seu trabalho burocrático, em fluxo."><form onSubmit={submit} className="space-y-5"><p className="text-base leading-6 text-muted-foreground">Entre para organizar cada etapa no BureauFlow.</p>{error && <Notice tone="error" title="Não foi possível entrar">{error}</Notice>}<Field id="login-email" label="E-mail" type="email" value={email} onChange={setEmail} required/><Field id="login-password" label="Senha" type="password" value={password} onChange={setPassword} required/><div className="flex justify-end"><button type="button" onClick={() => go("recovery-request")} className="min-h-11 text-sm font-semibold text-[#2f63e5] hover:underline focus-visible:outline-2 focus-visible:outline-[#7c3aed]">Esqueci minha senha</button></div><Button type="submit" className="w-full" disabled={busy}>{busy ? <><LoaderCircle size={18} className="animate-spin motion-reduce:animate-none"/>Entrando...</> : <>Entrar<ArrowRight size={18}/></>}</Button><Button secondary className="w-full" onClick={() => notify("OAuth em construção neste ambiente.")}><ShieldCheck size={18}/>Continuar com Google</Button><Button secondary className="w-full" onClick={() => notify("OAuth em construção neste ambiente.")}><ShieldCheck size={18}/>Continuar com Microsoft</Button><p className="text-center text-sm text-muted-foreground">Ainda não tem conta? <button type="button" onClick={startRegistration} className="font-semibold text-[#2f63e5] hover:underline">Criar conta</button></p><p className="text-center text-sm text-muted-foreground">Recebeu um convite? <button type="button" onClick={() => go("accept")} className="font-semibold text-[#2f63e5] hover:underline">Aceitar convite</button></p><div className="flex justify-center gap-4 text-xs"><a href="#ajuda" className="hover:underline">Ajuda</a><a href="#termos" className="hover:underline">Termos de Uso</a><a href="#privacidade" className="hover:underline">Privacidade</a><a href="#lgpd" className="hover:underline">LGPD</a><button type="button" onClick={() => notify("Canal de suporte iniciado.")} className="hover:underline">Suporte</button></div></form></Shell>; }
function Register({ role, setRole, step, setStep, steps, values, setValue, saved, go, onVerificationReady }: { role: Role; setRole: (r: Role) => void; step: number; setStep: (s: number) => void; steps: string[]; values: Registration; setValue: <K extends keyof Registration>(k: K, v: Registration[K]) => void; saved: boolean; go: (v: View) => void; onVerificationReady: (state: { channel: VerificationChannel; destination: string; url: string }) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [lookupName, setLookupName] = useState("");
  const [lookupCpf, setLookupCpf] = useState("");
  const [lookupProfile, setLookupProfile] = useState<TeamProfile>("colaborador");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupCandidate, setLookupCandidate] = useState<{ name: string; email: string; document?: string; oab?: string; section?: string } | null>(null);
  const [lookupStatus, setLookupStatus] = useState<{ tone: Tone; text: string } | null>(null);

  const isOrganizationRole = role === "escritorio" || role === "empresa";
  const organizationLabel = role === "empresa" ? "empresa" : "escritorio";
  const needsCnpj = isOrganizationRole || (role === "despachante" && values.entity === "Com CNPJ");
  const loginEmail = isOrganizationRole ? values.masterEmail : values.email;
  const errors = {
    email: loginEmail === "existente@fluxhub.com" ? "Este e-mail ja esta cadastrado. Entre ou use outro e-mail." : "",
    document: values.document.replace(/\D/g, "") === "00000000000" ? "Este CPF ou CNPJ ja esta cadastrado." : "",
  };

  const weakPassword = values.password.length > 0 && values.password.length < 10;
  const mismatchPassword = values.passwordConfirmation.length > 0 && values.password !== values.passwordConfirmation;
  const final = role && step === steps.length - 1;

  const setTeamMember = (index: number, key: keyof RegistrationTeamMember, value: string) => {
    setValue("teamMembers", values.teamMembers.map((member, current) => (current === index ? { ...member, [key]: value } : member)));
  };

  const changeDocument = (value: string) => setValue("document", maskDocument(value, needsCnpj));
  const hasLookupQuery = lookupName.trim().length >= 3 || lookupCpf.replace(/\D/g, "").length === 11;

  useEffect(() => {
    let cancelled = false;
    if (!isOrganizationRole || step !== 2 || !values.createTeamNow) {
      setLookupBusy(false);
      setLookupCandidate(null);
      setLookupStatus(null);
      return;
    }

    if (!hasLookupQuery) {
      setLookupBusy(false);
      setLookupCandidate(null);
      setLookupStatus(null);
      return;
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          setLookupBusy(true);
          const params = new URLSearchParams();
          if (lookupName.trim().length >= 3) params.set("name", lookupName.trim());
          if (lookupCpf.replace(/\D/g, "").length === 11) params.set("cpf", lookupCpf.replace(/\D/g, ""));

          const result = await api<{ found: boolean; user?: { name: string; email: string; role: string; document?: string; oab?: string; section?: string } }>(`/auth/members/lookup?${params.toString()}`);
          if (cancelled) return;

          if (!result.found || !result.user) {
            setLookupCandidate(null);
            setLookupStatus({ tone: "warning", text: "Nenhum registro encontrado. Escolha o perfil e faça novo cadastro para incluir na equipe." });
            return;
          }

          setLookupCandidate({
            name: result.user.name,
            email: result.user.email,
            document: result.user.document,
            oab: result.user.oab ?? "",
            section: result.user.section ?? "",
          });
          setLookupStatus({ tone: "success", text: `Registro encontrado: ${result.user.name}. Agora atribua o perfil na equipe.` });
        } catch (error) {
          if (cancelled) return;
          setLookupCandidate(null);
          setLookupStatus({ tone: "error", text: error instanceof Error ? error.message : "Não foi possível verificar o registro agora." });
        } finally {
          if (!cancelled) setLookupBusy(false);
        }
      })();
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hasLookupQuery, isOrganizationRole, lookupCpf, lookupName, step, values.createTeamNow]);

  const addLookupCandidate = () => {
    if (!lookupCandidate) return;
    const candidateCpf = maskDocument(lookupCandidate.document ?? lookupCpf, false);
    if (!candidateCpf) {
      setLookupStatus({ tone: "error", text: "CPF é obrigatório para incluir este membro na equipe." });
      return;
    }
    const exists = values.teamMembers.some((member) => member.email.toLowerCase() === lookupCandidate.email.toLowerCase());
    if (exists) {
      setLookupStatus({ tone: "warning", text: "Este registro ja esta na lista da equipe." });
      return;
    }

    setValue("teamMembers", [
      ...values.teamMembers,
      {
        name: lookupCandidate.name,
        email: lookupCandidate.email,
        cpf: candidateCpf,
        phone: "",
        profile: lookupProfile,
        roleTitle: lookupProfile === "advogado" ? "Advogado" : lookupProfile === "gestor" ? "Gestor" : "Colaborador",
        oab: lookupProfile === "advogado" ? (lookupCandidate.oab ?? "") : "",
        section: lookupProfile === "advogado" ? (lookupCandidate.section ?? "") : "",
      },
    ]);
    setLookupStatus({ tone: "success", text: "Membro adicionado a partir de registro existente." });
  };

  const addManualTeamMember = (profile: TeamProfile) => {
    setValue("teamMembers", [
      ...values.teamMembers,
      {
        name: "",
        email: "",
        cpf: "",
        phone: "",
        profile,
        roleTitle: profile === "advogado" ? "Advogado" : profile === "gestor" ? "Gestor" : "Colaborador",
        oab: "",
        section: "",
      },
    ]);
  };

  const buildOrganizationAddress = () => {
    const main = `${values.street}${values.streetNumber ? `, ${values.streetNumber}` : ""}`;
    const district = values.district ? ` - ${values.district}` : "";
    const city = values.city && values.state ? `, ${values.city}/${values.state}` : "";
    const zip = values.zipCode ? `, CEP ${values.zipCode}` : "";
    const complement = values.complement ? ` (${values.complement})` : "";
    return `${main}${district}${city}${zip}${complement}`.trim();
  };

  const buildTeamMembers = () => {
    if (!values.createTeamNow) return [] as RegistrationTeamMember[];
    const unique = new Map<string, RegistrationTeamMember>();
    for (const member of values.teamMembers) {
      if (!member.email) continue;
      unique.set(member.email.toLowerCase(), member);
    }
    return [...unique.values()];
  };

  const submitRegistration = async () => {
    const teamMembers = buildTeamMembers();
    const legalRepresentative = teamMembers.find((member) => member.email.toLowerCase() === values.legalRepresentativeEmail.toLowerCase());
    const masterEmail = values.masterEmail || values.email;
    const payload = {
      name: isOrganizationRole ? values.masterName : values.name,
      email: masterEmail,
      password: values.password,
      role,
      verificationChannel: values.verificationChannel,
      phone: values.phone,
      document: isOrganizationRole ? values.masterCpf.replace(/\D/g, "") : role === "advogado" ? values.cpf.replace(/\D/g, "") : values.document.replace(/\D/g, ""),
      oab: values.oab,
      section: values.section,
      personalAddress: {
        reference: isOrganizationRole ? buildOrganizationAddress() : values.address,
      },
      workAddress: {
        reference: isOrganizationRole ? buildOrganizationAddress() : values.address,
      },
      organization: isOrganizationRole ? {
        name: values.company,
        document: values.document.replace(/\D/g, ""),
        address: buildOrganizationAddress(),
        workAddress: {
          zipCode: values.zipCode,
          state: values.state,
          city: values.city,
          district: values.district,
          street: values.street,
          number: values.streetNumber,
          complement: values.complement,
        },
        phone: values.phone,
        responsibleName: values.createTeamNow ? legalRepresentative?.name : undefined,
        responsibleCpf: values.createTeamNow && legalRepresentative?.cpf ? legalRepresentative.cpf.replace(/\D/g, "") : undefined,
        responsibleRole: values.createTeamNow ? legalRepresentative?.roleTitle : undefined,
        responsibleEmail: values.createTeamNow ? legalRepresentative?.email : undefined,
        teamMembers: teamMembers.map((member) => ({
          name: member.name,
          email: member.email,
          cpf: member.cpf.replace(/\D/g, ""),
          phone: member.phone,
          profile: member.profile,
          roleTitle: member.roleTitle,
          oab: member.oab,
          section: member.section,
        })),
        lawyers: teamMembers.filter((member) => member.profile === "advogado").map((member) => ({
          name: member.name,
          email: member.email,
          cpf: member.cpf.replace(/\D/g, ""),
          oab: member.oab,
          section: member.section,
        })),
      } : undefined,
    };

    const response = await api<{ verificationUrl: string; verificationChannel: VerificationChannel }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    onVerificationReady({
      channel: response.verificationChannel,
      destination: response.verificationChannel === "whatsapp" ? values.phone : masterEmail,
      url: response.verificationUrl,
    });
  };

  const advance = async () => {
    setBackendError("");
    if (errors.email || errors.document) return;

    if (isOrganizationRole && step === 0) {
      if (!values.masterName || !values.masterCpf || !values.masterEmail || !values.company || !values.document || !values.phone) {
        setBackendError("Preencha os dados da organização e do usuário master para continuar.");
        return;
      }
    }

    if (isOrganizationRole && step === 1) {
      const missingAddress = !values.zipCode || !values.state || !values.city || !values.district || !values.street || !values.streetNumber;
      if (missingAddress) {
        setBackendError("Preencha os campos obrigatórios de endereço para continuar.");
        return;
      }
    }

    if (!isOrganizationRole && step === 1 && !values.address) {
      setBackendError("Informe o endereço individual para continuar.");
      return;
    }

    if (isOrganizationRole && step === 2 && values.createTeamNow) {
      if (values.teamMembers.length === 0) {
        setBackendError("Inclua ao menos um membro na equipe para continuar.");
        return;
      }

      if (!values.legalRepresentativeEmail) {
        setBackendError("Escolha quem será o representante legal entre os membros da equipe.");
        return;
      }

      const representative = values.teamMembers.find((member) => member.email.toLowerCase() === values.legalRepresentativeEmail.toLowerCase());
      if (!representative) {
        setBackendError("Representante legal inválido. Escolha um membro da lista.");
        return;
      }

      for (const member of values.teamMembers) {
        if (!member.name || !member.email) {
          setBackendError("Preencha nome e e-mail de todos os membros da equipe.");
          return;
        }

        if (!member.cpf) {
          setBackendError("CPF é obrigatório para todos os membros da equipe.");
          return;
        }

        if (member.profile === "colaborador" && !member.phone) {
          setBackendError("Colaborador deve ter informações de contato.");
          return;
        }

        if (member.profile === "advogado" && (!member.cpf || !member.oab || !member.section)) {
          setBackendError("Advogado deve ter CPF, número da OAB e seccional.");
          return;
        }
      }
    }

    if (final && (!values.password || !values.passwordConfirmation || weakPassword || mismatchPassword || !values.terms)) return;

    if (!final) {
      setStep(step + 1);
      return;
    }

    try {
      setSubmitting(true);
      await submitRegistration();
      go("verify");
    } catch (error) {
      setBackendError(error instanceof Error ? error.message : "Não foi possível concluir o cadastro.");
    } finally {
      setSubmitting(false);
    }
  };

  return <Shell eyebrow="Fluxo de cadastro" title={role ? "Configure seu acesso com tranquilidade." : "Como você vai usar o BureauFlow?"} back={() => role ? (step ? setStep(step - 1) : setRole("")) : go("login")} aside={<div className="relative"><p className="font-mono text-xs uppercase tracking-[.14em] text-[#aebfff]">Cadastro progressivo</p><ol className="mt-8 space-y-5">{(role ? steps : ["Escolha do perfil", "Dados essenciais", "Ativação"]).map((item, index) => <li key={item} className="flex items-center gap-3 text-sm"><span className={`grid size-7 place-items-center rounded-full border ${index <= step ? "border-[#32c700] bg-[#32c700] text-[#10275b]" : "border-[#6376b1] text-[#b6c4ec]"}`}>{index < step ? <Check size={15}/> : index + 1}</span><span className={index <= step ? "text-white" : "text-[#b6c4ec]"}>{item}</span></li>)}</ol><p aria-live="polite" className="mt-12 text-sm text-[#c6d2ff]">{saved ? "Alterações salvas automaticamente." : "Salvando alterações..."}</p></div>}>
    {!role ? <div className="grid gap-3 sm:grid-cols-2">{roles.map(([id, title, description, Icon]) => <button key={id} onClick={() => { setRole(id); setStep(0); }} className="min-h-36 rounded-2xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-[#9cb4ff] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed] motion-reduce:transform-none"><Icon size={22} className="mb-5 text-[#2f63e5]"/><p className="font-semibold">{title}</p><p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p></button>)}</div> : <form onSubmit={(event) => { event.preventDefault(); void advance(); }} className="space-y-6"><Notice tone="info" title="Tipo de cadastro selecionado">Você está criando uma conta como <strong className="capitalize">{isOrganizationRole ? `organização (${organizationLabel})` : role}</strong>.</Notice><div aria-label={`Etapa ${step + 1} de ${steps.length}: ${steps[step]}`} className="flex items-center gap-2 overflow-x-auto pb-1">{steps.map((item, index) => <div key={item} className="flex items-center gap-2 whitespace-nowrap"><span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${index < step ? "bg-[#32c700] text-[#12306f]" : index === step ? "bg-[#2f63e5] text-white" : "bg-muted text-muted-foreground"}`}>{index < step ? <Check size={14}/> : index + 1}</span>{index < steps.length - 1 && <span className="h-px w-5 bg-border"/>}</div>)}</div>{(errors.email || errors.document) && <Notice tone="error" title="Revise os dados informados"><a href={errors.email ? (isOrganizationRole ? "#register-master-email" : "#register-email") : "#register-document"} className="underline">Há campos com erro nesta etapa. Vá ao primeiro campo com erro.</a></Notice>}{backendError && <Notice tone="error" title="Não foi possível concluir o cadastro">{backendError}</Notice>}{final && (weakPassword || mismatchPassword) && <Notice tone="error" title="Revise a senha"><a href={weakPassword ? "#register-password" : "#register-password-confirm"} className="underline">A senha informada precisa de ajustes antes de avançar.</a></Notice>}

    {step === 0 && <div className="space-y-4">{isOrganizationRole ? <><Notice tone="info" title="Usuário master">Este usuário master terá acesso a todos os privilégios da organização.</Notice><Field id="register-master-name" label="Nome do usuário master" value={values.masterName} onChange={value => setValue("masterName", value)} required/><div className="grid gap-3 sm:grid-cols-2"><Field id="register-master-cpf" label="CPF do usuário master" value={values.masterCpf} onChange={value => setValue("masterCpf", maskDocument(value, false))} required/><Field id="register-master-email" label="E-mail do usuário master" type="email" value={values.masterEmail} onChange={value => setValue("masterEmail", value)} error={errors.email} required/></div><Field id="register-office-name" label={`Nome da ${organizationLabel}`} value={values.company} onChange={value => setValue("company", value)} placeholder="Como sua organização e conhecida?" required/><Field id="register-document" label="CNPJ" value={values.document} onChange={value => setValue("document", maskDocument(value, true))} error={errors.document} hint="Digite apenas números; a máscara é aplicada automaticamente." required/><Field id="register-phone" label="Telefone principal" value={values.phone} onChange={value => setValue("phone", maskPhone(value))} placeholder="(00) 00000-0000" required/></> : <><Field id="register-name" label="Nome completo" value={values.name} onChange={value => setValue("name", value)} placeholder="Como devemos chamar você?" required/><Field id="register-email" label="E-mail profissional" type="email" value={values.email} onChange={value => setValue("email", value)} error={errors.email} required/><Field id="register-cpf" label="CPF" value={values.cpf} onChange={value => setValue("cpf", maskDocument(value, false))} required/><Field id="register-phone" label="Telefone com WhatsApp" value={values.phone} onChange={value => setValue("phone", maskPhone(value))} placeholder="(00) 00000-0000" required/></>}{role === "despachante" && <fieldset className="rounded-xl border border-border p-4"><legend className="px-1 text-sm font-semibold">Formalização</legend><div className="mt-2 flex gap-3"><label className="flex min-h-11 items-center gap-2"><input checked={values.entity !== "Com CNPJ"} onChange={() => setValue("entity", "Sem CNPJ")} type="radio" name="dispatcher-entity" className="size-4 accent-[#2f63e5]"/>Sem CNPJ</label><label className="flex min-h-11 items-center gap-2"><input checked={values.entity === "Com CNPJ"} onChange={() => setValue("entity", "Com CNPJ")} type="radio" name="dispatcher-entity" className="size-4 accent-[#2f63e5]"/>Com CNPJ</label></div></fieldset>}</div>}

    {step === 1 && <div className="space-y-4">{role === "advogado" && <><Field id="register-oab" label="Número da OAB" value={values.oab} onChange={value => setValue("oab", value.replace(/\D/g, "").slice(0, 8))} required/><Field id="register-section" label="Seccional" value={values.section} onChange={value => setValue("section", value.toUpperCase().slice(0, 2))} placeholder="Ex.: SP" required/><Field id="register-address" label="Endereço individual" value={values.address} onChange={value => setValue("address", value)} placeholder="Rua, número, bairro, cidade/UF" required/></>}{isOrganizationRole && <><Notice tone="info" title="Endereco da organização">Preencha o endereço com campos estruturados para facilitar validações e integrações futuras.</Notice><Field id="register-zip" label="CEP" value={values.zipCode} onChange={value => setValue("zipCode", value.replace(/\D/g, "").slice(0, 8))} required/><div className="grid gap-3 sm:grid-cols-2"><Field id="register-state" label="UF" value={values.state} onChange={value => setValue("state", value.toUpperCase().slice(0, 2))} required/><Field id="register-city" label="Cidade" value={values.city} onChange={value => setValue("city", value)} required/></div><Field id="register-district" label="Bairro" value={values.district} onChange={value => setValue("district", value)} required/><div className="grid gap-3 sm:grid-cols-[1fr_120px]"><Field id="register-street" label="Logradouro" value={values.street} onChange={value => setValue("street", value)} required/><Field id="register-street-number" label="Numero" value={values.streetNumber} onChange={value => setValue("streetNumber", value.replace(/\D/g, "").slice(0, 6))} required/></div><Field id="register-complement" label="Complemento (opcional)" value={values.complement} onChange={value => setValue("complement", value)} /></>}{role === "despachante" && <><Field id="register-document" label={needsCnpj ? "CNPJ" : "CPF do cadastro"} value={values.document} onChange={changeDocument} error={errors.document} hint="Digite apenas números; a máscara é aplicada automaticamente." required/><Field id="register-area" label="Área de atuação" value={values.company} onChange={value => setValue("company", value)} placeholder="Ex.: documentação veicular" required/><Field id="register-address" label="Endereço individual" value={values.address} onChange={value => setValue("address", value)} placeholder="Rua, número, bairro, cidade/UF" required/></>}{role === "cliente" && <><Field id="register-document" label="CPF ou CNPJ" value={values.document} onChange={changeDocument} error={errors.document} required/><Field id="register-company" label="Empresa (opcional)" value={values.company} onChange={value => setValue("company", value)} /><Field id="register-address" label="Endereço individual" value={values.address} onChange={value => setValue("address", value)} placeholder="Rua, número, bairro, cidade/UF" required/></>}</div>}

    {isOrganizationRole && step === 2 && <div className="space-y-4"><Notice tone="info" title="Equipe opcional">Você pode concluir o cadastro da organização agora e montar a equipe depois, sem bloquear acesso.</Notice><fieldset className="rounded-xl border border-border p-4"><legend className="px-1 text-sm font-semibold">Deseja cadastrar equipe neste momento?</legend><div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-5"><label className="flex min-h-11 items-center gap-2"><input checked={values.createTeamNow} onChange={() => setValue("createTeamNow", true)} type="radio" name="create-team-now" className="size-4 accent-[#2f63e5]"/>Sim, quero cadastrar agora</label><label className="flex min-h-11 items-center gap-2"><input checked={!values.createTeamNow} onChange={() => setValue("createTeamNow", false)} type="radio" name="create-team-now" className="size-4 accent-[#2f63e5]"/>Não, vou cadastrar depois</label></div></fieldset>{!values.createTeamNow && <Notice tone="info" title="Cadastro posterior com mesmo fluxo">Quando você decidir criar a equipe depois, esta mesma jornada será aplicada: inclusão de membros por perfil, validações específicas e definição do representante legal ao final.</Notice>}

    {values.createTeamNow && <><div className="rounded-xl border border-border p-4"><p className="mb-1 text-sm font-semibold">1) Verificar registro existente</p><p className="mb-3 text-xs text-muted-foreground">Digite nome e CPF. Se existir, atribua o perfil e inclua. Se não existir, faça novo cadastro.</p><div className="grid gap-3 sm:grid-cols-2"><Field id="lookup-member-name" label="Nome" value={lookupName} onChange={setLookupName} placeholder="Nome do membro"/><Field id="lookup-member-cpf" label="CPF" value={lookupCpf} onChange={value => setLookupCpf(maskDocument(value, false))} placeholder="000.000.000-00"/></div><div className="mt-3"><div className="space-y-1.5"><label htmlFor="lookup-member-profile" className="block text-sm font-semibold">Perfil na equipe</label><select id="lookup-member-profile" value={lookupProfile} onChange={(event) => setLookupProfile(event.target.value as TeamProfile)} className="min-h-12 w-full rounded-xl border border-border bg-card px-3.5 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]"><option value="advogado">Advogado</option><option value="colaborador">Colaborador</option><option value="gestor">Gestor</option></select></div></div>{lookupBusy && <p className="mt-3 text-sm text-muted-foreground">Verificando registro...</p>}{lookupStatus && <div className="mt-3"><Notice tone={lookupStatus.tone} title="Resultado da verificação">{lookupStatus.text}</Notice></div>}{lookupCandidate && <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3"><p className="font-semibold">{lookupCandidate.name}</p><p className="text-sm text-muted-foreground">{lookupCandidate.email}</p><div className="mt-3"><Button secondary onClick={addLookupCandidate}>Adicionar registro encontrado</Button></div></div>}</div>

    {!lookupCandidate && hasLookupQuery && !lookupBusy && <Notice tone="info" title="Novo cadastro liberado">Nenhum registro encontrado. Você pode seguir com novo cadastro deste membro.</Notice>}

    <div className="grid gap-2 sm:grid-cols-3"><Button secondary onClick={() => addManualTeamMember("advogado")}>Adicionar advogado</Button><Button secondary onClick={() => addManualTeamMember("colaborador")}>Adicionar colaborador</Button><Button secondary onClick={() => addManualTeamMember("gestor")}>Adicionar gestor</Button></div>{values.teamMembers.length > 0 && <div className="rounded-xl border border-border p-4"><p className="mb-2 text-sm font-semibold">Representante legal</p><p className="mb-3 text-xs text-muted-foreground">Depois de incluir os membros, escolha quem sera o representante legal da organização.</p><select value={values.legalRepresentativeEmail} onChange={(event) => setValue("legalRepresentativeEmail", event.target.value)} className="min-h-12 w-full rounded-xl border border-border bg-card px-3.5 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]"><option value="">Selecione um membro</option>{values.teamMembers.filter((member) => member.email).map((member, index) => <option key={`${member.email}-${index}`} value={member.email}>{`${member.name || "Sem nome"} - ${member.roleTitle || member.profile}`}</option>)}</select></div>}

    {values.teamMembers.map((member, index) => <div key={`${member.email}-${index}`} className="space-y-3 rounded-xl border border-border p-4"><div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><label htmlFor={`member-profile-${index}`} className="block text-sm font-semibold">Perfil</label><select id={`member-profile-${index}`} value={member.profile} onChange={(event) => setTeamMember(index, "profile", event.target.value as TeamProfile)} className="min-h-12 w-full rounded-xl border border-border bg-card px-3.5 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]"><option value="advogado">Advogado</option><option value="colaborador">Colaborador</option><option value="gestor">Gestor</option></select></div><Field id={`member-role-${index}`} label="Cargo" value={member.roleTitle} onChange={value => setTeamMember(index, "roleTitle", value)} required/></div><Field id={`member-name-${index}`} label="Nome" value={member.name} onChange={value => setTeamMember(index, "name", value)} required/><Field id={`member-email-${index}`} label="E-mail" type="email" value={member.email} onChange={value => setTeamMember(index, "email", value)} required/><div className="grid gap-3 sm:grid-cols-2"><Field id={`member-cpf-${index}`} label="CPF" value={member.cpf} onChange={value => setTeamMember(index, "cpf", maskDocument(value, false))} required/><Field id={`member-phone-${index}`} label="Telefone" value={member.phone} onChange={value => setTeamMember(index, "phone", maskPhone(value))} placeholder="(00) 00000-0000" required={member.profile === "colaborador"}/></div>{member.profile === "advogado" && <div className="grid gap-3 sm:grid-cols-2"><Field id={`member-oab-${index}`} label="Número da OAB" value={member.oab} onChange={value => setTeamMember(index, "oab", value.replace(/\D/g, "").slice(0, 8))} required/><Field id={`member-section-${index}`} label="Seccional" value={member.section} onChange={value => setTeamMember(index, "section", value.toUpperCase().slice(0, 2))} placeholder="Ex.: SP" required/></div>}<Button secondary onClick={() => { const nextMembers = values.teamMembers.filter((_, current) => current !== index); setValue("teamMembers", nextMembers); if (values.legalRepresentativeEmail && !nextMembers.some((candidate) => candidate.email.toLowerCase() === values.legalRepresentativeEmail.toLowerCase())) { setValue("legalRepresentativeEmail", ""); } }}>Remover membro</Button></div>)}</>}</div>}

    {final && <div className="space-y-4"><Notice tone="info" title="Segurança e confirmação">Defina sua senha e escolha o canal para confirmar o cadastro.</Notice><Field id="register-password" label="Crie uma senha" type="password" value={values.password} onChange={value => setValue("password", value)} error={weakPassword ? "Sua senha está fraca. Use no mínimo 10 caracteres." : ""} hint="Use letras, números e símbolo para maior segurança." required/><Field id="register-password-confirm" label="Confirmar senha" type="password" value={values.passwordConfirmation} onChange={value => setValue("passwordConfirmation", value)} error={mismatchPassword ? "As senhas não coincidem." : ""} required/><fieldset className="rounded-xl border border-border p-4"><legend className="px-1 text-sm font-semibold">Canal de confirmação</legend><div className="mt-2 grid gap-2"><label className="flex min-h-11 items-center gap-2"><input checked={values.verificationChannel === "email"} onChange={() => setValue("verificationChannel", "email")} type="radio" name="verification-channel" className="size-4 accent-[#2f63e5]"/>Confirmar por e-mail</label><label className="flex min-h-11 items-center gap-2"><input checked={values.verificationChannel === "whatsapp"} onChange={() => setValue("verificationChannel", "whatsapp")} type="radio" name="verification-channel" className="size-4 accent-[#2f63e5]"/>Confirmar por WhatsApp</label></div></fieldset><label className="flex min-h-11 gap-3 text-sm leading-5 text-muted-foreground"><input checked={values.terms} onChange={event => setValue("terms", event.target.checked)} type="checkbox" className="mt-1 size-4 accent-[#2f63e5]"/>Li e aceito os Termos de Uso e a Política de Privacidade.</label><label className="flex min-h-11 gap-3 text-sm leading-5 text-muted-foreground"><input checked={values.messages} onChange={event => setValue("messages", event.target.checked)} type="checkbox" className="mt-1 size-4 accent-[#2f63e5]"/>Autorizo comunicações operacionais sobre meus processos e solicitações.</label></div>}

    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between"><Button secondary onClick={() => step ? setStep(step - 1) : setRole("")}>Voltar</Button><Button type="submit" disabled={submitting || (final && (!values.terms || !values.password || !values.passwordConfirmation || weakPassword || mismatchPassword))}>{final ? <>{submitting ? "Enviando..." : "Criar e enviar confirmação"}<Mail size={18}/></> : <>Continuar<ArrowRight size={18}/></>}</Button></div></form>}</Shell>;
}
function Verify({ id, go, notify, verification }: { id: string; go: (view: View) => void; notify: (m: string) => void; verification: { channel: VerificationChannel; destination: string; url: string } }) {
  const channelLabel = verification.channel === "whatsapp" ? "WhatsApp" : "e-mail";
  const title = verification.channel === "whatsapp" ? "Confirme seu cadastro pelo WhatsApp para ativar seu espaço." : "Confirme seu e-mail para ativar seu espaço.";
  return <Shell eyebrow="Verificação de cadastro" title={title}><div className="space-y-6"><Notice tone="success" title="Cadastro criado com sucesso">Enviamos um link de confirmação por {channelLabel}. Ele é necessário para ativar sua conta.</Notice>{verification.destination && <Notice tone="info" title="Canal selecionado">Destino: <strong>{verification.destination}</strong></Notice>}{verification.url && <div className="rounded-2xl border border-border bg-muted/50 p-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">Link de confirmação (ambiente local)</p><p className="mt-3 break-all text-sm font-medium text-[#2f63e5]">{verification.url}</p><div className="mt-3"><Button secondary onClick={() => { void navigator.clipboard.writeText(verification.url); notify("Link de confirmação copiado."); }}><Copy size={17}/>Copiar link</Button></div></div>}<div className="rounded-2xl border border-border bg-muted/50 p-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">Seu identificador público</p><div className="mt-3 flex items-center justify-between gap-3"><code className="font-mono text-xl font-medium text-[#2f63e5]">{id}</code><Button secondary onClick={() => notify("ID copiado para a área de transferência")}> <Copy size={17}/>Copiar ID</Button></div><p className="mt-3 text-sm leading-5 text-muted-foreground">Este código pode ser utilizado em atendimentos e convites. Ele não substitui sua senha.</p></div><Button className="w-full" onClick={() => go("onboarding")}>Já confirmei meu cadastro<ChevronRight size={18}/></Button><button onClick={() => notify(`Solicitação de reenvio por ${channelLabel} registrada.`)} className="min-h-11 w-full text-sm font-semibold text-[#2f63e5] hover:underline">Reenviar confirmação</button><button onClick={() => go("login")} className="min-h-11 w-full text-sm font-semibold text-muted-foreground hover:underline">Voltar ao login</button></div></Shell>;
}
function RecoveryRequest({ go }: { go: (view: View) => void }) { const [email, setEmail] = useState(""); const [sent, setSent] = useState(false); return <Shell eyebrow="Recuperação de senha" title={sent ? "Confira seu e-mail." : "Recupere o acesso à sua conta."} back={() => go("login")}><div className="space-y-6">{sent ? <><Notice tone="success" title="Solicitação registrada">Caso exista uma conta associada a este e-mail, enviaremos as instruções de recuperação.</Notice><p className="text-sm leading-6 text-muted-foreground">Para validar o protótipo, escolha o estado do link recebido.</p><div className="grid gap-3 sm:grid-cols-3"><Button secondary onClick={() => go("recovery-reset")}>Link válido</Button><Button secondary onClick={() => go("recovery-expired")}>Expirado</Button><Button secondary onClick={() => go("recovery-used")}>Já utilizado</Button></div><button onClick={() => setSent(false)} className="min-h-11 text-sm font-semibold text-[#2f63e5] hover:underline">Solicitar novo link</button></> : <form className="space-y-5" onSubmit={event => { event.preventDefault(); setSent(true); }}><p className="text-base leading-6 text-muted-foreground">Informe seu e-mail. Por segurança, a resposta será sempre neutra.</p><Field id="recovery-email" label="E-mail" type="email" value={email} onChange={setEmail} required/><Button type="submit" className="w-full">Enviar instruções<Send size={18}/></Button></form>}</div></Shell>; }
function RecoveryProblem({ kind, go }: { kind: "expired" | "used"; go: (view: View) => void }) { const expired = kind === "expired"; return <Shell eyebrow={`Recuperação de senha · link ${expired ? "expirado" : "já utilizado"}`} title={expired ? "Este link expirou." : "Este link já foi utilizado."} back={() => go("login")}><div className="space-y-6"><Notice tone="warning" title={expired ? "Link fora da validade" : "Link indisponível"}>{expired ? "Por segurança, os links de recuperação têm prazo limitado." : "Para sua segurança, cada link pode ser usado uma única vez."}</Notice><Button className="w-full" onClick={() => go("recovery-request")}>Solicitar novo link<RefreshIcon/></Button><Button secondary className="w-full" onClick={() => go("login")}>Voltar ao login</Button></div></Shell>; }
function RefreshIcon() { return <LoaderCircle size={18}/> }
function RecoveryReset({ go, notify }: { go: (view: View) => void; notify: (m: string) => void }) { const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [done, setDone] = useState(false); const weak = password.length > 0 && password.length < 10; const mismatch = confirm.length > 0 && password !== confirm; return <Shell eyebrow="Recuperação de senha · link válido" title={done ? "Senha alterada com sucesso." : "Crie uma nova senha."} back={() => go("login")}><div className="space-y-6">{done ? <><Notice tone="success" title="Alteração concluída">Use sua nova senha para entrar com segurança.</Notice><Button className="w-full" onClick={() => { notify("Senha alterada. Faça login para continuar."); go("login"); }}>Voltar ao login<ArrowRight size={18}/></Button></> : <form className="space-y-5" onSubmit={event => { event.preventDefault(); if (!weak && !mismatch) setDone(true); }}><Notice title="Dica de segurança">Use 10 ou mais caracteres, com letras, números e símbolo.</Notice>{(weak || mismatch) && <Notice tone="error" title="Revise os campos de senha"><a href={weak ? "#new-password" : "#confirm-password"} className="underline">Há informações que precisam de correção.</a></Notice>}<Field id="new-password" label="Nova senha" type="password" value={password} onChange={setPassword} error={weak ? "Sua senha ainda está fraca. Use 10 ou mais caracteres." : ""} required/><Field id="confirm-password" label="Confirmar nova senha" type="password" value={confirm} onChange={setConfirm} error={mismatch ? "As senhas não coincidem." : ""} required/><Button type="submit" disabled={!password || !confirm || weak || mismatch} className="w-full">Salvar nova senha<KeyRound size={18}/></Button></form>}</div></Shell>; }
function Onboarding({ go, session, onLogout }: { go: (view: View) => void; session: { name: string; roleLabel: string }; onLogout: () => void }) {
  const actions = [
    [FilePlus2, "Criar meu primeiro processo", "Inicie uma demanda com dados essenciais.", "processes"],
    [UserPlus, "Convidar cliente ou parte", "Envie um convite seguro agora.", "invite"],
    [UsersRound, "Gestao Documental Inteligente", "Solicite, valide e acompanhe documentos em fluxo.", "documents"],
    [ShieldCheck, "Assinaturas Eletronicas", "Inicie fluxos de assinatura sem sair do BureauFlow.", "signatures"],
    [Bot, "BureauIA", "Automatize analise documental com OCR, alertas e insights.", "bureauia"],
    [ShieldCheck, "Conhecer a plataforma", "Faca uma breve visita guiada.", "dashboard"],
  ] as const;

  return <Shell eyebrow="Primeiro acesso e onboarding" title="Como deseja começar?" asideAction={<button onClick={onLogout} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/35 bg-white/12 px-4 text-sm font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"><LogOut size={16}/>sair</button>}><div className="rounded-2xl border border-border bg-card p-4"><div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><span>Inicie com uma das opcoes abaixo, ou</span><Button secondary onClick={() => go("dashboard")}>Quero ir para o painel</Button></div></div><div className="mt-4 grid gap-3">{actions.map(([Icon, title, text, destination]) => <button key={title} onClick={() => go(destination)} className="group flex min-h-[76px] items-center gap-4 rounded-2xl border border-border p-4 text-left transition hover:border-[#9cb4ff] hover:bg-[#f8faff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed] motion-reduce:transition-none"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eef3ff] text-[#2f63e5]"><Icon size={21}/></span><span className="min-w-0 flex-1"><span className="block font-semibold">{title}</span><span className="mt-0.5 block text-sm text-muted-foreground">{text}</span></span><ChevronRight size={20} className="text-muted-foreground group-hover:text-[#2f63e5]"/></button>)}</div></Shell>;
}
function Invitation({ values, setValue, status, setStatus, go, notify, token }: { values: Invite; setValue: <K extends keyof Invite>(k: K, v: Invite[K]) => void; status: InviteStatus; setStatus: (s: InviteStatus) => void; go: (view: View) => void; notify: (m: string) => void; token: string }) { const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [acceptanceUrl, setAcceptanceUrl] = useState(""); const active = values.emailChannel || values.whatsappChannel || values.linkChannel; const sendInvite = async () => { if (!token) throw new Error("Sessão sem token. Faça login novamente para enviar convites."); const expiresAt = new Date(`${values.expiry}T23:59:59.000Z`).toISOString(); const response = await api<{ status: InviteStatus; acceptanceUrl: string }>("/invitations", { method: "POST", token, body: JSON.stringify({ name: values.name, email: values.email, invitedRole: values.invitedRole, message: values.message, expiresAt }) }); setStatus(response.status); setAcceptanceUrl(response.acceptanceUrl); }; return <Shell eyebrow="Fluxo de convite" title={sent ? "Convite enviado com sucesso" : "Convide uma parte para acompanhar."} back={() => sent ? setSent(false) : go("onboarding")}><div className="space-y-6">{sent ? <><Notice tone="success" title="Convite enviado com sucesso">A pessoa convidada receberá as instruções pelos canais selecionados.</Notice><div className="rounded-2xl border border-border p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{values.name || "Parte convidada"}</p><p className="text-sm text-muted-foreground">{values.email || "Sem e-mail informado"}</p></div><StatusBadge status={status}/></div>{acceptanceUrl && <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3"><p className="text-xs font-semibold uppercase tracking-[.1em] text-muted-foreground">Link de aceite (ambiente local)</p><p className="mt-1 break-all text-sm text-[#2f63e5]">{acceptanceUrl}</p><Button secondary className="mt-2" onClick={() => { void navigator.clipboard.writeText(acceptanceUrl); notify("Link de convite copiado."); }}><Copy size={16}/>Copiar link</Button></div>}<div className="mt-4 flex flex-wrap gap-2">{(["enviado", "visualizado", "aceito", "expirado", "cancelado"] as InviteStatus[]).map(item => <button key={item} onClick={() => setStatus(item)} className={`min-h-11 rounded-lg border px-3 text-xs font-semibold capitalize focus-visible:outline-2 focus-visible:outline-[#7c3aed] ${status === item ? "border-[#2f63e5] bg-[#eef3ff] text-[#193eaf]" : "border-border text-muted-foreground"}`}>{item}</button>)}</div></div>{status === "expirado" && <Notice tone="warning" title="Este convite expirou">Envie um novo convite para permitir o acesso.</Notice>}{status === "cancelado" && <Notice tone="error" title="Este convite foi cancelado">Crie um novo convite se a pessoa ainda precisar de acesso.</Notice>}{status === "aceito" && <Notice tone="success" title="Convite aceito">A pessoa agora pode acessar os itens compartilhados.</Notice>}<Button className="w-full" onClick={() => go("dashboard")}>Concluir<ArrowRight size={18}/></Button></> : <form onSubmit={async (event) => { event.preventDefault(); setError(""); try { setBusy(true); await sendInvite(); setSent(true); notify("Convite enviado com sucesso."); } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível enviar o convite."); } finally { setBusy(false); } }} className="space-y-5"><p className="text-base leading-6 text-muted-foreground">Defina a relação, os canais e a validade antes de enviar.</p>{error && <Notice tone="error" title="Falha ao enviar convite">{error}</Notice>}<div className="grid gap-4 sm:grid-cols-2"><Field id="invite-name" label="Nome" value={values.name} onChange={value => setValue("name", value)} required/><Field id="invite-email" label="E-mail" type="email" value={values.email} onChange={value => setValue("email", value)} required/></div><div className="grid gap-4 sm:grid-cols-2"><Field id="invite-whatsapp" label="WhatsApp" value={values.whatsapp} onChange={value => setValue("whatsapp", maskPhone(value))} placeholder="(00) 00000-0000"/><div className="space-y-1.5"><label htmlFor="invite-entity" className="block text-sm font-semibold">Pessoa</label><select id="invite-entity" value={values.entity} onChange={event => setValue("entity", event.target.value as Invite["entity"])} className="min-h-12 w-full rounded-xl border border-border bg-card px-3.5 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]"><option>Pessoa física</option><option>Pessoa jurídica</option></select></div></div><div className="grid gap-4 sm:grid-cols-2"><Field id="invite-role" label="Tipo de conta convidada" value={values.invitedRole} onChange={value => setValue("invitedRole", value as Invite["invitedRole"])} required/><Field id="invite-relation" label="Relação esperada" value={values.relation} onChange={value => setValue("relation", value)} required/></div><div className="grid gap-4 sm:grid-cols-2"><Field id="invite-process" label="Processo relacionado (opcional)" value={values.process} onChange={value => setValue("process", value)} placeholder="Buscar processo"/><Field id="invite-expiry" label="Validade do convite" type="date" value={values.expiry} onChange={value => setValue("expiry", value)} required/></div><Field id="invite-message" label="Mensagem personalizada" value={values.message} onChange={value => setValue("message", value)}/><fieldset><legend className="text-sm font-semibold">Canais de envio</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{([{ key: "emailChannel", label: "E-mail", icon: Mail }, { key: "whatsappChannel", label: "WhatsApp", icon: MessageCircle }, { key: "linkChannel", label: "Copiar link", icon: Link2 }] as const).map(channel => { const Icon = channel.icon; return <label key={channel.key} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${values[channel.key] ? "border-[#2f63e5] bg-[#eef3ff] text-[#193eaf]" : "border-border"}`}><input type="checkbox" checked={values[channel.key]} onChange={event => setValue(channel.key, event.target.checked)} className="size-4 accent-[#2f63e5]"/><Icon size={16}/>{channel.label}</label>; })}</div></fieldset>{!active && <Notice tone="error" title="Escolha pelo menos um canal">Selecione e-mail, WhatsApp ou copiar link para continuar.</Notice>}<Button type="submit" className="w-full" disabled={!active || busy}>{busy ? <><LoaderCircle size={16} className="animate-spin"/>Enviando convite...</> : <>Enviar convite<Send size={18}/></>}</Button></form>}</div></Shell>; }

function AcceptInvitation({ go, notify, token }: { go: (view: View) => void; notify: (m: string) => void; token: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const weak = password.length > 0 && password.length < 10;
  const mismatch = confirm.length > 0 && password !== confirm;

  useEffect(() => {
    let mounted = true;
    if (!token) return;
    void (async () => {
      try {
        const preview = await api<{ name: string; email: string }>(`/invitations/${token}`);
        if (!mounted) return;
        setEmail(preview.email);
        setName(preview.name);
      } catch (error) {
        if (!mounted) return;
        setPreviewError(error instanceof Error ? error.message : "Não foi possível carregar o convite.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || weak || mismatch) return;
    try {
      setLoading(true);
      await api<{ message: string }>(`/invitations/${token}/accept`, {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      notify("Convite aceito com sucesso.");
      window.history.replaceState({}, "", window.location.pathname);
      go("onboarding");
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Não foi possível aceitar o convite.");
    } finally {
      setLoading(false);
    }
  };

  return <Shell eyebrow="Convite recebido" title="Concluir cadastro para acessar" back={() => go("login")}><form className="space-y-5" onSubmit={submit}><Notice title="Dados do convite bloqueados">O e-mail convidado e o identificador do convite são preenchidos automaticamente e não podem ser alterados.</Notice>{!token && <Notice tone="warning" title="Token de convite ausente">Abra esta tela pelo link de convite para concluir o cadastro.</Notice>}{previewError && <Notice tone="error" title="Falha no convite">{previewError}</Notice>}<Field id="accept-token" label="Código do convite" value={token || "Sem token"} onChange={() => undefined}/><Field id="accept-email" label="E-mail convidado" type="email" value={email} onChange={() => undefined}/><Field id="accept-name" label="Seu nome" value={name} onChange={setName} required/><Field id="accept-password" label="Crie uma senha" type="password" value={password} onChange={setPassword} error={weak ? "Sua senha ainda está fraca. Use 10 ou mais caracteres." : ""} required/><Field id="accept-confirm" label="Confirmar senha" type="password" value={confirm} onChange={setConfirm} error={mismatch ? "As senhas não coincidem." : ""} required/><Button type="submit" className="w-full" disabled={!token || !name || !email || !password || !confirm || weak || mismatch || loading}>{loading ? <><LoaderCircle size={16} className="animate-spin"/>Aceitando convite...</> : <>Aceitar convite<Check size={18}/></>}</Button></form></Shell>;
}
function StatusBadge({ status }: { status: InviteStatus }) { const styles: Record<InviteStatus, string> = { enviado: "bg-[#eef3ff] text-[#193eaf]", visualizado: "bg-[#f2edff] text-[#6331bc]", aceito: "bg-[#edf9ea] text-[#196515]", expirado: "bg-[#fff4df] text-[#8a5b00]", cancelado: "bg-[#fff0ef] text-[#a12a21]" }; return <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${styles[status]}`}>{status}</span>; }
function Dashboard({ id, go, notify }: { id: string; go: (view: View) => void; notify: (m: string) => void }) {
  const [activePanel, setActivePanel] = useState<"processos" | "convites" | "documentos">("processos");

  const cardData = {
    processos: {
      title: "Processos ativos",
      total: "12",
      meta: "+2 esta semana",
      items: [
        "TRB-2026-0019 ï¿½ Revisï¿½o de inicial trabalhista",
        "LIC-2026-0071 ï¿½ Acompanhamento de licitaï¿½ï¿½o",
        "FAM-2026-0112 ï¿½ Inventï¿½rio em andamento",
        "IMO-2026-0099 ï¿½ Regularizaï¿½ï¿½o de imï¿½vel",
      ],
    },
    convites: {
      title: "Convites pendentes",
      total: "03",
      meta: "1 expira amanhï¿½",
      items: [
        "Marina Costa ï¿½ Enviado por e-mail ï¿½ Expira em 24h",
        "Grupo Atlante ï¿½ Visualizado ï¿½ Aguardando aceite",
        "Carlos Matos ï¿½ Link copiado ï¿½ Aguardando primeiro acesso",
      ],
    },
    documentos: {
      title: "Documentos",
      total: "48",
      meta: "Todos organizados",
      items: [
        "18 pendentes de envio",
        "11 em anï¿½lise jurï¿½dica",
        "14 aprovados",
        "5 arquivados",
      ],
    },
  } as const;

  const active = cardData[activePanel];

  return <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8"><div className="grid gap-6 lg:grid-cols-[260px_1fr]"><aside className="rounded-2xl bg-[#10275b] p-5 text-white"><Logo/><p className="mt-8 font-mono text-[11px] uppercase tracking-[.14em] text-[#aebfff]">Espaco de trabalho</p><nav className="mt-3 space-y-1"><button className="flex min-h-11 w-full items-center rounded-lg bg-white/12 px-3 text-left text-sm font-semibold">Visao geral</button><button onClick={() => go("processes")} className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm text-[#c6d2ff]">Processos</button><button className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm text-[#c6d2ff]">Clientes</button><button onClick={() => go("documents")} className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm text-[#c6d2ff]">Documentos</button><button onClick={() => go("signatures")} className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm text-[#c6d2ff]">Assinaturas</button><button onClick={() => go("bureauia")} className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm text-[#c6d2ff]">BureauIA</button><button onClick={() => go("auditoria")} className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm text-[#c6d2ff]">Auditoria</button></nav><button onClick={() => go("login")} className="mt-8 flex min-h-11 w-full items-center justify-center rounded-lg border border-white/30 bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-[#7c3aed]">Sair</button></aside><div><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-muted-foreground">Visao geral</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.03em]">Bom dia, Paulina.</h1></div><div className="flex items-center gap-2"><Button secondary onClick={() => go("onboarding")}>Voltar ao inicio</Button><Button onClick={() => go("processes")}><Plus size={17}/>Novo processo</Button></div></div><div className="mt-7 grid gap-4 md:grid-cols-3">{(["processos", "convites", "documentos"] as const).map((key) => <button key={key} onClick={() => setActivePanel(key)} className={`rounded-2xl border bg-card p-5 text-left transition hover:border-[#9cb4ff] focus-visible:outline-2 focus-visible:outline-[#7c3aed] ${activePanel === key ? "border-[#2f63e5] shadow-[0_8px_18px_rgba(47,99,229,.15)]" : "border-border"}`}><p className="text-sm text-muted-foreground">{cardData[key].title}</p><p className="mt-4 text-3xl font-semibold tracking-[-.03em]">{cardData[key].total}</p><p className="mt-2 text-xs font-semibold text-[#21811e]">{cardData[key].meta}</p></button>)}</div><div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_.9fr]"><div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Lista dinamica - {active.title}</h2><span className="rounded-full bg-[#eef3ff] px-2.5 py-1 text-xs font-bold text-[#193eaf]">Atualizado ao clicar no card</span></div><div className="mt-4 space-y-3">{active.items.map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-3"><span className="grid size-8 place-items-center rounded-lg bg-[#eef3ff] text-[#2f63e5]"><Check size={16}/></span><span className="text-sm font-medium">{item}</span></div>)}</div></div><div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">Identificador publico</p><code className="mt-5 block font-mono text-lg font-medium text-[#2f63e5]">{id}</code><Button secondary className="mt-5 w-full" onClick={() => notify("ID copiado para a area de transferencia")}><Copy size={16}/>Copiar ID</Button><p className="mt-3 text-xs leading-5 text-muted-foreground">Use em atendimentos e convites. Nao substitui sua senha.</p></div></div></div></div></section>;
}
function DashboardV2({ id, go, notify, session, onLogout }: { id: string; go: (view: View) => void; notify: (m: string) => void; session: { name: string; roleLabel: string }; onLogout: () => void }) {
  const [activePanel, setActivePanel] = useState<"processos" | "convites" | "documentos">("processos");
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  const menuItems: Array<{ label: string; icon: ReactNode; action?: () => void; active?: boolean }> = [
    { label: "Visao geral", icon: <LayoutDashboard size={17} />, active: true },
    { label: "Processos", icon: <FolderKanban size={17} />, action: () => go("processes") },
    { label: "Clientes", icon: <Users size={17} />, action: () => go("invite") },
    { label: "Documentos", icon: <FileText size={17} />, action: () => go("documents") },
    { label: "Assinaturas", icon: <Signature size={17} />, action: () => go("signatures") },
    { label: "BureauIA", icon: <Sparkles size={17} />, action: () => go("bureauia") },
    { label: "Auditoria", icon: <Shield size={17} />, action: () => go("auditoria") },
  ];

  const cardData = {
    processos: {
      title: "Processos ativos",
      total: "12",
      meta: "+2 esta semana",
      items: [
        "TRB-2026-0019 - Revisao de inicial trabalhista",
        "LIC-2026-0071 - Acompanhamento de licitacao",
        "FAM-2026-0112 - Inventario em andamento",
        "IMO-2026-0099 - Regularizacao de imovel",
      ],
    },
    convites: {
      title: "Convites pendentes",
      total: "03",
      meta: "1 expira amanha",
      items: [
        "Marina Costa - Enviado por e-mail - Expira em 24h",
        "Grupo Atlante - Visualizado - Aguardando aceite",
        "Carlos Matos - Link copiado - Aguardando primeiro acesso",
      ],
    },
    documentos: {
      title: "Documentos",
      total: "48",
      meta: "Todos organizados",
      items: ["18 pendentes de envio", "11 em analise juridica", "14 aprovados", "5 arquivados"],
    },
  } as const;

  const active = cardData[activePanel];

  return <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8"><div className="grid gap-6" style={{ gridTemplateColumns: menuCollapsed ? "90px 1fr" : "280px 1fr" }}><aside className="rounded-2xl bg-[#10275b] p-4 text-white"><div className="relative mb-3 flex items-center justify-end">{!menuCollapsed && <p className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold">Menu de trabalho</p>}<button onClick={() => setMenuCollapsed(current => !current)} className="grid size-9 place-items-center rounded-lg border border-white/20 bg-white/10 hover:bg-white/20" aria-label={menuCollapsed ? "Expandir menu" : "Colapsar menu"}>{menuCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button></div><div className={`mb-3 rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-xs text-[#d6e3ff] ${menuCollapsed ? "hidden" : "block"}`}>Usuario: {session.name} · Perfil: {session.roleLabel}</div><p className={`mb-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#aebfff] ${menuCollapsed ? "text-center" : ""}`}>{menuCollapsed ? "Menu" : "Espaco de trabalho"}</p><nav className="space-y-1">{menuItems.map(item => <button key={item.label} onClick={item.action} className={`flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm ${item.active ? "bg-white/12 font-semibold text-white" : "text-[#c6d2ff] hover:bg-white/8"}`}>{item.icon}{!menuCollapsed && <span className="ml-2">{item.label}</span>}</button>)}</nav><button onClick={onLogout} className={`mt-6 flex min-h-11 w-full items-center rounded-lg border border-[#ffb6b2] bg-[#ffefee] px-3 text-sm font-semibold text-[#9e261d] hover:bg-[#ffe4e2] ${menuCollapsed ? "justify-center" : "justify-center gap-2"}`}><LogOut size={16} />{!menuCollapsed && "Sair"}</button></aside><div><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-muted-foreground">Visao geral</p><h1 className="mt-1 text-3xl font-semibold tracking-[-.03em]">Bom dia, {session.name}.</h1></div><div className="flex items-center gap-2"><Button secondary onClick={() => go("onboarding")}>Voltar ao inicio</Button><Button onClick={() => go("processes")}><Plus size={17}/>Novo processo</Button></div></div><div className="mt-7 grid gap-4 md:grid-cols-3">{(["processos", "convites", "documentos"] as const).map((key) => <button key={key} onClick={() => setActivePanel(key)} className={`rounded-2xl border bg-card p-5 text-left transition hover:border-[#9cb4ff] focus-visible:outline-2 focus-visible:outline-[#7c3aed] ${activePanel === key ? "border-[#2f63e5] shadow-[0_8px_18px_rgba(47,99,229,.15)]" : "border-border"}`}><p className="text-sm text-muted-foreground">{cardData[key].title}</p><p className="mt-4 text-3xl font-semibold tracking-[-.03em]">{cardData[key].total}</p><p className="mt-2 text-xs font-semibold text-[#21811e]">{cardData[key].meta}</p></button>)}</div><div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_.9fr]"><div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Lista dinamica - {active.title}</h2><span className="rounded-full bg-[#eef3ff] px-2.5 py-1 text-xs font-bold text-[#193eaf]">Atualizado ao clicar no card</span></div><div className="mt-4 space-y-3">{active.items.map((item) => <div key={item} className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-3"><span className="grid size-8 place-items-center rounded-lg bg-[#eef3ff] text-[#2f63e5]"><Check size={16}/></span><span className="text-sm font-medium">{item}</span></div>)}</div></div><div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">Identificador publico</p><code className="mt-5 block font-mono text-lg font-medium text-[#2f63e5]">{id}</code><Button secondary className="mt-5 w-full" onClick={() => notify("ID copiado para a area de transferencia")}><Copy size={16}/>Copiar ID</Button><p className="mt-3 text-xs leading-5 text-muted-foreground">Use em atendimentos e convites. Nao substitui sua senha.</p></div></div></div></div></section>;
}
function StateLibrary({ go }: { go: (view: View) => void }) { const variants: Array<[string, string, Tone, string, View]> = [["Carregamento", "Estamos preparando seus dados. Aguarde um instante.", "info", "Aguarde", "login"], ["Salvamento", "Alterações salvas automaticamente.", "success", "Continuar", "register"], ["Erro de validação", "Revise os campos destacados antes de continuar.", "error", "Corrigir cadastro", "register"], ["Erro inesperado", "Não foi possível concluir a ação. Tente novamente.", "error", "Tentar novamente", "login"], ["Sem conexão", "Verifique sua conexão e tente de novo.", "warning", "Tentar novamente", "login"], ["Cadastro incompleto", "Complete as etapas pendentes para ativar sua conta.", "warning", "Continuar cadastro", "register"], ["CPF ou CNPJ já cadastrado", "Este documento já está vinculado a uma conta.", "error", "Entrar ou solicitar suporte", "login"], ["E-mail já cadastrado", "Use outro e-mail ou entre na sua conta.", "error", "Voltar ao login", "login"], ["Convite expirado", "Este convite perdeu a validade. Solicite um novo convite.", "warning", "Solicitar convite", "invite"], ["Convite cancelado", "O convite foi cancelado por quem o enviou.", "error", "Criar novo convite", "invite"], ["Confirmação pendente", "Confirme seu e-mail para ativar o acesso.", "warning", "Reenviar e-mail", "verify"], ["Conta bloqueada", "Seu acesso está temporariamente bloqueado.", "error", "Voltar ao login", "login"], ["Sessão expirada", "Entre novamente para continuar com segurança.", "warning", "Entrar novamente", "login"]]; return <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#6247c8]">Biblioteca de Componentes</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.03em]">Estados e Mensagens</h1><p className="mt-2 text-sm text-muted-foreground">Estados obrigatórios com explicação e próxima ação clara.</p></div><Button secondary onClick={() => go("map")}>Mapa do protótipo<ArrowRight size={17}/></Button></div><div className="grid gap-3 sm:grid-cols-2">{variants.map(([title, text, tone, action, target]) => <div key={title} className="rounded-2xl border border-border bg-card p-4"><Notice tone={tone} title={title}>{text}</Notice><button onClick={() => go(target)} className="mt-3 min-h-11 text-sm font-semibold text-[#2f63e5] hover:underline focus-visible:outline-2 focus-visible:outline-[#7c3aed]">{action}<ArrowRight className="ml-1 inline" size={15}/></button></div>)}</div></section>; }
function PrototypeMap({ go }: { go: (view: View) => void }) { const flows: Array<[string, string, View, string]> = [["Fluxo de cadastro", "Advogado autônomo, escritório com profissional, despachante com e sem CNPJ, empresa e cliente espontâneo.", "register", "01"], ["Cadastro em desktop", "Componente em duas colunas, etapas e autosave visual.", "register", "02"], ["Cadastro em tablet", "Layout responsivo com áreas de toque de 44 px e campos de 16 px.", "register", "03"], ["Cadastro em mobile", "Fluxo em coluna única e ordem de foco linear.", "register", "04"], ["Fluxo de convite", "Cliente ou parte convidada, canais, validade e status.", "invite", "05"], ["Verificação de e-mail", "Confirmação, reenvio e ID público.", "verify", "06"], ["Recuperação de senha", "Solicitação neutra; links válido, expirado e já utilizado.", "recovery-request", "07"], ["Componentes e variações", "Carregamento, salvamento, erros e estados de conta.", "states", "08"]]; return <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#6247c8]">Mapa do protótipo</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.03em]">Conexões e telas nomeadas.</h1><p className="mt-3 max-w-2xl text-base leading-6 text-muted-foreground">Cada cartão abre seu fluxo correspondente. O mapa cobre as rotas para validação pré-backend.</p><ol className="mt-8 grid gap-3">{flows.map(([title, description, target, number]) => <li key={title}><button onClick={() => go(target)} className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition hover:border-[#9cb4ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]"><span className="font-mono text-sm font-medium text-[#7c3aed]">{number}</span><span className="min-w-0 flex-1"><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span></span><ChevronRight size={20} className="text-[#2f63e5]"/></button></li>)}</ol><Button secondary className="mt-6" onClick={() => go("login")}>Voltar ao login</Button></section>; }



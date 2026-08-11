import { useEffect, useId, useState } from "react";
import { Accessibility, ArrowLeft, ArrowRight, Check, CheckCircle2, Copy, Eye, EyeOff, LogIn, Mail, Minus, Plus, Send, UserPlus, Briefcase, Building2, User, FileText, AlertCircle, Loader2, Link2, MessageCircle } from "lucide-react";
import { Session } from "./api";
import brandSheet from "../imports/image.png";

type View = "login" | "howToStart" | "registration" | "verify" | "onboarding" | "invite" | "accept" | "accepted" | "passwordRecovery" | "passwordReset" | "passwordResetSuccess";
type UserType = "lawyer" | "office" | "representative" | "company" | "client";
type RegistrationStep = "access" | "personal" | "professional" | "address" | "security" | "review";
type InviteStatus = "enviado" | "visualizado" | "aceito" | "expirado" | "cancelado";

interface RegistrationData {
  userType: UserType;
  // Dados de acesso
  fullName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
  // Dados pessoais
  cpf: string;
  birthDate: string;
  // Dados profissionais
  oabNumber: string;
  oabSection: string;
  oabType: string;
  professionalEmail: string;
  professionalPhone: string;
  professionalAddress: string;
  specialties: string;
  professionalName: string;
  // Dados da organização
  cnpj: string;
  legalName: string;
  tradeName: string;
  oabRegistration: string;
  institutionalEmail: string;
  institutionalPhone: string;
  whatsapp: string;
  address: string;
  responsibleName: string;
  responsibleCpf: string;
  responsibleRole: string;
  responsibleEmail: string;
  // Representante
  activityType: string;
  serviceRegion: string;
  professionalRegistration: string;
  hasCnpj: boolean;
  // Empresa
  segment: string;
  // Consentimentos
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptOperationalComms: boolean;
  acceptPromotionalComms: boolean;
}

const emptyRegistration: RegistrationData = {
  userType: "lawyer",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirmation: "",
  cpf: "",
  birthDate: "",
  oabNumber: "",
  oabSection: "",
  oabType: "",
  professionalEmail: "",
  professionalPhone: "",
  professionalAddress: "",
  specialties: "",
  professionalName: "",
  cnpj: "",
  legalName: "",
  tradeName: "",
  oabRegistration: "",
  institutionalEmail: "",
  institutionalPhone: "",
  whatsapp: "",
  address: "",
  responsibleName: "",
  responsibleCpf: "",
  responsibleRole: "",
  responsibleEmail: "",
  activityType: "",
  serviceRegion: "",
  professionalRegistration: "",
  hasCnpj: false,
  segment: "",
  acceptTerms: false,
  acceptPrivacy: false,
  acceptOperationalComms: false,
  acceptPromotionalComms: false,
};

function BureauFlowLogo({ compact = false }: { compact?: boolean }) {
  return <span aria-label="BureauFlow" className={`brand-logo ${compact ? "brand-logo-bureauflow-compact" : "brand-logo-bureauflow"}`} style={{ backgroundImage: `url(${brandSheet})` }} />;
}

function FluxHubLogo({ compact = false }: { compact?: boolean }) {
  return <span aria-label="FluxHub" className={`brand-logo ${compact ? "brand-logo-fluxhub-compact" : "brand-logo-fluxhub"}`} style={{ backgroundImage: `url(${brandSheet})` }} />;
}

function Field({ label, value, onChange, type = "text", required = false, placeholder = "", error = "", helper = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string; error?: string; helper?: string }) {
  const inputId = useId();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const password = type === "password";
  return <label htmlFor={inputId} className="grid gap-1.5 text-sm font-bold text-[#1a1a2e]">{label}{required && <span className="text-red-700"> *</span>}<span className="relative"><input id={inputId} type={password && passwordVisible ? "text" : type} value={value} onChange={(event) => onChange(event.target.value)} required={required} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined} className={`min-h-12 w-full rounded-xl border px-3.5 text-base font-medium text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5] ${error ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"} ${password ? "pr-12" : ""}`} />{password && <button type="button" tabIndex={0} onClick={() => setPasswordVisible((visible) => !visible)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPasswordVisible((visible) => !visible); } }} aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"} aria-pressed={passwordVisible} title={passwordVisible ? "Ocultar senha" : "Mostrar senha"} className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-slate-700 hover:text-[#a855f7] hover:bg-slate-100 focus:z-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4f46e5] focus:bg-slate-100 transition-colors">{passwordVisible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}</button>}</span>{error && <p id={`${inputId}-error`} className="text-sm font-semibold text-red-700 flex items-center gap-1"><AlertCircle size={14} />{error}</p>}{helper && !error && <p id={`${inputId}-helper`} className="text-sm text-slate-600">{helper}</p>}</label>;
}

function SidePanel({ largeText, setLargeText, highContrast, setHighContrast }: { largeText: boolean; setLargeText: (value: boolean) => void; highContrast: boolean; setHighContrast: (value: boolean) => void }) {
  return <aside className="relative hidden overflow-hidden bg-[#1a1a2e] p-10 text-white lg:flex lg:flex-col xl:p-12"><div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_40%,rgba(79,70,229,0.15)_0%,transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.1)_0%,transparent_40%)]"/><div className="relative flex h-full flex-col"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-2"><FluxHubLogo compact/><span className="text-sm font-medium text-[#a78bfa]">Aurora Design System</span></div><AccessibilityControls largeText={largeText} setLargeText={setLargeText} highContrast={highContrast} setHighContrast={setHighContrast}/></div><div className="mt-14"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#818cf8]">BureauFlow</p><h2 className="mt-4 max-w-sm text-[2.5rem] font-semibold leading-[1.08] tracking-[-.04em]">O trabalho segue, mesmo entre uma etapa e outra.</h2><p className="mt-5 max-w-sm text-base leading-7 text-[#c4b5fd]">Acompanhe responsabilidades, documentos e decisões em um fluxo com contexto.</p></div><section aria-label="Atividade ao vivo" className="mt-10 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6"><div className="flex items-center justify-between mb-4"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#a78bfa]">Atividade ao vivo</p><span className="inline-flex items-center gap-2 text-xs font-bold text-[#34d399]"><span className="size-2 rounded-full bg-[#34d399] animate-pulse"/>Atualizando</span></div><div className="space-y-4"><div className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10"><div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#4f46e5]/20 flex items-center justify-center"><Mail size={18} className="text-[#818cf8]"/></div><div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-[#a78bfa]">AGORA</p><p className="mt-0.5 font-semibold text-white text-sm truncate">Documento recebido</p><p className="text-xs text-[#c4b5fd]">Processo BF-XXXX-2048</p></div></div><div className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10"><div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#a855f7]/20 flex items-center justify-center"><UserPlus size={18} className="text-[#c084fc]"/></div><div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-[#e9d5ff]">HÁ 4 MIN</p><p className="mt-0.5 font-semibold text-white text-sm truncate">Responsável atribuído</p><p className="text-xs text-[#c4b5fd]">Processo BF-XXXX-1852</p></div></div><div className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10"><div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#34d399]/20 flex items-center justify-center"><Check size={18} className="text-[#6ee7b7]"/></div><div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-[#a7f3d0]">HÁ 12 MIN</p><p className="mt-0.5 font-semibold text-white text-sm truncate">Prazo atualizado</p><p className="text-xs text-[#c4b5fd]">Processo BF-XXXX-1910</p></div></div></div></section><div className="mt-auto pt-8"><div className="rounded-xl bg-white/5 border border-white/10 p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs font-medium text-[#a78bfa]">Status do sistema</p><span className="text-xs font-bold text-[#34d399]">Online</span></div><div className="flex items-center gap-2"><div className="h-2 flex-1 rounded-full bg-[#4f46e5]/30 overflow-hidden"><div className="h-2 w-full rounded-full bg-gradient-to-r from-[#4f46e5] via-[#a855f7] to-[#34d399]"/></div></div></div></div></div></aside>;
  return <aside className="relative hidden overflow-hidden bg-[#1a1a2e] p-10 text-white lg:flex lg:flex-col xl:p-12"><div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_40%,rgba(79,70,229,0.15)_0%,transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.1)_0%,transparent_40%)]"/><div className="relative flex h-full flex-col"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-2"><FluxHubLogo compact/><span className="text-sm font-medium text-[#a78bfa]">plataforma proprietária</span></div><AccessibilityControls largeText={largeText} setLargeText={setLargeText} highContrast={highContrast} setHighContrast={setHighContrast}/></div><div className="mt-14"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#818cf8]">BureauFlow</p><h2 className="mt-4 max-w-sm text-[2.5rem] font-semibold leading-[1.08] tracking-[-.04em]">O trabalho segue, mesmo entre uma etapa e outra.</h2><p className="mt-5 max-w-sm text-base leading-7 text-[#c4b5fd]">Acompanhe responsabilidades, documentos e decisões em um fluxo com contexto.</p></div><section aria-label="Atividade ao vivo" className="mt-10 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6"><div className="flex items-center justify-between mb-4"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#a78bfa]">Atividade ao vivo</p><span className="inline-flex items-center gap-2 text-xs font-bold text-[#34d399]"><span className="size-2 rounded-full bg-[#34d399] animate-pulse"/>Atualizando</span></div><div className="space-y-4"><div className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10"><div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#4f46e5]/20 flex items-center justify-center"><Mail size={18} className="text-[#818cf8]"/></div><div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-[#a78bfa]">AGORA</p><p className="mt-0.5 font-semibold text-white text-sm truncate">Documento recebido</p><p className="text-xs text-[#c4b5fd]">Processo BF-XXXX-2048</p></div></div><div className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10"><div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#a855f7]/20 flex items-center justify-center"><UserPlus size={18} className="text-[#c084fc]"/></div><div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-[#e9d5ff]">HÁ 4 MIN</p><p className="mt-0.5 font-semibold text-white text-sm truncate">Responsável atribuído</p><p className="text-xs text-[#c4b5fd]">Processo BF-XXXX-1852</p></div></div><div className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10"><div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#34d399]/20 flex items-center justify-center"><Check size={18} className="text-[#6ee7b7]"/></div><div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-[#a7f3d0]">HÁ 12 MIN</p><p className="mt-0.5 font-semibold text-white text-sm truncate">Prazo atualizado</p><p className="text-xs text-[#c4b5fd]">Processo BF-XXXX-1910</p></div></div></div></section><div className="mt-auto pt-8"><div className="rounded-xl bg-white/5 border border-white/10 p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs font-medium text-[#a78bfa]">Status do sistema</p><span className="text-xs font-bold text-[#34d399]">Online</span></div><div className="flex items-center gap-2"><div className="h-2 flex-1 rounded-full bg-[#4f46e5]/30 overflow-hidden"><div className="h-2 w-full rounded-full bg-gradient-to-r from-[#4f46e5] via-[#a855f7] to-[#34d399]"/></div></div></div></div></div></aside>;
}

function AccessibilityControls({ largeText, setLargeText, highContrast, setHighContrast }: { largeText: boolean; setLargeText: (value: boolean) => void; highContrast: boolean; setHighContrast: (value: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return <div className="relative"><button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="accessibility-options" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#a78bfa] bg-[#f5f3ff] px-3 text-sm font-bold text-[#4f46e5] shadow-sm hover:bg-[#ede9fe] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"><Accessibility size={19}/>Acessibilidade</button>{open && <div id="accessibility-options" className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-64 rounded-xl border border-[#a78bfa] bg-white p-3 shadow-xl"><p className="px-1 pb-2 text-sm font-bold text-[#1a1a2e]">Preferências de leitura</p><button type="button" onClick={() => setLargeText(!largeText)} aria-pressed={largeText} className="flex min-h-11 w-full items-center justify-between rounded-lg px-2 text-left text-sm font-semibold text-slate-800 hover:bg-[#f5f3ff] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"><span className="flex items-center gap-2">{largeText ? <Minus size={17}/> : <Plus size={17}/>}Texto ampliado</span><span>{largeText ? "Ativo" : "Padrão"}</span></button><button type="button" onClick={() => setHighContrast(!highContrast)} aria-pressed={highContrast} className="mt-1 flex min-h-11 w-full items-center justify-between rounded-lg px-2 text-left text-sm font-semibold text-slate-800 hover:bg-[#f5f3ff] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"><span>Alto contraste</span><span>{highContrast ? "Ativo" : "Padrão"}</span></button><button type="button" onClick={() => document.documentElement.classList.toggle("reduce-motion")} className="mt-1 flex min-h-11 w-full items-center justify-between rounded-lg px-2 text-left text-sm font-semibold text-slate-800 hover:bg-[#f5f3ff] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"><span>Reduzir movimento</span><span>Alternar</span></button></div>}</div>;
}

function Card({ children, showPanel = false }: { children: React.ReactNode; showPanel?: boolean }) {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  return <main className={`mx-auto grid min-h-screen w-full max-w-[800px] place-items-center px-4 py-6 sm:px-6 ${largeText ? "accessibility-large-text" : ""} ${highContrast ? "accessibility-high-contrast" : ""}`}><div className="w-full"><section className={`overflow-hidden rounded-2xl border border-[#a78bfa] bg-white shadow-[0_28px_80px_rgba(79,70,229,.15)] ${showPanel ? "lg:min-h-[700px] lg:grid-cols-[1fr_1fr]" : "lg:mx-auto lg:max-w-[600px]"}`}>{showPanel && <SidePanel largeText={largeText} setLargeText={setLargeText} highContrast={highContrast} setHighContrast={setHighContrast}/>}<div className={`relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10 ${showPanel ? "" : "lg:px-12 lg:py-12"}`}><div aria-hidden="true" className="pointer-events-none absolute -right-20 top-8 size-60 rounded-full border border-[#c4b5fd] sm:-right-28 sm:top-12 sm:size-80"/><div aria-hidden="true" className="pointer-events-none absolute -right-6 bottom-5 size-40 rounded-full border border-[#e9d5ff] sm:-right-8 sm:bottom-7 sm:size-48"/><div className="relative mb-8 border-b border-[#e9d5ff] pb-5"><div className="flex flex-wrap items-center justify-between gap-4"><BureauFlowLogo/></div></div><div className={`relative mx-auto ${showPanel ? "max-w-[510px]" : "max-w-full"}`}>{children}</div></div></section></div></main>;
}

function Notice({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return <div className={`rounded-lg border p-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-blue-200 bg-blue-50 text-blue-900"}`} role="alert">{children}</div>;
}

function PasswordStrength({ password }: { password: string }) {
  const requirements = [
    { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
    { label: "Letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Letra minúscula", test: (p: string) => /[a-z]/.test(p) },
    { label: "Número", test: (p: string) => /\d/.test(p) },
    { label: "Caractere especial", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ];
  const passed = requirements.filter(r => r.test(password)).length;
  const strength = passed === 0 ? 0 : passed === 1 ? 20 : passed === 2 ? 40 : passed === 3 ? 60 : passed === 4 ? 80 : 100;
  const color = strength <= 20 ? "bg-red-500" : strength <= 40 ? "bg-orange-500" : strength <= 60 ? "bg-yellow-500" : strength <= 80 ? "bg-[#a855f7]" : "bg-[#34d399]";
  return <div className="space-y-2"><div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className={`h-full transition-all duration-300 ${color}`} style={{ width: `${strength}%` }}/></div><ul className="space-y-1 text-xs">{requirements.map((req, i) => <li key={i} className={`flex items-center gap-1.5 ${req.test(password) ? "text-[#34d399]" : "text-slate-500"}`}><Check size={12} className={req.test(password) ? "" : "opacity-0"}/>{req.label}</li>)}</ul></div>;
}

export default function BureauFlowJourneyNew() {
  const parameters = new URLSearchParams(window.location.search);
  const verifyToken = parameters.get("verify");
  const inviteToken = parameters.get("invite");
  const [view, setView] = useState<View>(inviteToken ? "accept" : "login");
  const [registration, setRegistration] = useState<RegistrationData>(emptyRegistration);
  const [step, setStep] = useState<RegistrationStep>("access");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>("enviado");
  const [session, setSession] = useState<Session | null>(() => {
    const saved = localStorage.getItem("bureauflow-session");
    return saved ? JSON.parse(saved) as Session : null;
  });

  useEffect(() => {
    if (!verifyToken) return;
    setMessage("E-mail confirmado com sucesso. Entre para continuar.");
    setError("");
    setView("verify");
    window.history.replaceState({}, "", "/");
  }, [verifyToken]);

  const saveSession = (next: Session) => {
    localStorage.setItem("bureauflow-session", JSON.stringify(next));
    setSession(next);
  };

  const update = <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => setRegistration((current) => ({ ...current, [key]: value }));
  
  const steps: RegistrationStep[] = ["access", "personal", "professional", "address", "security", "review"];
  const currentStepIndex = steps.indexOf(step);
  const stepLabels: Record<RegistrationStep, string> = {
    access: "Dados de acesso",
    personal: "Dados pessoais",
    professional: "Dados profissionais",
    address: "Endereço e contatos",
    security: "Segurança e consentimentos",
    review: "Revisão",
  };

  const generatePublicId = (type: string) => {
    const prefix = type === "lawyer" || type === "office" ? "BF-USR" : type === "client" ? "BF-CLI" : "BF-ORG";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suffix = "";
    for (let i = 0; i < 5; i++) suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    return `${prefix}-${suffix}`;
  };

  const register = async () => {
    setLoading(true);
    setError("");
    await new Promise(resolve => setTimeout(resolve, 1500));
    const publicId = generatePublicId(registration.userType);
    setVerificationUrl(`${window.location.origin}/?verify=${publicId}`);
    setMessage(`Cadastro realizado com sucesso. Enviamos uma confirmação para ${registration.email}.`);
    setView("verify");
    setLoading(false);
  };

  if (view === "verify") return <Verification message={message} error={error} url={verificationUrl} onLogin={() => { setView("login"); setError(""); }} />;
  if (view === "howToStart") return <HowToStart onSelect={(type) => { update("userType", type); setStep("access"); setView("registration"); }} onBack={() => setView("login")} />;
  if (view === "registration") return <RegistrationFlow values={registration} step={step} steps={steps} stepLabels={stepLabels} update={update} error={error} loading={loading} onBack={() => currentStepIndex > 0 ? setStep(steps[currentStepIndex - 1]) : setView("howToStart")} onNext={async () => { if (step === "review") await register(); else setStep(steps[currentStepIndex + 1]); }} />;
  if (view === "onboarding" && session) return <Onboarding session={session} onCreateProcess={() => setView("accepted")} onInvite={() => setView("invite")} onAddTeam={() => setView("accepted")} onDiscover={() => setView("accepted")} onLater={() => setView("accepted")} onLogout={() => { localStorage.removeItem("bureauflow-session"); setSession(null); setView("login"); }} />;
  if (view === "invite" && session) return <InviteFlow token={session.accessToken} status={inviteStatus} setStatus={setInviteStatus} onDone={(url) => { setMessage(url); setView("accepted"); }} onBack={() => setView("onboarding")} />;
  if (view === "accept" && (inviteToken || message)) return <AcceptInvitation token={inviteToken ?? "prototipo"} onAccepted={(next) => { saveSession(next); window.history.replaceState({}, "", "/"); setView("onboarding"); }} />;
  if (view === "accepted") return <Card showPanel={false}><div className="space-y-5"><CheckCircle2 className="text-[#34d399]" size={36}/><h2 className="text-2xl font-semibold text-[#1a1a2e]">Ação concluída</h2><p className="text-slate-600">Quando aplicável, copie o link abaixo para testar a experiência do cliente convidado no protótipo.</p><div className="flex gap-2"><input readOnly value={message || `${window.location.origin}/?invite=prototipo`} className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 text-sm" /><button onClick={() => void navigator.clipboard.writeText(message || `${window.location.origin}/?invite=prototipo`)} className="grid size-11 place-items-center rounded-lg bg-[#4f46e5] text-white" aria-label="Copiar link"><Copy size={18}/></button></div><button onClick={() => setView("accept")} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#4f46e5] font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,.28)] transition-colors hover:bg-[#4338ca]"><Check size={18}/>Simular aceite do convite</button><button onClick={() => setView("onboarding")} className="min-h-11 font-semibold text-[#4f46e5]">Voltar ao início</button></div></Card>;
  if (view === "passwordRecovery") return <PasswordRecovery onBack={() => setView("login")} onSuccess={() => setView("passwordReset")} />;
  if (view === "passwordReset") return <PasswordReset onBack={() => setView("login")} onSuccess={() => setView("passwordResetSuccess")} />;
  if (view === "passwordResetSuccess") return <PasswordResetSuccess onLogin={() => setView("login")} />;
  return <Login onCreateAccount={() => { setView("howToStart"); setError(""); }} onInvite={() => { setView("accept"); setError(""); }} onPasswordRecovery={() => setView("passwordRecovery")} onLogin={(email) => { saveSession({ accessToken: "prototipo", user: { id: "BF-USR-8K4P29", name: email.includes("paulina") ? "Paulina" : "Responsável", email, role: "lawyer", emailVerified: true } }); setView("onboarding"); }} error={error} />;
}

function Login({ onCreateAccount, onInvite, onPasswordRecovery, onLogin, error }: { onCreateAccount: () => void; onInvite: () => void; onPasswordRecovery: () => void; onLogin: (email: string) => void; error: string }) {
  const [email, setEmail] = useState("paulina@fluxhub.com");
  const [password, setPassword] = useState("Bureau@2026");
  return <Card showPanel={false}><form className="space-y-6 py-4" onSubmit={(event) => { event.preventDefault(); onLogin(email); }}><header><p className="text-xs font-bold uppercase tracking-[.18em] text-[#4f46e5]">Acesso BureauFlow</p><h1 className="mt-3 text-2xl font-semibold leading-tight tracking-[-.04em] text-[#1a1a2e] sm:text-3xl">Seu fluxo de trabalho começa aqui.</h1><p className="mt-4 text-sm font-medium leading-6 text-[#4b5563] sm:text-base sm:leading-7">Centralize documentos, responsabilidades e acompanhamento em um fluxo que não perde contexto.</p></header>{error && <Notice error>{error}</Notice>}<div className="space-y-4"><Field label="E-mail" type="email" value={email} onChange={setEmail} required/><Field label="Senha" type="password" value={password} onChange={setPassword} required/><button type="button" onClick={onPasswordRecovery} className="text-sm font-bold text-[#4f46e5] underline-offset-4 hover:underline">Esqueci minha senha</button></div><button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-4 text-base font-bold text-white shadow-[0_10px_24px_rgba(79,70,229,.28)] transition-colors hover:bg-[#4338ca]"><LogIn size={19}/>Entrar no BureauFlow<ArrowRight size={18}/></button><div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[.12em] text-slate-400"><span className="h-px flex-1 bg-slate-200"/>ou<span className="h-px flex-1 bg-slate-200"/></div><button type="button" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-[15px] font-bold text-[#1a1a2e] hover:bg-slate-50"><span aria-hidden="true" className="grid size-4 place-items-center rounded-full border border-slate-500 text-[10px] leading-none">G</span>Continuar com Google</button><button type="button" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-[15px] font-bold text-[#1a1a2e] hover:bg-slate-50"><span aria-hidden="true" className="grid size-4 place-items-center rounded-full border border-slate-500 text-[10px] leading-none">M</span>Continuar com Microsoft</button><div className="border-t border-[#e9d5ff] pt-5 space-y-3 text-center text-[15px] font-medium leading-6 text-[#4b5563] sm:text-base sm:leading-7"><p>Não possui conta? <button type="button" className="font-bold text-[#4f46e5] underline-offset-4 hover:underline" onClick={onCreateAccount}>Criar gratuitamente</button></p><p>Recebeu um convite? <button type="button" className="font-bold text-[#4f46e5] underline-offset-4 hover:underline" onClick={onInvite}>Acessar cadastro</button></p><div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs"><a href="#ajuda" className="hover:underline">Ajuda</a><a href="#suporte" className="hover:underline">Suporte</a><a href="#termos" className="hover:underline">Termos</a><a href="#privacidade" className="hover:underline">Privacidade</a><a href="#lgpd" className="hover:underline">LGPD</a></div></div></form></Card>;
}

function HowToStart({ onSelect, onBack }: { onSelect: (type: UserType) => void; onBack: () => void }) {
  const [selected, setSelected] = useState<UserType | null>(null);
  const options = [
    { type: "lawyer" as UserType, icon: Briefcase, title: "Advogado ou escritório", description: "Para profissionais autônomos, sociedades individuais e escritórios com equipe." },
    { type: "representative" as UserType, icon: FileText, title: "Representante ou despachante", description: "Para profissionais que executam serviços documentais, administrativos ou burocráticos." },
    { type: "company" as UserType, icon: Building2, title: "Empresa prestadora de serviços", description: "Para organizações que possuem equipe, clientes e processos próprios." },
    { type: "client" as UserType, icon: User, title: "Cliente ou parte", description: "Para quem deseja acompanhar solicitações ou recebeu convite de um profissional." },
  ];
  return <Card showPanel={false}><div className="space-y-6"><div><button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#4f46e5]"><ArrowLeft size={18}/>Voltar</button><p className="text-xs font-bold uppercase tracking-[.18em] text-[#4f46e5] mt-4">Como você deseja utilizar o BureauFlow?</p><h2 className="mt-2 text-2xl font-semibold text-[#1a1a2e]">Escolha a opção que melhor representa sua atuação</h2><p className="mt-2 text-sm text-slate-600">Você poderá ajustar ou adicionar novos vínculos posteriormente.</p></div><div className="grid gap-4 sm:grid-cols-2">{options.map((option) => <button key={option.type} type="button" onClick={() => setSelected(option.type)} className={`p-5 rounded-xl border-2 text-left transition-all ${selected === option.type ? "border-[#4f46e5] bg-[#faf5ff]" : "border-slate-200 bg-white hover:border-[#4f46e5] hover:bg-[#faf5ff]"}`}><option.icon size={24} className={selected === option.type ? "text-[#4f46e5]" : "text-slate-600"}/><h3 className="mt-3 font-semibold text-[#1a1a2e]">{option.title}</h3><p className="mt-1 text-sm text-slate-600">{option.description}</p></button>)}</div><p className="text-xs text-slate-500 text-center">Você poderá participar de outras organizações ou processos usando a mesma conta.</p><button type="button" onClick={() => selected && onSelect(selected)} disabled={!selected} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-4 text-base font-bold text-white shadow-[0_10px_24px_rgba(79,70,229,.28)] transition-colors hover:bg-[#4338ca] disabled:opacity-50 disabled:cursor-not-allowed">Continuar<ArrowRight size={18}/></button></div></Card>;
}

function RegistrationFlow({ values, step, steps, stepLabels, update, error, loading, onBack, onNext }: { values: RegistrationData; step: RegistrationStep; steps: RegistrationStep[]; stepLabels: Record<RegistrationStep, string>; update: <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => void; error: string; loading: boolean; onBack: () => void; onNext: () => void | Promise<void> }) {
  const currentStepIndex = steps.indexOf(step);
  return <Card showPanel={false}><form className="space-y-6" onSubmit={(event) => { event.preventDefault(); onNext(); }}><div><button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#4f46e5]"><ArrowLeft size={18}/>Voltar</button><p className="text-xs font-bold uppercase tracking-[.18em] text-[#4f46e5] mt-4">Cadastro · etapa {currentStepIndex + 1} de {steps.length}</p><h2 className="mt-2 text-2xl font-semibold text-[#1a1a2e]">{stepLabels[step]}</h2></div><div className="flex gap-1.5">{steps.map((s, index) => <span key={s} className={`h-1 flex-1 rounded transition-colors ${index <= currentStepIndex ? "bg-[#4f46e5]" : "bg-slate-200"}`} />)}</div>{error && <Notice error>{error}</Notice>}{step === "access" && <AccessStep values={values} update={update} />}{step === "personal" && <PersonalStep values={values} update={update} />}{step === "professional" && <ProfessionalStep values={values} update={update} />}{step === "address" && <AddressStep values={values} update={update} />}{step === "security" && <SecurityStep values={values} update={update} />}{step === "review" && <ReviewStep values={values} update={update} />}<div className="flex justify-between gap-3"><button type="button" onClick={onBack} className="flex min-h-11 items-center gap-2 font-semibold text-slate-600"><ArrowLeft size={18}/>Voltar</button><button type="submit" disabled={loading} className="flex min-h-11 items-center gap-2 rounded-lg bg-[#4f46e5] px-4 font-semibold text-white disabled:opacity-50">{loading ? <Loader2 size={18} className="animate-spin"/> : step === "review" ? "Concluir cadastro" : "Continuar"}{!loading && <ArrowRight size={18}/>}</button></div></form></Card>;
}

function AccessStep({ values, update }: { values: RegistrationData; update: <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => void }) {
  return <div className="grid gap-4"><Field label="Nome completo" value={values.fullName} onChange={(v) => update("fullName", v)} required/><Field label="E-mail" type="email" value={values.email} onChange={(v) => update("email", v)} required helper="Este será seu e-mail de acesso"/><Field label="Celular com WhatsApp" value={values.phone} onChange={(v) => update("phone", v)} required placeholder="(00) 00000-0000"/><Field label="Senha" type="password" value={values.password} onChange={(v) => update("password", v)} required/><PasswordStrength password={values.password}/><Field label="Confirmar senha" type="password" value={values.passwordConfirmation} onChange={(v) => update("passwordConfirmation", v)} required error={values.password !== values.passwordConfirmation ? "As senhas não coincidem" : ""}/></div>;
}

function PersonalStep({ values, update }: { values: RegistrationData; update: <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => void }) {
  return <div className="grid gap-4"><Field label="CPF" value={values.cpf} onChange={(v) => update("cpf", v)} required placeholder="000.000.000-00"/><Field label="Data de nascimento" type="date" value={values.birthDate} onChange={(v) => update("birthDate", v)} required/></div>;
}

function ProfessionalStep({ values, update }: { values: RegistrationData; update: <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => void }) {
  if (values.userType === "lawyer" || values.userType === "office") {
    return <div className="grid gap-4"><Field label="Número da OAB" value={values.oabNumber} onChange={(v) => update("oabNumber", v)} required/><Field label="Seccional" value={values.oabSection} onChange={(v) => update("oabSection", v)} required placeholder="Ex: SP"/><Field label="Tipo de inscrição" value={values.oabType} onChange={(v) => update("oabType", v)} required placeholder="Ex: Principal"/><Field label="E-mail profissional" type="email" value={values.professionalEmail} onChange={(v) => update("professionalEmail", v)} required/><Field label="Telefone profissional" value={values.professionalPhone} onChange={(v) => update("professionalPhone", v)} required/><Field label="Endereço profissional" value={values.professionalAddress} onChange={(v) => update("professionalAddress", v)} required/><Field label="Especialidades" value={values.specialties} onChange={(v) => update("specialties", v)} placeholder="Ex: Direito Civil, Trabalhista" helper="Opcional"/><Notice>A validação automática da OAB será disponibilizada futuramente. Nesta versão, os dados serão declarados pelo usuário.</Notice></div>;
  }
  if (values.userType === "representative") {
    return <div className="grid gap-4"><Field label="Nome profissional" value={values.professionalName} onChange={(v) => update("professionalName", v)} required/><Field label="Tipo de atividade" value={values.activityType} onChange={(v) => update("activityType", v)} required placeholder="Ex: Despachante, Representante"/><Field label="Região de atendimento" value={values.serviceRegion} onChange={(v) => update("serviceRegion", v)} required/><Field label="Número de registro profissional" value={values.professionalRegistration} onChange={(v) => update("professionalRegistration", v)} helper="Opcional para atividades não regulamentadas"/><label className="flex items-center gap-2"><input type="checkbox" checked={values.hasCnpj} onChange={(e) => update("hasCnpj", e.target.checked)} className="size-4 accent-[#2f63e5]"/><span className="text-sm font-semibold text-[#10275b]">Possui CNPJ?</span></label>{values.hasCnpj && <><Field label="CNPJ" value={values.cnpj} onChange={(v) => update("cnpj", v)} required placeholder="00.000.000/0000-00"/><Field label="Razão social" value={values.legalName} onChange={(v) => update("legalName", v)} required/><Field label="Nome fantasia" value={values.tradeName} onChange={(v) => update("tradeName", v)}/></>}</div>;
  }
  if (values.userType === "company") {
    return <div className="grid gap-4"><Field label="CNPJ" value={values.cnpj} onChange={(v) => update("cnpj", v)} required placeholder="00.000.000/0000-00"/><Field label="Razão social" value={values.legalName} onChange={(v) => update("legalName", v)} required/><Field label="Nome fantasia" value={values.tradeName} onChange={(v) => update("tradeName", v)} required/><Field label="Segmento de atuação" value={values.segment} onChange={(v) => update("segment", v)} required placeholder="Ex: Tecnologia, Consultoria"/><Field label="E-mail institucional" type="email" value={values.institutionalEmail} onChange={(v) => update("institutionalEmail", v)} required/></div>;
  }
  return <Notice>Selecione um tipo de usuário para continuar.</Notice>;
}

function AddressStep({ values, update }: { values: RegistrationData; update: <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => void }) {
  return <div className="grid gap-4"><Field label="Endereço completo" value={values.address} onChange={(v) => update("address", v)} required placeholder="Rua, número, bairro, cidade - UF"/><Field label="Telefone" value={values.institutionalPhone} onChange={(v) => update("institutionalPhone", v)} required placeholder="(00) 0000-0000"/><Field label="WhatsApp" value={values.whatsapp} onChange={(v) => update("whatsapp", v)} required placeholder="(00) 00000-0000"/></div>;
}

function SecurityStep({ values, update }: { values: RegistrationData; update: <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => void }) {
  return <div className="space-y-4"><div className="rounded-xl border border-[#e9d5ff] bg-[#faf5ff] p-4"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={values.acceptTerms} onChange={(e) => update("acceptTerms", e.target.checked)} required className="mt-1 size-4 accent-[#4f46e5]"/><span className="text-sm text-slate-700">Li e aceito os <a href="#termos" className="font-bold text-[#4f46e5] hover:underline">Termos de Uso</a> do BureauFlow.</span></label></div><div className="rounded-xl border border-[#e9d5ff] bg-[#faf5ff] p-4"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={values.acceptPrivacy} onChange={(e) => update("acceptPrivacy", e.target.checked)} required className="mt-1 size-4 accent-[#4f46e5]"/><span className="text-sm text-slate-700">Tenho ciência da <a href="#privacidade" className="font-bold text-[#4f46e5] hover:underline">Política de Privacidade</a> e do tratamento dos meus dados conforme a LGPD.</span></label></div><div className="rounded-xl border border-[#e9d5ff] bg-[#faf5ff] p-4"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={values.acceptOperationalComms} onChange={(e) => update("acceptOperationalComms", e.target.checked)} className="mt-1 size-4 accent-[#4f46e5]"/><span className="text-sm text-slate-700">Concordo em receber comunicações operacionais por WhatsApp relacionadas aos meus processos.</span></label></div><div className="rounded-xl border border-[#e9d5ff] bg-[#faf5ff] p-4"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={values.acceptPromotionalComms} onChange={(e) => update("acceptPromotionalComms", e.target.checked)} className="mt-1 size-4 accent-[#4f46e5]"/><span className="text-sm text-slate-700">Desejo receber comunicações promocionais sobre novidades do BureauFlow.</span></label></div></div>;
}

function ReviewStep({ values, update }: { values: RegistrationData; update: <K extends keyof RegistrationData>(key: K, value: RegistrationData[K]) => void }) {
  const typeLabels: Record<UserType, string> = { lawyer: "Advogado", office: "Escritório", representative: "Representante/Despachante", company: "Empresa", client: "Cliente" };
  return <div className="space-y-4"><Notice>Revise seus dados antes de concluir o cadastro.</Notice><div className="rounded-lg bg-slate-50 p-4 space-y-3"><div className="flex justify-between items-center"><span className="text-sm text-slate-500">Tipo de conta</span><span className="font-semibold">{typeLabels[values.userType]}</span></div><div className="flex justify-between items-center"><span className="text-sm text-slate-500">Nome</span><span className="font-semibold">{values.fullName}</span></div><div className="flex justify-between items-center"><span className="text-sm text-slate-500">E-mail</span><span className="font-semibold">{values.email}</span></div><div className="flex justify-between items-center"><span className="text-sm text-slate-500">Telefone</span><span className="font-semibold">{values.phone}</span></div>{(values.userType === "lawyer" || values.userType === "office") && <><div className="flex justify-between items-center"><span className="text-sm text-slate-500">OAB</span><span className="font-semibold">{values.oabNumber}/{values.oabSection}</span></div></>}{values.userType === "representative" && <><div className="flex justify-between items-center"><span className="text-sm text-slate-500">Atividade</span><span className="font-semibold">{values.activityType}</span></div></>}{values.userType === "company" && <><div className="flex justify-between items-center"><span className="text-sm text-slate-500">Empresa</span><span className="font-semibold">{values.tradeName}</span></div></>}</div></div>;
}

function Verification({ message, error, url, onLogin }: { message: string; error: string; url: string; onLogin: () => void }) {
  return <Card showPanel={false}><div className="space-y-5"><Mail size={34} className="text-[#4f46e5]"/><h2 className="text-2xl font-semibold text-[#1a1a2e]">Confirme seu e-mail</h2>{error ? <Notice error>{error}</Notice> : <Notice>{message || "Use o link enviado para seu e-mail."}</Notice>}{url && <><p className="text-sm text-slate-600">Ambiente local: o link abaixo substitui o e-mail enviado.</p><a className="block break-all rounded-lg border border-slate-300 p-3 text-sm font-medium text-[#4f46e5]" href={url}>{url}</a></>}<button onClick={onLogin} className="min-h-11 font-semibold text-[#4f46e5]">Ir para o login</button></div></Card>;
}

function Onboarding({ session, onCreateProcess, onInvite, onAddTeam, onDiscover, onLater, onLogout }: { session: Session; onCreateProcess: () => void; onInvite: () => void; onAddTeam: () => void; onDiscover: () => void; onLater: () => void; onLogout: () => void }) {
  return <Card showPanel={false}><div className="space-y-6"><div className="flex items-center justify-between gap-4"><div><p className="text-sm text-slate-500">Primeiro acesso</p><h2 className="text-2xl font-semibold text-[#1a1a2e]">Olá, {session.user.name}</h2></div><button onClick={onLogout} className="text-sm font-semibold text-slate-600">Sair</button></div><Notice>Sua conta está ativa. Seu identificador público é <span className="font-mono font-bold">{session.user.id}</span>.</Notice><h3 className="text-lg font-semibold text-[#1a1a2e]">Como deseja começar?</h3><div className="grid gap-3"><button onClick={onCreateProcess} className="flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-300 px-4 text-left text-sm font-semibold text-[#1a1a2e] hover:bg-slate-50">Criar meu primeiro processo<ArrowRight size={16}/></button><button onClick={onInvite} className="flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-300 px-4 text-left text-sm font-semibold text-[#1a1a2e] hover:bg-slate-50">Convidar cliente ou parte<ArrowRight size={16}/></button><button onClick={onAddTeam} className="flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-300 px-4 text-left text-sm font-semibold text-[#1a1a2e] hover:bg-slate-50">Adicionar integrantes da equipe<ArrowRight size={16}/></button><button onClick={onDiscover} className="flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-300 px-4 text-left text-sm font-semibold text-[#1a1a2e] hover:bg-slate-50">Conhecer o BureauFlow<ArrowRight size={16}/></button></div><button onClick={onLater} className="min-h-11 font-semibold text-[#4f46e5]">Configurar depois</button></div></Card>;
}

function InviteFlow({ token, status, setStatus, onDone, onBack }: { token: string; status: InviteStatus; setStatus: (status: InviteStatus) => void; onDone: (url: string) => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [relation, setRelation] = useState("Cliente / parte interessada");
  const [processRef, setProcessRef] = useState("");
  const [entity, setEntity] = useState("Pessoa física");
  const [message, setMessage] = useState("Você foi convidado para acompanhar uma demanda no BureauFlow.");
  const [expiry, setExpiry] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [emailChannel, setEmailChannel] = useState(true);
  const [whatsChannel, setWhatsChannel] = useState(false);
  const [linkChannel, setLinkChannel] = useState(false);

  const hasChannel = emailChannel || whatsChannel || linkChannel;

  return <Card showPanel={false}><form className="space-y-5" onSubmit={(event) => { event.preventDefault(); if (!hasChannel) return; setStatus("enviado"); onDone(`${window.location.origin}/?invite=prototipo`); }}><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#4f46e5]">Convite de parte</p><h2 className="mt-2 text-2xl font-semibold text-[#1a1a2e]">Convidar cliente ou parte</h2><p className="mt-2 text-sm text-slate-600">Defina os canais, a relação e a validade antes de enviar.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Nome" value={name} onChange={setName} required/><Field label="E-mail" type="email" value={email} onChange={setEmail} required/></div><div className="grid gap-4 sm:grid-cols-2"><Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} placeholder="(00) 00000-0000" required/><div className="space-y-1.5"><label htmlFor="invite-entity" className="block text-sm font-bold text-[#1a1a2e]">Pessoa</label><select id="invite-entity" value={entity} onChange={(event) => setEntity(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-base outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]"><option>Pessoa física</option><option>Pessoa jurídica</option></select></div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Relação esperada" value={relation} onChange={setRelation} required/><Field label="Processo relacionado (opcional)" value={processRef} onChange={setProcessRef} placeholder="Ex.: BF-2026-0001"/></div><Field label="Mensagem personalizada" value={message} onChange={setMessage} required/><Field label="Prazo de validade" type="date" value={expiry} onChange={setExpiry} required/><fieldset className="rounded-xl border border-slate-300 p-4"><legend className="px-1 text-sm font-bold text-[#1a1a2e]">Canais de envio</legend><div className="mt-3 grid gap-2 sm:grid-cols-3"><label className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold"><input type="checkbox" checked={emailChannel} onChange={(event) => setEmailChannel(event.target.checked)} className="size-4 accent-[#4f46e5]"/> <Mail size={16}/> E-mail</label><label className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold"><input type="checkbox" checked={whatsChannel} onChange={(event) => setWhatsChannel(event.target.checked)} className="size-4 accent-[#4f46e5]"/> <MessageCircle size={16}/> WhatsApp</label><label className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold"><input type="checkbox" checked={linkChannel} onChange={(event) => setLinkChannel(event.target.checked)} className="size-4 accent-[#4f46e5]"/> <Link2 size={16}/> Copiar link</label></div></fieldset>{!hasChannel && <Notice error>Selecione pelo menos um canal para envio do convite.</Notice>}<div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-semibold text-[#1a1a2e]">Status do convite</p><div className="mt-3 flex flex-wrap gap-2">{(["enviado", "visualizado", "aceito", "expirado", "cancelado"] as InviteStatus[]).map((item) => <button key={item} type="button" onClick={() => setStatus(item)} className={`min-h-11 rounded-lg border px-3 text-xs font-semibold capitalize ${status === item ? "border-[#4f46e5] bg-[#ede9fe] text-[#4338ca]" : "border-slate-300 text-slate-600"}`}>{item}</button>)}</div></div><div className="flex justify-between"><button type="button" onClick={onBack} className="min-h-11 font-semibold text-slate-600">Voltar</button><button type="submit" className="flex min-h-11 items-center gap-2 rounded-lg bg-[#4f46e5] px-4 font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,.28)] transition-colors hover:bg-[#4338ca]" disabled={!hasChannel}><Send size={18}/>Enviar convite</button></div></form></Card>;
}

function AcceptInvitation({ token, onAccepted }: { token: string; onAccepted: (session: Session) => void }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  return <Card showPanel={false}><form className="space-y-5" onSubmit={(event) => { event.preventDefault(); onAccepted({ accessToken: "prototipo-cliente", user: { id: "BF-CLI-7M2X91", name: name || "Cliente convidado", email: "cliente@exemplo.com", role: "client", emailVerified: true } }); }}><CheckCircle2 size={34} className="text-[#34d399]"/><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#4f46e5]">Convite recebido</p><h2 className="mt-2 text-2xl font-semibold text-[#1a1a2e]">Você foi convidado para acompanhar uma solicitação</h2><p className="mt-2 text-sm text-slate-600">Você foi convidado por FluxHub Advocacia para fornecer seus dados e acompanhar uma solicitação no BureauFlow.</p></div><div className="rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700"><p><strong>Organização solicitante:</strong> FluxHub Advocacia</p><p><strong>Profissional solicitante:</strong> Paulina Alves</p><p><strong>Finalidade:</strong> Cadastro para acompanhamento processual</p><p><strong>Processo vinculado:</strong> BF-2026-0001</p><p><strong>Prazo de validade:</strong> 7 dias</p><p className="mt-2 text-xs">Aviso de segurança: este convite é pessoal e não deve ser compartilhado.</p></div><Notice>O e-mail convidado, a organização e o código do convite estão preenchidos e bloqueados para edição neste protótipo.</Notice><Field label="Seu nome" value={name} onChange={setName} required/><Field label="E-mail convidado" value="cliente@exemplo.com" onChange={() => undefined} type="email" required/><Field label="Organização solicitante" value="FluxHub Advocacia" onChange={() => undefined} required/><Field label="Código do convite" value={token} onChange={() => undefined} required/><Field label="Crie uma senha" value={password} onChange={setPassword} type="password" required/><button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#4f46e5] font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,.28)] transition-colors hover:bg-[#4338ca]"><Check size={18}/>Aceitar convite</button></form></Card>;
}

function PasswordRecovery({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return <Card showPanel={false}><div className="space-y-5"><button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#4f46e5]"><ArrowLeft size={18}/>Voltar</button><h2 className="text-2xl font-semibold text-[#1a1a2e]">Recuperar senha</h2>{!sent ? <><p className="text-sm text-slate-600">Informe seu e-mail para receber as instruções de recuperação.</p><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}><Field label="E-mail" type="email" value={email} onChange={setEmail} required/><button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-4 text-base font-bold text-white shadow-[0_10px_24px_rgba(79,70,229,.28)] transition-colors hover:bg-[#4338ca]">Enviar instruções</button></form></> : <Notice>Caso exista uma conta associada a este e-mail, enviaremos as instruções de recuperação.</Notice>}</div></Card>;
}

function PasswordReset({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  return <Card showPanel={false}><div className="space-y-5"><button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#4f46e5]"><ArrowLeft size={18}/>Voltar</button><h2 className="text-2xl font-semibold text-[#1a1a2e]">Criar nova senha</h2><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (password === confirmation) onSuccess(); }}><Field label="Nova senha" type="password" value={password} onChange={setPassword} required/><PasswordStrength password={password}/><Field label="Confirmar senha" type="password" value={confirmation} onChange={setConfirmation} required error={password !== confirmation ? "As senhas não coincidem" : ""}/><button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-4 text-base font-bold text-white shadow-[0_10px_24px_rgba(79,70,229,.28)] transition-colors hover:bg-[#4338ca]">Alterar senha</button></form></div></Card>;
}

function PasswordResetSuccess({ onLogin }: { onLogin: () => void }) {
  return <Card showPanel={false}><div className="space-y-5 text-center"><CheckCircle2 size={48} className="text-[#34d399] mx-auto"/><h2 className="text-2xl font-semibold text-[#1a1a2e]">Senha alterada com sucesso</h2><p className="text-slate-600">Sua senha foi atualizada. Você já pode entrar com sua nova senha.</p><button onClick={onLogin} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-4 text-base font-bold text-white shadow-[0_10px_24px_rgba(79,70,229,.28)] transition-colors hover:bg-[#4338ca]">Ir para o login</button></div></Card>;
}

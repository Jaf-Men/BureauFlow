import { useState } from "react";
import { Form, Input, Button, Divider, Alert, Radio, Steps, Checkbox, Select, DatePicker } from "antd";
import { UserOutlined, LockOutlined, ArrowRightOutlined, GoogleOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Briefcase, FileText, Building2, User } from "lucide-react";
import { Session } from "./api";

type View = "login" | "howToStart" | "registration" | "verify" | "onboarding" | "invite" | "accept" | "accepted" | "passwordRecovery" | "passwordResetSuccess";
type UserType = "lawyer" | "office" | "representative" | "company" | "client";
type RegistrationStep = "access" | "personal" | "professional" | "address" | "security" | "review";

function BureauFlowLogo() {
  return <div className="flex items-center gap-2"><div className="size-8 rounded-lg bg-gradient-to-br from-[#4f46e5] to-[#a78bfa] flex items-center justify-center"><span className="text-lg font-bold text-white">BF</span></div><span className="text-xl font-bold text-[#1a1a2e]">BureauFlow</span></div>;
}

function Card({ children, showPanel = false }: { children: React.ReactNode; showPanel?: boolean }) {
  return <main className={`mx-auto grid min-h-screen w-full max-w-[800px] place-items-center px-4 py-6 sm:px-6`}><div className="w-full"><section className={`overflow-hidden rounded-2xl border border-[#a78bfa] bg-white shadow-[0_28px_80px_rgba(79,70,229,.15)] ${showPanel ? "lg:min-h-[700px]" : "lg:mx-auto lg:max-w-[600px]"}`}><div className={`relative overflow-hidden px-6 py-8 sm:px-10 sm:py-10 ${showPanel ? "" : "lg:px-12 lg:py-12"}`}><div aria-hidden="true" className="pointer-events-none absolute -right-20 top-8 size-60 rounded-full border border-[#c4b5fd] sm:-right-28 sm:top-12 sm:size-80"/><div aria-hidden="true" className="pointer-events-none absolute -right-6 bottom-5 size-40 rounded-full border border-[#e9d5ff] sm:-right-8 sm:bottom-7 sm:size-48"/><div className="relative mb-8 border-b border-[#e9d5ff] pb-5"><div className="flex flex-wrap items-center justify-between gap-4"><BureauFlowLogo/></div></div><div className={`relative mx-auto ${showPanel ? "max-w-[510px]" : "max-w-full"}`}>{children}</div></div></section></div></main>;
}

function Login({ onCreateAccount, onInvite, onPasswordRecovery, onLogin, error }: { onCreateAccount: () => void; onInvite: () => void; onPasswordRecovery: () => void; onLogin: (email: string) => void; error: string }) {
  const [form] = Form.useForm();
  const [email, setEmail] = useState("paulina@fluxhub.com");
  const [password, setPassword] = useState("Bureau@2026");

  const handleSubmit = () => {
    onLogin(email);
  };

  return <Card showPanel={false}><div className="space-y-6 py-4"><header><p className="text-xs font-bold uppercase tracking-[.18em] text-[#4f46e5]">Acesso BureauFlow</p><h1 className="mt-3 text-2xl font-semibold leading-tight tracking-[-.04em] text-[#1a1a2e] sm:text-3xl">Seu fluxo de trabalho começa aqui.</h1><p className="mt-4 text-sm font-medium leading-6 text-[#4b5563] sm:text-base sm:leading-7">Centralize documentos, responsabilidades e acompanhamento em um fluxo que não perde contexto.</p></header>{error && <Alert message={error} type="error" showIcon />}<Form form={form} layout="vertical" className="space-y-4"><Form.Item label="E-mail" name="email" initialValue={email} rules={[{ required: true, message: 'Por favor, insira seu e-mail' }, { type: 'email', message: 'E-mail inválido' }]}><Input prefix={<UserOutlined />} size="large" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" /></Form.Item><Form.Item label="Senha" name="password" initialValue={password} rules={[{ required: true, message: 'Por favor, insira sua senha' }]}><Input.Password prefix={<LockOutlined />} size="large" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></Form.Item></Form><Button type="link" onClick={onPasswordRecovery} className="text-sm font-semibold">Esqueci minha senha</Button><Button type="primary" size="large" block onClick={handleSubmit} icon={<ArrowRightOutlined />}>Entrar no BureauFlow</Button><Divider plain>ou</Divider><Button size="large" block icon={<GoogleOutlined />} className="border-slate-300 text-[#1a1a2e]">Continuar com Google</Button><div className="border-t border-[#e9d5ff] pt-5 space-y-3 text-center text-[15px] font-medium leading-6 text-[#4b5563] sm:text-base sm:leading-7"><p>Não possui conta? <Button type="link" onClick={onCreateAccount} className="font-semibold p-0">Crie gratuitamente</Button></p><p>Recebeu um convite? <Button type="link" onClick={onInvite} className="font-semibold p-0">Acessar cadastro</Button></p></div></div></Card>;
}

function HowToStart({ onSelect, onBack }: { onSelect: (type: UserType) => void; onBack: () => void }) {
  const [selected, setSelected] = useState<UserType | null>(null);
  const options = [
    { type: "lawyer" as UserType, icon: <Briefcase size={24} />, title: "Advogado ou escritório", description: "Para profissionais autônomos, sociedades individuais e escritórios com equipe." },
    { type: "representative" as UserType, icon: <FileText size={24} />, title: "Representante ou despachante", description: "Para profissionais que executam serviços documentais, administrativos ou burocráticos." },
    { type: "company" as UserType, icon: <Building2 size={24} />, title: "Empresa prestadora de serviços", description: "Para organizações que possuem equipe, clientes e processos próprios." },
    { type: "client" as UserType, icon: <User size={24} />, title: "Cliente ou parte", description: "Para quem deseja acompanhar solicitações ou recebeu convite de um profissional." },
  ];

  return <Card showPanel={false}><div className="space-y-6"><div><Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} className="text-sm font-semibold">Voltar</Button><p className="text-xs font-bold uppercase tracking-[.18em] text-[#4f46e5] mt-4">Como você deseja utilizar o BureauFlow?</p><h2 className="mt-2 text-2xl font-semibold text-[#1a1a2e]">Escolha a opção que melhor representa sua atuação</h2><p className="mt-2 text-sm text-slate-600">Você poderá ajustar ou adicionar novos vínculos posteriormente.</p></div><Radio.Group value={selected} onChange={(e) => setSelected(e.target.value)} className="w-full"><div className="grid gap-4 sm:grid-cols-2">{options.map((option) => <Radio.Button key={option.type} value={option.type} className={`w-full h-auto p-5 text-left border-2 ${selected === option.type ? "border-[#4f46e5] bg-[#faf5ff]" : "border-slate-200 bg-white hover:border-[#4f46e5] hover:bg-[#faf5ff]"}`}><div className="flex items-start gap-3">{option.icon}<div><h3 className="font-semibold text-[#1a1a2e]">{option.title}</h3><p className="mt-1 text-sm text-slate-600">{option.description}</p></div></div></Radio.Button>)}</div></Radio.Group><p className="text-xs text-slate-500 text-center">Você poderá participar de outras organizações ou processos usando a mesma conta.</p><Button type="primary" size="large" block onClick={() => selected && onSelect(selected)} disabled={!selected} icon={<ArrowRightOutlined />}>Continuar</Button></div></Card>;
}

function RegistrationFlow({ userType, step, onBack, onNext }: { userType: UserType; step: RegistrationStep; onBack: () => void; onNext: () => void }) {
  const [form] = Form.useForm();
  const steps: RegistrationStep[] = ["access", "personal", "professional", "address", "security", "review"];
  const stepLabels: Record<RegistrationStep, string> = {
    access: "Dados de Acesso",
    personal: "Dados Pessoais",
    professional: "Dados Profissionais",
    address: "Endereço",
    security: "Termos e Segurança",
    review: "Revisão"
  };
  const currentStepIndex = steps.indexOf(step);

  const validatePassword = async (_: any, value: string) => {
    const password = form.getFieldValue('password');
    if (!value || password === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('As senhas não coincidem'));
  };

  return <Card showPanel={false}><Form form={form} layout="vertical" className="space-y-6" onFinish={onNext}><div><Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} className="text-sm font-semibold">Voltar</Button><p className="text-xs font-bold uppercase tracking-[.18em] text-[#4f46e5] mt-4">Cadastro · etapa {currentStepIndex + 1} de {steps.length}</p><h2 className="mt-2 text-2xl font-semibold text-[#1a1a2e]">{stepLabels[step]}</h2></div><Steps current={currentStepIndex} size="small" className="mb-6">{steps.map((s) => <Steps.Step key={s} title={stepLabels[s]} />)}</Steps>{step === "access" && <><Form.Item label="Nome Completo" name="fullName" rules={[{ required: true, message: 'Por favor, insira seu nome completo' }]}><Input size="large" placeholder="Seu nome completo" /></Form.Item><Form.Item label="E-mail" name="email" rules={[{ required: true, message: 'Por favor, insira seu e-mail' }, { type: 'email', message: 'E-mail inválido' }]}><Input prefix={<UserOutlined />} size="large" placeholder="seu@email.com" /></Form.Item><Form.Item label="Celular com WhatsApp" name="phone" rules={[{ required: true, message: 'Por favor, insira seu celular' }]}><Input size="large" placeholder="(00) 00000-0000" /></Form.Item><Form.Item label="Senha" name="password" rules={[{ required: true, message: 'Por favor, insira sua senha' }]}><Input.Password prefix={<LockOutlined />} size="large" placeholder="••••••••" /></Form.Item><Form.Item label="Confirmar Senha" name="passwordConfirmation" dependencies={['password']} rules={[{ required: true, message: 'Por favor, confirme sua senha' }, { validator: validatePassword }]}><Input.Password prefix={<LockOutlined />} size="large" placeholder="••••••••" /></Form.Item></>}{step === "personal" && <><Form.Item label="CPF" name="cpf" rules={[{ required: true, message: 'Por favor, insira seu CPF' }]}><Input size="large" placeholder="000.000.000-00" /></Form.Item><Form.Item label="Data de Nascimento" name="birthDate" rules={[{ required: true, message: 'Por favor, insira sua data de nascimento' }]}><DatePicker size="large" className="w-full" placeholder="DD/MM/AAAA" format="DD/MM/YYYY" /></Form.Item></>}{step === "professional" && (userType === "lawyer" || userType === "office") && <><Form.Item label="Número da OAB" name="oabNumber" rules={[{ required: true, message: 'Por favor, insira seu número da OAB' }]}><Input size="large" placeholder="123456" /></Form.Item><Form.Item label="UF da OAB" name="oabState" rules={[{ required: true, message: 'Por favor, selecione o estado' }]}><Select size="large" placeholder="Selecione o estado"><Select.Option value="SP">SP</Select.Option><Select.Option value="RJ">RJ</Select.Option><Select.Option value="MG">MG</Select.Option><Select.Option value="RS">RS</Select.Option><Select.Option value="PR">PR</Select.Option></Select></Form.Item><Form.Item label="Tipo de Inscrição" name="oabType" rules={[{ required: true, message: 'Por favor, selecione o tipo' }]}><Radio.Group><Radio value="principal">Principal</Radio><Radio value="suplementar">Suplementar</Radio></Radio.Group></Form.Item></>}{step === "security" && <><Form.Item name="acceptTerms" valuePropName="checked" rules={[{ required: true, message: 'Você deve aceitar os termos' }]}><Checkbox>Li e aceito os <a href="#termos" className="font-bold text-[#4f46e5]">Termos de Uso</a> do BureauFlow.</Checkbox></Form.Item><Form.Item name="acceptPrivacy" valuePropName="checked" rules={[{ required: true, message: 'Você deve aceitar a política de privacidade' }]}><Checkbox>Tenho ciência da <a href="#privacidade" className="font-bold text-[#4f46e5]">Política de Privacidade</a>.</Checkbox></Form.Item></>}{step === "review" && <Alert message="Revise seus dados antes de concluir o cadastro." type="info" showIcon />}<div className="flex justify-between gap-3"><Button onClick={onBack} icon={<ArrowLeftOutlined />}>Voltar</Button><Button type="primary" htmlType="submit" icon={<ArrowRightOutlined />}>{step === "review" ? "Concluir cadastro" : "Continuar"}</Button></div></Form></Card>;
}

function Verification({ onBackToLogin }: { onBackToLogin: () => void }) {
  return <Card showPanel={false}><div className="space-y-6"><Alert message="Cadastro concluído" description="Enviamos um e-mail de confirmação. No protótipo, siga para o login para continuar." type="success" showIcon /><Button type="primary" size="large" block onClick={onBackToLogin}>Ir para o login</Button></div></Card>;
}

function PasswordRecovery({ onBack, onSent }: { onBack: () => void; onSent: () => void }) {
  const [form] = Form.useForm();
  return <Card showPanel={false}><Form form={form} layout="vertical" className="space-y-6" onFinish={onSent}><div><Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} className="text-sm font-semibold">Voltar</Button><p className="text-xs font-bold uppercase tracking-[.18em] text-[#4f46e5] mt-4">Recuperação de senha</p><h2 className="mt-2 text-2xl font-semibold text-[#1a1a2e]">Receba instruções no e-mail</h2></div><Form.Item label="E-mail" name="email" rules={[{ required: true, message: "Por favor, insira seu e-mail" }, { type: "email", message: "E-mail inválido" }]}><Input prefix={<UserOutlined />} size="large" placeholder="seu@email.com" /></Form.Item><Button type="primary" htmlType="submit" size="large" block>Enviar instruções</Button></Form></Card>;
}

function PasswordResetSuccess({ onBackToLogin }: { onBackToLogin: () => void }) {
  return <Card showPanel={false}><div className="space-y-6"><Alert message="Solicitação registrada" description="Se o e-mail existir em nossa base, você receberá as instruções para redefinir a senha." type="success" showIcon /><Button type="primary" size="large" block onClick={onBackToLogin}>Voltar ao login</Button></div></Card>;
}

function Onboarding({ session, onInvite, onLogout }: { session: Session; onInvite: () => void; onLogout: () => void }) {
  return <Card showPanel={false}><div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#4f46e5]">Primeiro acesso</p><h2 className="mt-2 text-2xl font-semibold text-[#1a1a2e]">Olá, {session.user.name}</h2><p className="mt-2 text-sm text-slate-600">Sua conta está ativa e pronta para uso.</p></div><Alert message="E-mail confirmado" type="success" showIcon /><div className="grid gap-3 sm:grid-cols-2"><Button type="primary" size="large" onClick={onInvite}>Convidar cliente</Button><Button size="large" onClick={onLogout}>Sair</Button></div></div></Card>;
}

function InviteFlow({ onBack, onSent }: { onBack: () => void; onSent: () => void }) {
  const [form] = Form.useForm();
  return <Card showPanel={false}><Form form={form} layout="vertical" className="space-y-6" onFinish={onSent}><div><Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} className="text-sm font-semibold">Voltar</Button><p className="text-xs font-bold uppercase tracking-[.18em] text-[#4f46e5] mt-4">Convite</p><h2 className="mt-2 text-2xl font-semibold text-[#1a1a2e]">Convidar cliente ou parte</h2></div><Form.Item label="Nome" name="name" rules={[{ required: true, message: "Por favor, insira o nome" }]}><Input size="large" placeholder="Nome completo" /></Form.Item><Form.Item label="E-mail" name="email" rules={[{ required: true, message: "Por favor, insira o e-mail" }, { type: "email", message: "E-mail inválido" }]}><Input size="large" placeholder="cliente@email.com" /></Form.Item><Button type="primary" htmlType="submit" size="large" block>Enviar convite</Button></Form></Card>;
}

function InviteSent({ onBackToOnboarding }: { onBackToOnboarding: () => void }) {
  return <Card showPanel={false}><div className="space-y-6"><Alert message="Convite enviado" description="No protótipo, o link é gerado internamente para simulação do aceite." type="success" showIcon /><Button type="primary" size="large" block onClick={onBackToOnboarding}>Voltar ao início</Button></div></Card>;
}

function AcceptInvitation({ onBackToLogin, onAccepted }: { onBackToLogin: () => void; onAccepted: (email: string, name: string) => void }) {
  const [form] = Form.useForm();
  return <Card showPanel={false}><Form form={form} layout="vertical" className="space-y-6" onFinish={(values: { name: string; email: string; password: string }) => onAccepted(values.email, values.name)}><div><Button type="text" icon={<ArrowLeftOutlined />} onClick={onBackToLogin} className="text-sm font-semibold">Voltar</Button><p className="text-xs font-bold uppercase tracking-[.18em] text-[#4f46e5] mt-4">Convite recebido</p><h2 className="mt-2 text-2xl font-semibold text-[#1a1a2e]">Concluir cadastro para acessar</h2><p className="mt-2 text-sm text-slate-600">Use o e-mail convidado para aceitar este convite no protótipo.</p></div><Form.Item label="Nome" name="name" rules={[{ required: true, message: "Por favor, insira seu nome" }]}><Input size="large" placeholder="Seu nome completo" /></Form.Item><Form.Item label="E-mail convidado" name="email" initialValue="cliente@exemplo.com" rules={[{ required: true, message: "Por favor, insira o e-mail" }, { type: "email", message: "E-mail inválido" }]}><Input size="large" /></Form.Item><Form.Item label="Crie uma senha" name="password" rules={[{ required: true, message: "Por favor, insira sua senha" }]}><Input.Password prefix={<LockOutlined />} size="large" placeholder="••••••••" /></Form.Item><Button type="primary" htmlType="submit" size="large" block>Aceitar convite</Button></Form></Card>;
}

export default function BureauFlowJourneyAnt() {
  const [view, setView] = useState<View>("login");
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<UserType>("lawyer");
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>("access");

  const saveSession = (s: Session) => {
    localStorage.setItem("bureauflow-session", JSON.stringify(s));
    setSession(s);
  };

  if (view === "howToStart") return <HowToStart onSelect={(type) => { setUserType(type); setRegistrationStep("access"); setView("registration"); }} onBack={() => setView("login")} />;
  if (view === "registration") return <RegistrationFlow userType={userType} step={registrationStep} onBack={() => registrationStep === "access" ? setView("howToStart") : setRegistrationStep("access")} onNext={() => { if (registrationStep === "review") { setView("verify"); } else { const steps: RegistrationStep[] = ["access", "personal", "professional", "address", "security", "review"]; const currentIndex = steps.indexOf(registrationStep); setRegistrationStep(steps[currentIndex + 1]); } }} />;
  if (view === "verify") return <Verification onBackToLogin={() => setView("login")} />;
  if (view === "passwordRecovery") return <PasswordRecovery onBack={() => setView("login")} onSent={() => setView("passwordResetSuccess")} />;
  if (view === "passwordResetSuccess") return <PasswordResetSuccess onBackToLogin={() => setView("login")} />;
  if (view === "accept") return <AcceptInvitation onBackToLogin={() => setView("login")} onAccepted={(email, name) => { saveSession({ accessToken: "prototipo-cliente", user: { id: "BF-CLI-7M2X91", name: name || "Cliente convidado", email, role: "client", emailVerified: true } }); setView("onboarding"); }} />;
  if (view === "onboarding" && session) return <Onboarding session={session} onInvite={() => setView("invite")} onLogout={() => { localStorage.removeItem("bureauflow-session"); setSession(null); setView("login"); }} />;
  if (view === "invite") return <InviteFlow onBack={() => setView("onboarding")} onSent={() => setView("accepted")} />;
  if (view === "accepted") return <InviteSent onBackToOnboarding={() => setView("onboarding")} />;
  return <Login onCreateAccount={() => { setView("howToStart"); setError(""); }} onInvite={() => { setView("accept"); setError(""); }} onPasswordRecovery={() => setView("passwordRecovery")} onLogin={(email) => { saveSession({ accessToken: "prototipo", user: { id: "BF-USR-8K4P29", name: email.includes("paulina") ? "Paulina" : "Responsável", email, role: "lawyer", emailVerified: true } }); setView("onboarding"); }} error={error} />;
}

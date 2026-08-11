import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, ClipboardList, Plus, Search, SlidersHorizontal } from "lucide-react";
import { checklistByType, clients, createProcessFromDraft, emptyDraft, initialProcesses, makeDetailData, peopleDirectory, processTypeOptions, responsaveis } from "./mockData";
import { allowedTransitions, canTransition } from "./status";
import type { PartyType, ProcessCreationDraft, ProcessDetailData, ProcessStatus, ProcessSummary } from "./types";

type TabKey = "visao_geral" | "partes" | "documentos" | "assinaturas" | "tarefas" | "prazos" | "bureauia" | "auditoria";

type Props = {
	goToDashboard: () => void;
	goToDocuments: () => void;
	goToSignatures: () => void;
	goToBureauIA: () => void;
	goToAudit: () => void;
};

const statuses: ProcessStatus[] = [
	"Rascunho",
	"Em preparacao",
	"Aguardando informacoes",
	"Em andamento",
	"Aguardando assinatura",
	"Em analise",
	"Concluido",
	"Arquivado",
];

const partyTypes: PartyType[] = ["Cliente", "Parte", "Representante", "Empresa", "Advogado", "Testemunha", "Outro"];

function statusClass(status: ProcessStatus) {
	if (status === "Concluido") return "bg-[#edf9ea] text-[#196515]";
	if (status === "Aguardando assinatura") return "bg-[#fff8e8] text-[#825700]";
	if (status === "Em analise") return "bg-[#f2edff] text-[#6331bc]";
	if (status === "Arquivado") return "bg-[#f3f4f6] text-[#374151]";
	if (status === "Rascunho") return "bg-[#eef3ff] text-[#193eaf]";
	return "bg-[#eef3ff] text-[#1d4fd4]";
}

function EmptyState({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel: string; onAction: () => void }) {
	return (
		<div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
			<p className="text-base font-semibold">{title}</p>
			<p className="mt-1 text-sm text-muted-foreground">{text}</p>
			<button onClick={onAction} className="mt-4 min-h-11 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#7c3aed]">
				{actionLabel}
			</button>
		</div>
	);
}

function SummaryCard({ title, value, caption }: { title: string; value: string; caption: string }) {
	return (
		<article className="rounded-2xl border border-border bg-card p-4">
			<p className="text-sm text-muted-foreground">{title}</p>
			<p className="mt-2 text-3xl font-semibold tracking-[-.03em]">{value}</p>
			<p className="mt-1 text-xs font-semibold text-[#196515]">{caption}</p>
		</article>
	);
}

function ProcessCreationWizard({
	draft,
	setDraft,
	onCancel,
	onSubmit,
	heading,
	submitLabel,
}: {
	draft: ProcessCreationDraft;
	setDraft: (next: ProcessCreationDraft) => void;
	onCancel: () => void;
	onSubmit: () => void;
	heading: string;
	submitLabel: string;
}) {
	const [step, setStep] = useState(1);
	const [selectedPersonId, setSelectedPersonId] = useState(peopleDirectory[0]?.id ?? "");
	const [partyType, setPartyType] = useState<PartyType>("Parte");
	const [partyObs, setPartyObs] = useState("");
	const [newChecklistItem, setNewChecklistItem] = useState("");

	const selectedPerson = peopleDirectory.find((item) => item.id === selectedPersonId);

	const canGoStep2 = !!draft.nome.trim() && !!draft.tipo;
	const canGoStep3 = draft.clienteModo === "sem_cliente"
		|| (draft.clienteModo === "existente" && !!draft.clienteId)
		|| (draft.clienteModo === "novo" && !!draft.novoClienteNome.trim());
	const canGoStep4 = true;
	const canGoStep5 = draft.checklistUsaRecomendado !== null;
	const canCreate = canGoStep2 && canGoStep3;

	const setRecommendedChecklist = () => {
		const base = checklistByType[draft.tipo || "Outro"] ?? checklistByType.Outro;
		setDraft({
			...draft,
			checklistUsaRecomendado: true,
			checklist: base.map((item, index) => ({ id: `tmp-${index + 1}`, titulo: item, concluido: false })),
		});
	};

	const setEmptyChecklist = () => {
		setDraft({ ...draft, checklistUsaRecomendado: false, checklist: [] });
	};

	const addParty = () => {
		if (!selectedPerson) return;
		setDraft({
			...draft,
			partes: [
				...draft.partes,
				{
					id: `part-${crypto.randomUUID()}`,
					nome: selectedPerson.nome,
					tipo: partyType,
					contato: selectedPerson.contato,
					identificacao: selectedPerson.identificacao,
					observacao: partyObs,
				},
			],
		});
		setPartyObs("");
	};

	const addChecklistItem = () => {
		if (!newChecklistItem.trim()) return;
		setDraft({
			...draft,
			checklist: [...draft.checklist, { id: `custom-${crypto.randomUUID()}`, titulo: newChecklistItem.trim(), concluido: false }],
		});
		setNewChecklistItem("");
	};

	return (
		<section className="mx-auto max-w-5xl px-5 py-7 sm:px-8">
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-xs font-bold uppercase tracking-[.14em] text-[#6247c8]">Processos</p>
					<h1 className="mt-1 text-3xl font-semibold tracking-[-.03em]">{heading}</h1>
					<p className="mt-1 text-sm text-muted-foreground">Etapa {step} de 5</p>
				</div>
				<button onClick={onCancel} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#7c3aed]">
					Cancelar
				</button>
			</div>

			<div className="mb-4 flex flex-wrap gap-2">
				{[1, 2, 3, 4, 5].map((index) => (
					<span key={index} className={`rounded-full px-3 py-1 text-xs font-semibold ${index <= step ? "bg-[#eef3ff] text-[#193eaf]" : "bg-muted text-muted-foreground"}`}>
						Etapa {index}
					</span>
				))}
			</div>

			{step === 1 && (
				<article className="rounded-2xl border border-border bg-card p-5">
					<h2 className="text-lg font-semibold">Informacoes</h2>
					<div className="mt-4 grid gap-4 md:grid-cols-2">
						<label className="space-y-1.5">
							<span className="block text-sm font-semibold">Nome do processo *</span>
							<input value={draft.nome} onChange={(event) => setDraft({ ...draft, nome: event.target.value })} className="min-h-11 w-full rounded-lg border border-border px-3 text-sm" />
						</label>
						<label className="space-y-1.5">
							<span className="block text-sm font-semibold">Tipo de processo *</span>
							<select value={draft.tipo} onChange={(event) => setDraft({ ...draft, tipo: event.target.value as ProcessCreationDraft["tipo"] })} className="min-h-11 w-full rounded-lg border border-border px-3 text-sm">
								<option value="">Selecione</option>
								{processTypeOptions.map((item) => <option key={item}>{item}</option>)}
							</select>
						</label>
						<label className="space-y-1.5 md:col-span-2">
							<span className="block text-sm font-semibold">Descricao</span>
							<textarea value={draft.descricao} onChange={(event) => setDraft({ ...draft, descricao: event.target.value })} className="min-h-24 w-full rounded-lg border border-border px-3 py-2 text-sm" />
						</label>
						<label className="space-y-1.5">
							<span className="block text-sm font-semibold">Prioridade</span>
							<select value={draft.prioridade} onChange={(event) => setDraft({ ...draft, prioridade: event.target.value as ProcessCreationDraft["prioridade"] })} className="min-h-11 w-full rounded-lg border border-border px-3 text-sm">
								<option>Baixa</option>
								<option>Normal</option>
								<option>Alta</option>
								<option>Urgente</option>
							</select>
						</label>
						<label className="space-y-1.5">
							<span className="block text-sm font-semibold">Prazo principal</span>
							<input type="date" value={draft.prazoPrincipal} onChange={(event) => setDraft({ ...draft, prazoPrincipal: event.target.value })} className="min-h-11 w-full rounded-lg border border-border px-3 text-sm" />
						</label>
						<label className="space-y-1.5 md:col-span-2">
							<span className="block text-sm font-semibold">Responsavel</span>
							<select value={draft.responsavelPrincipal} onChange={(event) => setDraft({ ...draft, responsavelPrincipal: event.target.value })} className="min-h-11 w-full rounded-lg border border-border px-3 text-sm">
								{responsaveis.map((item) => <option key={item}>{item}</option>)}
							</select>
						</label>
					</div>
				</article>
			)}

			{step === 2 && (
				<article className="rounded-2xl border border-border bg-card p-5">
					<h2 className="text-lg font-semibold">Cliente</h2>
					<div className="mt-4 flex flex-wrap gap-2">
						<button onClick={() => setDraft({ ...draft, clienteModo: "existente" })} className={`min-h-11 rounded-lg border px-4 text-sm font-semibold ${draft.clienteModo === "existente" ? "border-[#2f63e5] bg-[#eef3ff] text-[#193eaf]" : "border-border"}`}>Selecionar cliente existente</button>
						<button onClick={() => setDraft({ ...draft, clienteModo: "novo" })} className={`min-h-11 rounded-lg border px-4 text-sm font-semibold ${draft.clienteModo === "novo" ? "border-[#2f63e5] bg-[#eef3ff] text-[#193eaf]" : "border-border"}`}>Cadastrar novo cliente</button>
						<button onClick={() => setDraft({ ...draft, clienteModo: "sem_cliente" })} className={`min-h-11 rounded-lg border px-4 text-sm font-semibold ${draft.clienteModo === "sem_cliente" ? "border-[#2f63e5] bg-[#eef3ff] text-[#193eaf]" : "border-border"}`}>Continuar sem cliente</button>
					</div>

					{draft.clienteModo === "existente" && (
						<label className="mt-4 block space-y-1.5">
							<span className="block text-sm font-semibold">Cliente existente</span>
							<select value={draft.clienteId} onChange={(event) => setDraft({ ...draft, clienteId: event.target.value })} className="min-h-11 w-full rounded-lg border border-border px-3 text-sm">
								{clients.map((item) => (
									<option key={item.id} value={item.id}>{item.nome} - {item.documento}</option>
								))}
							</select>
						</label>
					)}

					{draft.clienteModo === "novo" && (
						<div className="mt-4 grid gap-4 md:grid-cols-3">
							<label className="space-y-1.5 md:col-span-2">
								<span className="block text-sm font-semibold">Nome</span>
								<input value={draft.novoClienteNome} onChange={(event) => setDraft({ ...draft, novoClienteNome: event.target.value })} className="min-h-11 w-full rounded-lg border border-border px-3 text-sm" />
							</label>
							<label className="space-y-1.5">
								<span className="block text-sm font-semibold">Documento</span>
								<input value={draft.novoClienteDocumento} onChange={(event) => setDraft({ ...draft, novoClienteDocumento: event.target.value })} className="min-h-11 w-full rounded-lg border border-border px-3 text-sm" />
							</label>
							<label className="space-y-1.5 md:col-span-3">
								<span className="block text-sm font-semibold">Contato</span>
								<input value={draft.novoClienteContato} onChange={(event) => setDraft({ ...draft, novoClienteContato: event.target.value })} className="min-h-11 w-full rounded-lg border border-border px-3 text-sm" />
							</label>
						</div>
					)}
				</article>
			)}

			{step === 3 && (
				<article className="rounded-2xl border border-border bg-card p-5">
					<h2 className="text-lg font-semibold">Partes</h2>
					<p className="mt-1 text-sm text-muted-foreground">Utilize cadastros existentes para evitar duplicidade.</p>
					<div className="mt-4 grid gap-3 md:grid-cols-4">
						<select value={selectedPersonId} onChange={(event) => setSelectedPersonId(event.target.value)} className="min-h-11 rounded-lg border border-border px-3 text-sm md:col-span-2">
							{peopleDirectory.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
						</select>
						<select value={partyType} onChange={(event) => setPartyType(event.target.value as PartyType)} className="min-h-11 rounded-lg border border-border px-3 text-sm">
							{partyTypes.map((item) => <option key={item}>{item}</option>)}
						</select>
						<button onClick={addParty} className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted">Adicionar parte</button>
					</div>
					<label className="mt-3 block space-y-1.5">
						<span className="block text-sm font-semibold">Observacao</span>
						<input value={partyObs} onChange={(event) => setPartyObs(event.target.value)} className="min-h-11 w-full rounded-lg border border-border px-3 text-sm" />
					</label>

					<div className="mt-4 space-y-2">
						{draft.partes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma parte adicionada ainda.</p>}
						{draft.partes.map((party) => (
							<div key={party.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
								<div>
									<p className="text-sm font-semibold">{party.nome} - {party.tipo}</p>
									<p className="text-xs text-muted-foreground">{party.contato} | {party.identificacao}</p>
								</div>
								<button onClick={() => setDraft({ ...draft, partes: draft.partes.filter((item) => item.id !== party.id) })} className="min-h-10 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted">Remover</button>
							</div>
						))}
					</div>
				</article>
			)}

			{step === 4 && (
				<article className="rounded-2xl border border-border bg-card p-5">
					<h2 className="text-lg font-semibold">Checklist inicial</h2>
					<p className="mt-1 text-sm text-muted-foreground">Deseja utilizar um checklist recomendado para este processo?</p>
					<div className="mt-3 flex flex-wrap gap-2">
						<button onClick={setRecommendedChecklist} className="min-h-11 rounded-lg border border-[#bde7b4] bg-[#edf9ea] px-4 text-sm font-semibold text-[#196515]">Sim, utilizar checklist</button>
						<button onClick={setEmptyChecklist} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold">Nao, comecar vazio</button>
					</div>

					<div className="mt-4 rounded-xl border border-border p-4">
						<p className="text-sm font-semibold">Documentos necessarios</p>
						<div className="mt-2 space-y-2">
							{draft.checklist.length === 0 && <p className="text-sm text-muted-foreground">Checklist vazio. Adicione itens abaixo.</p>}
							{draft.checklist.map((item) => (
								<label key={item.id} className="flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm">
									<input
										type="checkbox"
										checked={item.concluido}
										onChange={(event) => {
											setDraft({
												...draft,
												checklist: draft.checklist.map((entry) => entry.id === item.id ? { ...entry, concluido: event.target.checked } : entry),
											});
										}}
										className="size-4 accent-[#2f63e5]"
									/>
									<span className="flex-1">{item.titulo}</span>
									<button onClick={() => setDraft({ ...draft, checklist: draft.checklist.filter((entry) => entry.id !== item.id) })} className="rounded border border-border px-2 py-1 text-xs">Excluir</button>
								</label>
							))}
						</div>
						<div className="mt-3 flex gap-2">
							<input value={newChecklistItem} onChange={(event) => setNewChecklistItem(event.target.value)} placeholder="Adicionar item" className="min-h-11 flex-1 rounded-lg border border-border px-3 text-sm" />
							<button onClick={addChecklistItem} className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold">Adicionar</button>
						</div>
					</div>
				</article>
			)}

			{step === 5 && (
				<article className="rounded-2xl border border-border bg-card p-5">
					<h2 className="text-lg font-semibold">Revisao</h2>
					<div className="mt-4 grid gap-3 sm:grid-cols-2">
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Processo</p><p>{draft.nome || "-"}</p></div>
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Cliente</p><p>{draft.clienteModo === "existente" ? clients.find((item) => item.id === draft.clienteId)?.nome : draft.clienteModo === "novo" ? draft.novoClienteNome : "Sem cliente"}</p></div>
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Partes</p><p>{draft.partes.length}</p></div>
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Responsavel</p><p>{draft.responsavelPrincipal}</p></div>
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Tipo</p><p>{draft.tipo || "-"}</p></div>
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Prazo</p><p>{draft.prazoPrincipal || "Sem prazo"}</p></div>
						<div className="rounded-lg border border-border p-3 text-sm sm:col-span-2"><p className="font-semibold">Checklist</p><p>{draft.checklist.length === 0 ? "Checklist vazio" : draft.checklist.map((item) => item.titulo).join(" | ")}</p></div>
					</div>
				</article>
			)}

			<div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
				<button onClick={() => step === 1 ? onCancel() : setStep(step - 1)} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">
					Voltar
				</button>
				<div className="flex gap-2">
					{step < 5 && (
						<button
							onClick={() => setStep(step + 1)}
							disabled={(step === 1 && !canGoStep2) || (step === 2 && !canGoStep3) || (step === 3 && !canGoStep4) || (step === 4 && !canGoStep5)}
							className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#2f63e5] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
						>
							Avancar
							<ArrowRight size={16} />
						</button>
					)}
					{step === 5 && (
						<button onClick={onSubmit} disabled={!canCreate} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#2f63e5] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55">
							{submitLabel}
							<CheckCircle2 size={16} />
						</button>
					)}
				</div>
			</div>
		</section>
	);
}

function ProcessDetail({
	detail,
	updateStatus,
	onBack,
	onOpenDocuments,
	onOpenSignatures,
	onOpenBureauIA,
	onOpenAudit,
}: {
	detail: ProcessDetailData;
	updateStatus: (status: ProcessStatus) => void;
	onBack: () => void;
	onOpenDocuments: () => void;
	onOpenSignatures: () => void;
	onOpenBureauIA: () => void;
	onOpenAudit: () => void;
}) {
	const [tab, setTab] = useState<TabKey>("visao_geral");
	const [tasks, setTasks] = useState(detail.tarefas);
	const [deadlines, setDeadlines] = useState(detail.prazos);
	const [newTask, setNewTask] = useState({ titulo: "", responsavel: detail.processo.responsavelPrincipal, prazo: "", prioridade: "Normal" as const, status: "A fazer" as const });

	const nextActionButton = detail.processo.proximaAcaoTipo === "assinatura"
		? { label: "Ver assinatura", onClick: onOpenSignatures }
		: detail.processo.proximaAcaoTipo === "ia"
			? { label: "Ver analise", onClick: onOpenBureauIA }
			: { label: "Resolver pendencia", onClick: onOpenDocuments };

	const docsApproved = detail.documentos.filter((item) => item.status === "aprovado").length;
	const docsPending = detail.documentos.filter((item) => item.status === "pendente").length;
	const docsReview = detail.documentos.filter((item) => item.status === "em_analise").length;
	const signDone = detail.assinaturas.filter((item) => item.status === "concluida").length;
	const signPending = detail.assinaturas.length - signDone;
	const taskDone = tasks.filter((item) => item.status === "Concluida").length;
	const taskPending = tasks.length - taskDone;
	const nearDeadline = deadlines.filter((item) => item.status === "hoje" || item.status === "proximos_7_dias").length;

	return (
		<section className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
			<button onClick={onBack} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-[#7c3aed]">
				<ArrowLeft size={16} />
				Voltar para processos
			</button>

			<article className="rounded-2xl border border-border bg-card p-5">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p className="text-xs font-bold uppercase tracking-[.14em] text-[#6247c8]">Processo #{detail.processo.id}</p>
						<h1 className="mt-1 text-2xl font-semibold">{detail.processo.nome} - {detail.processo.cliente}</h1>
						<p className="mt-2 text-sm text-muted-foreground">Responsavel: {detail.processo.responsavelPrincipal} | Criado em: {detail.processo.criadoEm} | Ultima atualizacao: {detail.processo.atualizadoEm}</p>
					</div>
					<div className="space-y-2 text-right">
						<span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(detail.processo.status)}`}>{detail.processo.status}</span>
						<div>
							<label className="mr-2 text-xs font-semibold text-muted-foreground">Mudar status</label>
							<select
								value={detail.processo.status}
								onChange={(event) => {
									const nextStatus = event.target.value as ProcessStatus;
									if (canTransition(detail.processo.status, nextStatus)) updateStatus(nextStatus);
								}}
								className="min-h-10 rounded-lg border border-border px-2 text-xs"
							>
								{[detail.processo.status, ...allowedTransitions(detail.processo.status)].map((item) => <option key={item}>{item}</option>)}
							</select>
						</div>
					</div>
				</div>

				<div className="mt-4 rounded-xl border border-[#d6e5ff] bg-[#f8fbff] p-4">
					<p className="text-sm font-semibold text-[#193eaf]">Proxima acao</p>
					<p className="mt-1 text-sm">{detail.processo.proximaAcao}</p>
					<button onClick={nextActionButton.onClick} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#2f63e5] px-4 text-sm font-semibold text-[#193eaf] hover:bg-[#eef3ff]">
						{nextActionButton.label}
					</button>
				</div>
			</article>

			<nav className="mt-4 flex flex-wrap gap-2" aria-label="Abas do processo">
				{[
					["visao_geral", "Visao geral"],
					["partes", "Partes"],
					["documentos", "Documentos"],
					["assinaturas", "Assinaturas"],
					["tarefas", "Tarefas"],
					["prazos", "Prazos"],
					["bureauia", "BureauIA"],
					["auditoria", "Auditoria"],
				].map(([id, label]) => (
					<button
						key={id}
						onClick={() => setTab(id as TabKey)}
						className={`min-h-11 rounded-lg border px-3 text-sm font-semibold ${tab === id ? "border-[#2f63e5] bg-[#eef3ff] text-[#193eaf]" : "border-border"}`}
					>
						{label}
					</button>
				))}
			</nav>

			{tab === "visao_geral" && (
				<div className="mt-4 space-y-4">
					<div className="grid gap-3 md:grid-cols-4">
						<SummaryCard title="Documentos" value={String(detail.documentos.length)} caption={`${docsApproved} aprovados | ${docsPending} pendentes | ${docsReview} em analise`} />
						<SummaryCard title="Assinaturas" value={String(detail.assinaturas.length)} caption={`${signDone} concluidas | ${signPending} pendentes`} />
						<SummaryCard title="Tarefas" value={String(tasks.length)} caption={`${taskDone} concluidas | ${taskPending} pendentes`} />
						<SummaryCard title="Prazos" value={String(deadlines.length)} caption={`${nearDeadline} proximos | ${Math.max(deadlines.length - nearDeadline, 0)} normais`} />
					</div>

					<article className="rounded-2xl border border-border bg-card p-5">
						<h2 className="text-lg font-semibold">Timeline do processo</h2>
						{detail.timeline.length === 0 ? (
							<div className="mt-3">
								<EmptyState title="Nenhum evento" text="Registre uma primeira acao para iniciar a trilha do processo." actionLabel="Registrar evento" onAction={() => undefined} />
							</div>
						) : (
							<ol className="mt-4 space-y-3">
								{detail.timeline.map((event) => (
									<li key={event.id} className="rounded-xl border border-border px-4 py-3">
										<div className="flex flex-wrap items-center justify-between gap-2">
											<p className="text-sm font-semibold">{event.data} - {event.hora}</p>
											<span className="rounded-full bg-[#eef3ff] px-2 py-0.5 text-xs font-semibold text-[#193eaf]">{event.origem}</span>
										</div>
										<p className="mt-1 text-sm">{event.evento}</p>
										<p className="text-sm text-muted-foreground">{event.descricao} | {event.usuario}</p>
									</li>
								))}
							</ol>
						)}
					</article>
				</div>
			)}

			{tab === "partes" && (
				<article className="mt-4 rounded-2xl border border-border bg-card p-5">
					<h2 className="text-lg font-semibold">Partes</h2>
					{detail.partes.length === 0 ? (
						<div className="mt-3">
							<EmptyState title="Nenhuma parte" text="Adicione participantes para distribuir responsabilidades do processo." actionLabel="Adicionar parte" onAction={() => undefined} />
						</div>
					) : (
						<div className="mt-3 overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="border-b border-border text-left text-muted-foreground">
										<th className="px-2 py-2">Nome</th>
										<th className="px-2 py-2">Tipo</th>
										<th className="px-2 py-2">Contato</th>
										<th className="px-2 py-2">Identificacao</th>
										<th className="px-2 py-2">Observacao</th>
									</tr>
								</thead>
								<tbody>
									{detail.partes.map((party) => (
										<tr key={party.id} className="border-b border-border/70">
											<td className="px-2 py-2 font-medium">{party.nome}</td>
											<td className="px-2 py-2">{party.tipo}</td>
											<td className="px-2 py-2">{party.contato}</td>
											<td className="px-2 py-2">{party.identificacao}</td>
											<td className="px-2 py-2">{party.observacao || "-"}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</article>
			)}

			{tab === "documentos" && (
				<article className="mt-4 rounded-2xl border border-border bg-card p-5">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h2 className="text-lg font-semibold">Documentos relacionados</h2>
						<button onClick={onOpenDocuments} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Abrir modulo documental</button>
					</div>
					{detail.documentos.length === 0 ? (
						<div className="mt-3">
							<EmptyState title="Nenhum documento" text="Crie uma solicitacao documental para iniciar o fluxo do processo." actionLabel="Solicitar documento" onAction={onOpenDocuments} />
						</div>
					) : (
						<div className="mt-3 overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="border-b border-border text-left text-muted-foreground">
										<th className="px-2 py-2">Documento</th>
										<th className="px-2 py-2">Responsavel</th>
										<th className="px-2 py-2">Status</th>
										<th className="px-2 py-2">Versao</th>
										<th className="px-2 py-2">Integridade</th>
										<th className="px-2 py-2">Atualizacao</th>
										<th className="px-2 py-2">Acoes</th>
									</tr>
								</thead>
								<tbody>
									{detail.documentos.map((doc) => (
										<tr key={doc.id} className="border-b border-border/70">
											<td className="px-2 py-2 font-medium">{doc.nome}</td>
											<td className="px-2 py-2">{doc.responsavel}</td>
											<td className="px-2 py-2">{doc.status}</td>
											<td className="px-2 py-2">{doc.versao}</td>
											<td className="px-2 py-2">{doc.integridade}</td>
											<td className="px-2 py-2">{doc.atualizadoEm}</td>
											<td className="px-2 py-2"><button onClick={onOpenDocuments} className="underline">Visualizar | Solicitar | Aprovar | Rejeitar | Substituir | Auditar</button></td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</article>
			)}

			{tab === "assinaturas" && (
				<article className="mt-4 rounded-2xl border border-border bg-card p-5">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h2 className="text-lg font-semibold">Assinaturas</h2>
						<button onClick={onOpenSignatures} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Ver assinatura</button>
					</div>
					{detail.assinaturas.length === 0 ? (
						<div className="mt-3">
							<EmptyState title="Nenhuma assinatura" text="Inicie um fluxo de assinatura para este processo quando houver documentos prontos." actionLabel="Criar assinatura" onAction={onOpenSignatures} />
						</div>
					) : (
						<div className="mt-3 space-y-3">
							{detail.assinaturas.map((signature) => (
								<div key={signature.id} className="rounded-xl border border-border p-4">
									<p className="font-semibold">{signature.documento}</p>
									<p className="mt-1 text-sm text-muted-foreground">Status: {signature.status} | Data: {signature.data} | Proxima assinatura: {signature.proximaAssinatura}</p>
									<ul className="mt-2 space-y-1 text-sm">
										{signature.assinantes.map((signer) => <li key={`${signature.id}-${signer.nome}`}>{signer.status === "concluida" ? "✓" : "●"} {signer.nome} - {signer.status}</li>)}
									</ul>
								</div>
							))}
						</div>
					)}
				</article>
			)}

			{tab === "tarefas" && (
				<article className="mt-4 rounded-2xl border border-border bg-card p-5">
					<h2 className="text-lg font-semibold">Tarefas</h2>
					<div className="mt-3 grid gap-2 md:grid-cols-6">
						<input placeholder="Tarefa" value={newTask.titulo} onChange={(event) => setNewTask({ ...newTask, titulo: event.target.value })} className="min-h-11 rounded-lg border border-border px-3 text-sm md:col-span-2" />
						<select value={newTask.responsavel} onChange={(event) => setNewTask({ ...newTask, responsavel: event.target.value })} className="min-h-11 rounded-lg border border-border px-3 text-sm">
							{responsaveis.map((item) => <option key={item}>{item}</option>)}
						</select>
						<input type="date" value={newTask.prazo} onChange={(event) => setNewTask({ ...newTask, prazo: event.target.value })} className="min-h-11 rounded-lg border border-border px-3 text-sm" />
						<select value={newTask.prioridade} onChange={(event) => setNewTask({ ...newTask, prioridade: event.target.value as typeof newTask.prioridade })} className="min-h-11 rounded-lg border border-border px-3 text-sm">
							<option>Baixa</option>
							<option>Normal</option>
							<option>Alta</option>
							<option>Urgente</option>
						</select>
						<button
							onClick={() => {
								if (!newTask.titulo.trim()) return;
								setTasks([...tasks, { id: `TSK-${crypto.randomUUID()}`, ...newTask, prazo: newTask.prazo || "Sem prazo" }]);
								setNewTask({ ...newTask, titulo: "", prazo: "" });
							}}
							className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted"
						>
							Criar
						</button>
					</div>

					{tasks.length === 0 ? (
						<div className="mt-3">
							<EmptyState title="Nenhuma tarefa" text="Crie tarefas para organizar o trabalho do processo." actionLabel="Criar primeira tarefa" onAction={() => undefined} />
						</div>
					) : (
						<div className="mt-3 overflow-x-auto">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="border-b border-border text-left text-muted-foreground">
										<th className="px-2 py-2">Tarefa</th>
										<th className="px-2 py-2">Responsavel</th>
										<th className="px-2 py-2">Prazo</th>
										<th className="px-2 py-2">Prioridade</th>
										<th className="px-2 py-2">Status</th>
										<th className="px-2 py-2">Acoes</th>
									</tr>
								</thead>
								<tbody>
									{tasks.map((task) => (
										<tr key={task.id} className="border-b border-border/70">
											<td className="px-2 py-2 font-medium">{task.titulo}</td>
											<td className="px-2 py-2">{task.responsavel}</td>
											<td className="px-2 py-2">{task.prazo}</td>
											<td className="px-2 py-2">{task.prioridade}</td>
											<td className="px-2 py-2">
												<select value={task.status} onChange={(event) => setTasks(tasks.map((item) => item.id === task.id ? { ...item, status: event.target.value as typeof task.status } : item))} className="min-h-9 rounded border border-border px-2 text-xs">
													<option>A fazer</option>
													<option>Em andamento</option>
													<option>Concluida</option>
													<option>Cancelada</option>
												</select>
											</td>
											<td className="px-2 py-2"><button onClick={() => setTasks(tasks.filter((item) => item.id !== task.id))} className="underline">Excluir</button></td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</article>
			)}

			{tab === "prazos" && (
				<article className="mt-4 rounded-2xl border border-border bg-card p-5">
					<h2 className="text-lg font-semibold">Prazos</h2>
					{deadlines.length === 0 ? (
						<div className="mt-3">
							<EmptyState title="Nenhum prazo" text="Defina os prazos para priorizar as proximas atividades." actionLabel="Adicionar prazo" onAction={() => undefined} />
						</div>
					) : (
						<div className="mt-3 grid gap-3 md:grid-cols-2">
							{[
								["vencido", "Vencidos", "bg-[#fff0ef] text-[#a12a21]"],
								["hoje", "Hoje", "bg-[#fff8e8] text-[#825700]"],
								["proximos_7_dias", "Proximos 7 dias", "bg-[#eef3ff] text-[#193eaf]"],
								["futuro", "Futuros", "bg-[#edf9ea] text-[#196515]"],
							].map(([key, label, cls]) => (
								<div key={key} className="rounded-xl border border-border p-3">
									<p className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</p>
									<div className="mt-2 space-y-2">
										{deadlines.filter((item) => item.status === key).length === 0 && <p className="text-sm text-muted-foreground">Sem itens.</p>}
										{deadlines.filter((item) => item.status === key).map((deadline) => (
											<div key={deadline.id} className="rounded-lg border border-border px-3 py-2 text-sm">
												<p className="font-semibold">{deadline.descricao}</p>
												<p className="text-muted-foreground">{deadline.data} | {deadline.responsavel}</p>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}

					<button
						onClick={() => {
							setDeadlines([
								...deadlines,
								{
									id: `PRZ-${crypto.randomUUID()}`,
									descricao: "Novo prazo definido manualmente",
									data: "2026-08-21",
									responsavel: detail.processo.responsavelPrincipal,
									status: "futuro",
								},
							]);
						}}
						className="mt-3 min-h-11 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted"
					>
						Criar prazo
					</button>
				</article>
			)}

			{tab === "bureauia" && (
				<article className="mt-4 rounded-2xl border border-border bg-card p-5">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h2 className="text-lg font-semibold">BureauIA</h2>
						<button onClick={onOpenBureauIA} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Abrir BureauIA</button>
					</div>
					<div className="mt-3 grid gap-3 sm:grid-cols-2">
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Pendencias encontradas</p><p>{detail.ai.pendencias}</p></div>
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Documento possivelmente ilegivel</p><p>{detail.ai.documentoIlegivel}</p></div>
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Campos identificados automaticamente</p><p>{detail.ai.camposIdentificados}</p></div>
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Proxima recomendacao</p><p>{detail.ai.proximaRecomendacao}</p></div>
					</div>
				</article>
			)}

			{tab === "auditoria" && (
				<article className="mt-4 rounded-2xl border border-border bg-card p-5">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h2 className="text-lg font-semibold">Auditoria</h2>
						<button onClick={onOpenAudit} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Ver auditoria completa</button>
					</div>
					<div className="mt-3 grid gap-3 sm:grid-cols-2">
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Ultima atividade</p><p>{detail.auditoria.ultimaAtividade}</p></div>
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Integridade</p><p>{detail.auditoria.integridade}</p></div>
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Eventos registrados</p><p>{detail.auditoria.eventosRegistrados}</p></div>
						<div className="rounded-lg border border-border p-3 text-sm"><p className="font-semibold">Versoes</p><p>{detail.auditoria.versoes}</p></div>
					</div>
				</article>
			)}
		</section>
	);
}

export default function ProcessesModule({ goToDashboard, goToDocuments, goToSignatures, goToBureauIA, goToAudit }: Props) {
	const [mode, setMode] = useState<"list" | "create" | "edit" | "detail">("list");
	const [processes, setProcesses] = useState<ProcessSummary[]>(initialProcesses);
	const [draft, setDraft] = useState<ProcessCreationDraft>(emptyDraft());
	const [editingId, setEditingId] = useState<string | null>(null);
	const [selectedId, setSelectedId] = useState(initialProcesses[0]?.id ?? "");
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<ProcessStatus | "Todos">("Todos");
	const [responsavelFilter, setResponsavelFilter] = useState<string>("Todos");
	const [tipoFilter, setTipoFilter] = useState<string>("Todos");
	const [sortBy, setSortBy] = useState<"id" | "cliente" | "status" | "atualizacao">("id");
	const [page, setPage] = useState(1);
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const [openContextId, setOpenContextId] = useState<string>("");
	const [toast, setToast] = useState("");

	const filtered = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		return processes
			.filter((item) => statusFilter === "Todos" || item.status === statusFilter)
			.filter((item) => responsavelFilter === "Todos" || item.responsavelPrincipal === responsavelFilter)
			.filter((item) => tipoFilter === "Todos" || item.tipo === tipoFilter)
			.filter((item) => {
				if (!normalized) return true;
				return [item.id, item.nome, item.cliente, item.responsavelPrincipal, item.proximaAcao].join(" ").toLowerCase().includes(normalized);
			})
			.sort((a, b) => {
				if (sortBy === "cliente") return a.cliente.localeCompare(b.cliente);
				if (sortBy === "status") return a.status.localeCompare(b.status);
				if (sortBy === "atualizacao") return a.atualizadoEm.localeCompare(b.atualizadoEm);
				return a.id.localeCompare(b.id);
			});
	}, [processes, statusFilter, responsavelFilter, tipoFilter, query, sortBy]);

	const pageSize = 4;
	const pages = Math.max(Math.ceil(filtered.length / pageSize), 1);
	const currentPage = Math.min(page, pages);
	const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
	const selected = processes.find((item) => item.id === selectedId);
	const detail = selected ? makeDetailData(selected) : null;

	const notify = (message: string) => {
		setToast(message);
		window.setTimeout(() => setToast(""), 2800);
	};

	const createProcess = () => {
		const nextId = `BF-${String(120 + processes.length + 1).padStart(6, "0")}`;
		const process = createProcessFromDraft(draft, nextId);
		setProcesses([process, ...processes]);
		setDraft(emptyDraft());
		setEditingId(null);
		setSelectedId(process.id);
		setMode("detail");
		notify("Processo criado com sucesso.");
	};

	const editProcess = () => {
		if (!editingId) return;
		setProcesses(processes.map((item) => {
			if (item.id !== editingId) return item;
			const edited = createProcessFromDraft(draft, item.id);
			return {
				...item,
				...edited,
				id: item.id,
				status: item.status,
				criadoEm: item.criadoEm,
				atualizadoEm: "Agora",
			};
		}));
		setSelectedId(editingId);
		setMode("detail");
		setEditingId(null);
		notify("Processo atualizado com sucesso.");
	};

	const startEdit = (row: ProcessSummary) => {
		const baseChecklist = (checklistByType[row.tipo] ?? checklistByType.Outro).map((item, index) => ({
			id: `edit-${index + 1}`,
			titulo: item,
			concluido: false,
		}));
		setDraft({
			nome: row.nome,
			tipo: row.tipo,
			descricao: row.descricao ?? "",
			prioridade: row.prioridade,
			prazoPrincipal: row.prazoPrincipal === "Sem prazo" ? "" : row.prazoPrincipal,
			responsavelPrincipal: row.responsavelPrincipal,
			clienteModo: row.cliente === "Sem cliente" ? "sem_cliente" : "existente",
			clienteId: clients.find((item) => item.nome === row.cliente)?.id ?? clients[0]?.id ?? "",
			novoClienteNome: "",
			novoClienteContato: "",
			novoClienteDocumento: "",
			partes: row.participantes.map((name) => {
				const person = peopleDirectory.find((item) => item.nome === name);
				return {
					id: `edit-part-${crypto.randomUUID()}`,
					nome: name,
					tipo: "Parte" as PartyType,
					contato: person?.contato ?? "",
					identificacao: person?.identificacao ?? "",
					observacao: "",
				};
			}),
			checklistUsaRecomendado: true,
			checklist: baseChecklist,
		});
		setEditingId(row.id);
		setMode("edit");
	};

	const duplicateProcess = (row: ProcessSummary) => {
		const nextId = `BF-${String(120 + processes.length + 1).padStart(6, "0")}`;
		setProcesses([{ ...row, id: nextId, nome: `${row.nome} (copia)`, criadoEm: "Hoje", atualizadoEm: "Agora", status: "Rascunho" }, ...processes]);
		notify(`Processo ${nextId} duplicado.`);
	};

	const archiveProcess = (row: ProcessSummary) => {
		setProcesses(processes.map((item) => item.id === row.id ? { ...item, status: "Arquivado", atualizadoEm: "Agora" } : item));
		notify(`Processo ${row.id} arquivado.`);
	};

	if (mode === "create") {
		return <ProcessCreationWizard draft={draft} setDraft={setDraft} onCancel={() => { setMode("list"); setEditingId(null); }} onSubmit={createProcess} heading="Novo processo" submitLabel="Criar processo" />;
	}

	if (mode === "edit") {
		return <ProcessCreationWizard draft={draft} setDraft={setDraft} onCancel={() => { setMode("list"); setEditingId(null); }} onSubmit={editProcess} heading="Editar processo" submitLabel="Salvar alteracoes" />;
	}

	if (mode === "detail" && detail) {
		return (
			<>
				<ProcessDetail
					detail={detail}
					updateStatus={(status) => {
						setProcesses(processes.map((item) => item.id === detail.processo.id ? { ...item, status, atualizadoEm: "Agora" } : item));
						notify(`Status atualizado para ${status}.`);
					}}
					onBack={() => setMode("list")}
					onOpenDocuments={goToDocuments}
					onOpenSignatures={goToSignatures}
					onOpenBureauIA={goToBureauIA}
					onOpenAudit={goToAudit}
				/>
				{toast && <div role="status" className="fixed bottom-5 right-5 rounded-xl bg-[#12306f] px-4 py-3 text-sm font-semibold text-white">{toast}</div>}
			</>
		);
	}

	const activeCount = processes.filter((item) => ["Em preparacao", "Aguardando informacoes", "Em andamento", "Aguardando assinatura", "Em analise"].includes(item.status)).length;
	const waitingInfoCount = processes.filter((item) => item.status === "Aguardando informacoes").length;
	const waitingSignatureCount = processes.filter((item) => item.status === "Aguardando assinatura").length;
	const pendingCount = processes.filter((item) => item.proximaAcaoTipo === "pendencia").length;
	const doneCount = processes.filter((item) => item.status === "Concluido").length;

	return (
		<section className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-xs font-bold uppercase tracking-[.14em] text-[#6247c8]">Orquestracao</p>
					<h1 className="mt-1 text-3xl font-semibold tracking-[-.03em]">Processos</h1>
					<p className="mt-1 text-sm text-muted-foreground">Acompanhe seus processos e saiba exatamente o que precisa acontecer a seguir.</p>
				</div>
				<div className="flex gap-2">
					<button onClick={goToDashboard} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Voltar ao painel</button>
					<button onClick={() => { setDraft(emptyDraft()); setEditingId(null); setMode("create"); }} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#2f63e5] px-4 text-sm font-semibold text-white"><Plus size={16} />Novo processo</button>
				</div>
			</div>

			<div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
				<SummaryCard title="Processos ativos" value={String(activeCount)} caption="Com andamento em curso" />
				<SummaryCard title="Aguardando informacoes" value={String(waitingInfoCount)} caption="Dependem de retorno" />
				<SummaryCard title="Aguardando assinatura" value={String(waitingSignatureCount)} caption="Fluxo de assinatura pendente" />
				<SummaryCard title="Com pendencias" value={String(pendingCount)} caption="Ha acao imediata" />
				<SummaryCard title="Concluidos" value={String(doneCount)} caption="Prontos para fechamento" />
			</div>

			<article className="mt-5 rounded-2xl border border-border bg-card p-4">
				<div className="grid gap-2 lg:grid-cols-[1.2fr_.8fr_.8fr_.7fr_.7fr]">
					<label className="relative block">
						<Search size={16} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
						<input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar processo, cliente, responsavel ou proxima acao" className="min-h-11 w-full rounded-lg border border-border pl-9 pr-3 text-sm" />
					</label>
					<select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as ProcessStatus | "Todos"); setPage(1); }} className="min-h-11 rounded-lg border border-border px-3 text-sm">
						<option>Todos</option>
						{statuses.map((item) => <option key={item}>{item}</option>)}
					</select>
					<select value={responsavelFilter} onChange={(event) => { setResponsavelFilter(event.target.value); setPage(1); }} className="min-h-11 rounded-lg border border-border px-3 text-sm">
						<option>Todos</option>
						{responsaveis.map((item) => <option key={item}>{item}</option>)}
					</select>
					<select value={tipoFilter} onChange={(event) => { setTipoFilter(event.target.value); setPage(1); }} className="min-h-11 rounded-lg border border-border px-3 text-sm">
						<option>Todos</option>
						{processTypeOptions.map((item) => <option key={item}>{item}</option>)}
					</select>
					<select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="min-h-11 rounded-lg border border-border px-3 text-sm">
						<option value="id">Ordenar: Processo</option>
						<option value="cliente">Ordenar: Cliente</option>
						<option value="status">Ordenar: Status</option>
						<option value="atualizacao">Ordenar: Atualizacao</option>
					</select>
				</div>

				<div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
					<p>Selecionados: {selectedRows.length}</p>
					<p className="inline-flex items-center gap-1"><SlidersHorizontal size={14} />Filtros e paginacao simulados para futura API</p>
				</div>

				{processes.length === 0 ? (
					<div className="mt-4">
						<EmptyState title="Nenhum processo" text="Crie seu primeiro processo para conectar partes, documentos e assinaturas em um unico contexto." actionLabel="Criar processo" onAction={() => { setDraft(emptyDraft()); setEditingId(null); setMode("create"); }} />
					</div>
				) : filtered.length === 0 ? (
					<div className="mt-4">
						<EmptyState title="Nenhum resultado para o filtro" text="Ajuste status, responsavel ou tipo para encontrar processos." actionLabel="Limpar filtros" onAction={() => { setQuery(""); setStatusFilter("Todos"); setResponsavelFilter("Todos"); setTipoFilter("Todos"); }} />
					</div>
				) : (
					<>
						<div className="mt-4 hidden overflow-x-auto md:block">
							<table className="min-w-full text-sm">
								<thead>
									<tr className="border-b border-border text-left text-muted-foreground">
										<th className="px-2 py-2"><span className="sr-only">Selecionar</span></th>
										<th className="px-2 py-2">Processo</th>
										<th className="px-2 py-2">Cliente</th>
										<th className="px-2 py-2">Tipo</th>
										<th className="px-2 py-2">Responsavel</th>
										<th className="px-2 py-2">Status</th>
										<th className="px-2 py-2">Proxima acao</th>
										<th className="px-2 py-2">Atualizacao</th>
										<th className="px-2 py-2">Acoes</th>
									</tr>
								</thead>
								<tbody>
									{paged.map((row) => (
										<tr key={row.id} className="border-b border-border/70">
											<td className="px-2 py-3"><input type="checkbox" checked={selectedRows.includes(row.id)} onChange={(event) => setSelectedRows(event.target.checked ? [...selectedRows, row.id] : selectedRows.filter((item) => item !== row.id))} className="size-4 accent-[#2f63e5]" /></td>
											<td className="px-2 py-3 font-semibold">{row.id}</td>
											<td className="px-2 py-3">{row.cliente}</td>
											<td className="px-2 py-3">{row.tipo}</td>
											<td className="px-2 py-3">{row.responsavelPrincipal}</td>
											<td className="px-2 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}>{row.status}</span></td>
											<td className="px-2 py-3">{row.proximaAcao}</td>
											<td className="px-2 py-3">{row.atualizadoEm}</td>
											<td className="px-2 py-3">
												<div className="flex items-center gap-2">
													<button onClick={() => { setSelectedId(row.id); setMode("detail"); }} className="rounded border border-border px-2 py-1 text-xs font-semibold">Abrir</button>
													<button
														onClick={() => {
															const next = allowedTransitions(row.status)[0];
															if (!next) return;
															setProcesses(processes.map((item) => item.id === row.id ? { ...item, status: next, atualizadoEm: "Agora" } : item));
														}}
														className="rounded border border-border px-2 py-1 text-xs font-semibold"
													>
														Avancar status
													</button>
													<button onClick={() => setOpenContextId(openContextId === row.id ? "" : row.id)} className="rounded border border-border px-2 py-1 text-xs font-semibold">Menu</button>
												</div>
												{openContextId === row.id && (
													<div className="mt-2 rounded-lg border border-border bg-white p-2 shadow-md dark:bg-[#101828]">
														<button onClick={() => { setSelectedId(row.id); setMode("detail"); }} className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-muted">Visualizar</button>
														<button onClick={() => { startEdit(row); setOpenContextId(""); }} className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-muted">Editar</button>
														<button onClick={() => { duplicateProcess(row); setOpenContextId(""); }} className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-muted">Duplicar</button>
														<button onClick={() => { archiveProcess(row); setOpenContextId(""); }} className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-muted">Arquivar</button>
													</div>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="mt-4 space-y-3 md:hidden">
							{paged.map((row) => (
								<article key={row.id} className="rounded-xl border border-border p-4">
									<div className="flex items-start justify-between gap-2">
										<div>
											<p className="font-semibold">{row.id}</p>
											<p className="text-sm text-muted-foreground">{row.nome} - {row.cliente}</p>
										</div>
										<span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}>{row.status}</span>
									</div>
									<p className="mt-2 text-sm">Proxima acao: {row.proximaAcao}</p>
									<p className="mt-1 text-xs text-muted-foreground">Atualizacao: {row.atualizadoEm}</p>
									<div className="mt-3 flex gap-2">
										<button onClick={() => { setSelectedId(row.id); setMode("detail"); }} className="min-h-10 rounded-lg border border-border px-3 text-xs font-semibold">Abrir</button>
										<button onClick={() => startEdit(row)} className="min-h-10 rounded-lg border border-border px-3 text-xs font-semibold">Editar</button>
									</div>
								</article>
							))}
						</div>

						<div className="mt-4 flex flex-wrap items-center justify-between gap-2">
							<p className="text-xs text-muted-foreground">Pagina {currentPage} de {pages}</p>
							<div className="flex gap-2">
								<button onClick={() => setPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="min-h-10 rounded-lg border border-border px-3 text-xs font-semibold disabled:opacity-55">Anterior</button>
								<button onClick={() => setPage(Math.min(currentPage + 1, pages))} disabled={currentPage === pages} className="min-h-10 rounded-lg border border-border px-3 text-xs font-semibold disabled:opacity-55">Proxima</button>
							</div>
						</div>
					</>
				)}
			</article>

			{toast && (
				<div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-50 rounded-xl bg-[#12306f] px-4 py-3 text-sm font-semibold text-white">
					{toast}
				</div>
			)}
		</section>
	);
}

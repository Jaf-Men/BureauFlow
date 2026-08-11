import type { ProcessAIInsight } from "../ai";
import type { ProcessAuditSnapshot } from "../audit";
import type { ProcessDeadline } from "../deadlines";
import type { ProcessDocumentSnapshot } from "../documents";
import type { ProcessSignatureSnapshot } from "../signatures";
import type { ProcessTask } from "../tasks";
import type { ProcessCreationDraft, ProcessDetailData, ProcessSummary, ProcessTypeOption } from "./types";

export const processTypeOptions: ProcessTypeOption[] = [
  "Trabalhista",
  "Civel",
  "Familia",
  "Imobiliario",
  "Empresarial",
  "Administrativo",
  "Licitacao",
  "Documental",
  "Outro",
];

export const responsaveis = ["Ana Souza", "Paulo Costa", "Marina Lopes", "Ricardo Mota", "Joana Prado"];

export const clientes = [
  { id: "CL-1", nome: "Joao da Silva", contato: "joao@email.com", documento: "123.456.789-00" },
  { id: "CL-2", nome: "Maria Santos", contato: "maria@email.com", documento: "321.654.987-00" },
  { id: "CL-3", nome: "Grupo Atlante", contato: "contato@atlante.com", documento: "12.345.678/0001-99" },
];

// Alias in English for compatibility with existing imports.
export const clients = clientes;

export const peopleDirectory = [
  { id: "P-1", nome: "Joao da Silva", contato: "(11) 99881-1234", identificacao: "CPF 123.456.789-00" },
  { id: "P-2", nome: "Maria Santos", contato: "(11) 99882-1234", identificacao: "CPF 321.654.987-00" },
  { id: "P-3", nome: "Ana Souza", contato: "ana@fluxhub.com", identificacao: "OAB/SP 112233" },
  { id: "P-4", nome: "Ricardo Mota", contato: "ricardo@fluxhub.com", identificacao: "OAB/SP 778899" },
];

export const checklistByType: Record<ProcessTypeOption, string[]> = {
  Trabalhista: ["Documento de identificacao", "CPF", "Comprovante de residencia", "Procuracao"],
  Civel: ["Documento de identificacao", "CPF", "Comprovante de residencia", "Contrato"],
  Familia: ["Documento de identificacao", "CPF", "Certidao", "Comprovante de residencia"],
  Imobiliario: ["Documento de identificacao", "CPF", "Contrato", "Comprovante de residencia"],
  Empresarial: ["Contrato social", "CNPJ", "Certidao", "Procuracao"],
  Administrativo: ["Documento de identificacao", "CPF", "Comprovante de residencia", "Requerimento"],
  Licitacao: ["Contrato social", "CNPJ", "Certidao", "Comprovante bancario"],
  Documental: ["Documento de identificacao", "CPF", "Comprovante de residencia"],
  Outro: ["Documento principal", "Comprovante complementar"],
};

const baseDocuments: ProcessDocumentSnapshot[] = [
  { id: "DOC-1", nome: "RG", responsavel: "Joao da Silva", status: "aprovado", versao: 2, integridade: "garantida", atualizadoEm: "Hoje" },
  { id: "DOC-2", nome: "Comprovante de residencia", responsavel: "Joao da Silva", status: "pendente", versao: 1, integridade: "pendente", atualizadoEm: "Hoje" },
  { id: "DOC-3", nome: "Procuracao", responsavel: "Ana Souza", status: "em_analise", versao: 1, integridade: "garantida", atualizadoEm: "Ontem" },
];

const baseSignatures: ProcessSignatureSnapshot[] = [
  {
    id: "SIG-1",
    documento: "Contrato de prestacao de servicos",
    status: "andamento",
    data: "2026-08-10",
    proximaAssinatura: "Maria Silva",
    assinantes: [
      { nome: "Ana Souza", status: "concluida" },
      { nome: "Joao Silva", status: "concluida" },
      { nome: "Maria Silva", status: "aguardando" },
    ],
  },
];

const baseTasks: ProcessTask[] = [
  { id: "TSK-1", titulo: "Solicitar comprovante atualizado", responsavel: "Ana Souza", prazo: "2026-08-11", prioridade: "Alta", status: "A fazer" },
  { id: "TSK-2", titulo: "Revisar clausula 4", responsavel: "Ricardo Mota", prazo: "2026-08-12", prioridade: "Normal", status: "Em andamento" },
  { id: "TSK-3", titulo: "Validar assinatura final", responsavel: "Ana Souza", prazo: "2026-08-13", prioridade: "Urgente", status: "Concluida" },
];

const baseDeadlines: ProcessDeadline[] = [
  { id: "PRZ-1", descricao: "Prazo para envio de comprovante", data: "2026-08-10", responsavel: "Joao da Silva", status: "hoje" },
  { id: "PRZ-2", descricao: "Prazo para assinatura final", data: "2026-08-14", responsavel: "Maria Silva", status: "proximos_7_dias" },
  { id: "PRZ-3", descricao: "Prazo de encerramento do processo", data: "2026-08-28", responsavel: "Ana Souza", status: "futuro" },
];

const baseAI: ProcessAIInsight = {
  pendencias: 2,
  documentoIlegivel: 1,
  camposIdentificados: 3,
  proximaRecomendacao: "Solicitar novo comprovante de residencia.",
};

const baseAudit: ProcessAuditSnapshot = {
  ultimaAtividade: "Hoje 10:32",
  integridade: "garantida",
  eventosRegistrados: 34,
  versoes: 7,
};

export const initialProcesses: ProcessSummary[] = [
  {
    id: "BF-000124",
    nome: "Acao Trabalhista",
    cliente: "Joao da Silva",
    tipo: "Trabalhista",
    responsavelPrincipal: "Ana Souza",
    participantes: ["Ricardo Mota"],
    organizacao: "FluxHub Legal",
    status: "Em andamento",
    proximaAcao: "Aguardando comprovante de residencia de Joao.",
    proximaAcaoTipo: "pendencia",
    prioridade: "Alta",
    prazoPrincipal: "2026-08-14",
    criadoEm: "2026-08-08",
    atualizadoEm: "Hoje",
    descricao: "Processo principal da carteira trabalhista.",
  },
  {
    id: "BF-000125",
    nome: "Regularizacao Imobiliaria",
    cliente: "Maria Santos",
    tipo: "Imobiliario",
    responsavelPrincipal: "Paulo Costa",
    participantes: ["Ana Souza"],
    organizacao: "FluxHub Legal",
    status: "Aguardando assinatura",
    proximaAcao: "Contrato aguardando assinatura de Maria.",
    proximaAcaoTipo: "assinatura",
    prioridade: "Normal",
    prazoPrincipal: "2026-08-16",
    criadoEm: "2026-08-06",
    atualizadoEm: "Ontem",
  },
  {
    id: "BF-000126",
    nome: "Analise Documental Empresarial",
    cliente: "Grupo Atlante",
    tipo: "Empresarial",
    responsavelPrincipal: "Marina Lopes",
    participantes: ["Ana Souza", "Ricardo Mota"],
    organizacao: "FluxHub Legal",
    status: "Em analise",
    proximaAcao: "BureauIA encontrou 2 documentos que precisam de atencao.",
    proximaAcaoTipo: "ia",
    prioridade: "Urgente",
    prazoPrincipal: "2026-08-12",
    criadoEm: "2026-08-05",
    atualizadoEm: "Hoje",
  },
  {
    id: "BF-000127",
    nome: "Inventario Familiar",
    cliente: "Luciana Prado",
    tipo: "Familia",
    responsavelPrincipal: "Ricardo Mota",
    participantes: ["Paulo Costa"],
    organizacao: "FluxHub Legal",
    status: "Aguardando informacoes",
    proximaAcao: "Aguardando envio da certidao principal.",
    proximaAcaoTipo: "pendencia",
    prioridade: "Normal",
    prazoPrincipal: "2026-08-20",
    criadoEm: "2026-08-01",
    atualizadoEm: "3 dias",
  },
  {
    id: "BF-000128",
    nome: "Defesa Administrativa",
    cliente: "Carlos Nogueira",
    tipo: "Administrativo",
    responsavelPrincipal: "Joana Prado",
    participantes: ["Ana Souza"],
    organizacao: "FluxHub Legal",
    status: "Concluido",
    proximaAcao: "Processo pronto para arquivamento.",
    proximaAcaoTipo: "pendencia",
    prioridade: "Baixa",
    prazoPrincipal: "2026-08-04",
    criadoEm: "2026-07-15",
    atualizadoEm: "5 dias",
  },
];

export function emptyDraft(): ProcessCreationDraft {
  return {
    nome: "",
    tipo: "",
    descricao: "",
    prioridade: "Normal",
    prazoPrincipal: "",
    responsavelPrincipal: responsaveis[0],
    clienteModo: "existente",
    clienteId: clientes[0].id,
    novoClienteNome: "",
    novoClienteContato: "",
    novoClienteDocumento: "",
    partes: [],
    checklistUsaRecomendado: null,
    checklist: [],
  };
}

export function makeDetailData(processo: ProcessSummary): ProcessDetailData {
  return {
    processo,
    partes: [
      { id: "PAR-1", nome: processo.cliente, tipo: "Cliente", contato: "cliente@email.com", identificacao: "CPF 000.000.000-00", observacao: "Contato principal" },
      { id: "PAR-2", nome: processo.responsavelPrincipal, tipo: "Advogado", contato: "responsavel@fluxhub.com", identificacao: "OAB/SP 112233", observacao: "Responsavel principal" },
    ],
    checklist: (checklistByType[processo.tipo] ?? checklistByType.Outro).map((item, index) => ({ id: `CHK-${index + 1}`, titulo: item, concluido: index < 2 })),
    timeline: [
      { id: "TL-1", data: "Hoje", hora: "10:32", usuario: "BureauIA", evento: "Analise documental", descricao: "Documento legivel validado.", origem: "BureauIA" },
      { id: "TL-2", data: "Hoje", hora: "10:15", usuario: processo.cliente, evento: "Documento enviado", descricao: "Cliente enviou RG.", origem: "Documentos" },
      { id: "TL-3", data: "Hoje", hora: "09:48", usuario: "Sistema", evento: "Solicitacao enviada", descricao: "Solicitacao documental enviada.", origem: "Processo" },
      { id: "TL-4", data: "Ontem", hora: "16:20", usuario: "Sistema", evento: "Processo criado", descricao: `Processo ${processo.id} criado.`, origem: "Processo" },
      { id: "TL-5", data: "Ontem", hora: "16:22", usuario: "Sistema", evento: "Cliente associado", descricao: `Cliente ${processo.cliente} associado ao processo.`, origem: "Processo" },
    ],
    documentos: baseDocuments,
    assinaturas: baseSignatures,
    tarefas: baseTasks,
    prazos: baseDeadlines,
    ai: baseAI,
    auditoria: baseAudit,
  };
}

export function createProcessFromDraft(draft: ProcessCreationDraft, newId: string): ProcessSummary {
  const cliente = draft.clienteModo === "existente"
    ? clientes.find((item) => item.id === draft.clienteId)?.nome ?? "Sem cliente"
    : draft.clienteModo === "novo"
      ? draft.novoClienteNome || "Novo cliente"
      : "Sem cliente";

  return {
    id: newId,
    nome: draft.nome,
    cliente,
    tipo: draft.tipo || "Outro",
    responsavelPrincipal: draft.responsavelPrincipal,
    participantes: draft.partes.map((item) => item.nome).slice(0, 3),
    organizacao: "FluxHub Legal",
    status: "Rascunho",
    proximaAcao: "Definir documentos iniciais do processo.",
    proximaAcaoTipo: "pendencia",
    prioridade: draft.prioridade,
    prazoPrincipal: draft.prazoPrincipal || "Sem prazo",
    criadoEm: "Hoje",
    atualizadoEm: "Agora",
    descricao: draft.descricao,
  };
}

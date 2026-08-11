import type { ProcessAIInsight } from "../ai";
import type { ProcessAuditSnapshot } from "../audit";
import type { ProcessDeadline } from "../deadlines";
import type { ProcessDocumentSnapshot } from "../documents";
import type { ProcessSignatureSnapshot } from "../signatures";
import type { ProcessTask, TaskPriority } from "../tasks";

export type ProcessStatus =
  | "Rascunho"
  | "Em preparacao"
  | "Aguardando informacoes"
  | "Em andamento"
  | "Aguardando assinatura"
  | "Em analise"
  | "Concluido"
  | "Arquivado";

export type ProcessTypeOption =
  | "Trabalhista"
  | "Civel"
  | "Familia"
  | "Imobiliario"
  | "Empresarial"
  | "Administrativo"
  | "Licitacao"
  | "Documental"
  | "Outro";

export type PartyType = "Cliente" | "Parte" | "Representante" | "Empresa" | "Advogado" | "Testemunha" | "Outro";

export type Participant = {
  id: string;
  nome: string;
  tipo: PartyType;
  contato: string;
  identificacao: string;
  observacao: string;
};

export type TimelineOrigin = "Processo" | "Documentos" | "Assinaturas" | "BureauIA" | "Auditoria" | "Tarefas" | "Prazos";

export type TimelineEvent = {
  id: string;
  data: string;
  hora: string;
  usuario: string;
  evento: string;
  descricao: string;
  origem: TimelineOrigin;
};

export type ProcessSummary = {
  id: string;
  nome: string;
  cliente: string;
  tipo: ProcessTypeOption;
  responsavelPrincipal: string;
  participantes: string[];
  organizacao: string;
  status: ProcessStatus;
  proximaAcao: string;
  proximaAcaoTipo: "pendencia" | "assinatura" | "ia";
  prioridade: TaskPriority;
  prazoPrincipal: string;
  criadoEm: string;
  atualizadoEm: string;
  descricao?: string;
};

export type ProcessDetailData = {
  processo: ProcessSummary;
  partes: Participant[];
  checklist: Array<{ id: string; titulo: string; concluido: boolean }>;
  timeline: TimelineEvent[];
  documentos: ProcessDocumentSnapshot[];
  assinaturas: ProcessSignatureSnapshot[];
  tarefas: ProcessTask[];
  prazos: ProcessDeadline[];
  ai: ProcessAIInsight;
  auditoria: ProcessAuditSnapshot;
};

export type ProcessCreationDraft = {
  nome: string;
  tipo: ProcessTypeOption | "";
  descricao: string;
  prioridade: TaskPriority;
  prazoPrincipal: string;
  responsavelPrincipal: string;
  clienteModo: "existente" | "novo" | "sem_cliente";
  clienteId: string;
  novoClienteNome: string;
  novoClienteContato: string;
  novoClienteDocumento: string;
  partes: Participant[];
  checklistUsaRecomendado: boolean | null;
  checklist: Array<{ id: string; titulo: string; concluido: boolean }>;
};

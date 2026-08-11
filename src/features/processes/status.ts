import type { ProcessStatus } from "./types";

export const processStatusOrder: ProcessStatus[] = [
  "Rascunho",
  "Em preparacao",
  "Aguardando informacoes",
  "Em andamento",
  "Aguardando assinatura",
  "Em analise",
  "Concluido",
  "Arquivado",
];

const allowedMap: Record<ProcessStatus, ProcessStatus[]> = {
  Rascunho: ["Em preparacao"],
  "Em preparacao": ["Rascunho", "Aguardando informacoes", "Em andamento"],
  "Aguardando informacoes": ["Em preparacao", "Em andamento"],
  "Em andamento": ["Aguardando assinatura", "Em analise", "Aguardando informacoes"],
  "Aguardando assinatura": ["Em andamento", "Em analise"],
  "Em analise": ["Em andamento", "Concluido"],
  Concluido: ["Arquivado"],
  Arquivado: [],
};

export function allowedTransitions(status: ProcessStatus) {
  return allowedMap[status];
}

export function canTransition(from: ProcessStatus, to: ProcessStatus) {
  return from === to || allowedMap[from].includes(to);
}

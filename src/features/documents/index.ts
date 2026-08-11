export type ProcessDocumentStatus = "pendente" | "em_analise" | "aprovado" | "rejeitado";

export type ProcessDocumentSnapshot = {
  id: string;
  nome: string;
  responsavel: string;
  status: ProcessDocumentStatus;
  versao: number;
  integridade: "garantida" | "pendente" | "alterado";
  atualizadoEm: string;
};

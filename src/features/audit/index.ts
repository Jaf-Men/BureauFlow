export type ProcessAuditSnapshot = {
  ultimaAtividade: string;
  integridade: "garantida" | "pendente" | "alterado";
  eventosRegistrados: number;
  versoes: number;
};

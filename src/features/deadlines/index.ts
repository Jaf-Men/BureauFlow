export type DeadlineStatus = "vencido" | "hoje" | "proximos_7_dias" | "futuro";

export type ProcessDeadline = {
  id: string;
  descricao: string;
  data: string;
  responsavel: string;
  status: DeadlineStatus;
};

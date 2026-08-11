export type TaskPriority = "Baixa" | "Normal" | "Alta" | "Urgente";
export type TaskStatus = "A fazer" | "Em andamento" | "Concluida" | "Cancelada";

export type ProcessTask = {
  id: string;
  titulo: string;
  responsavel: string;
  prazo: string;
  prioridade: TaskPriority;
  status: TaskStatus;
};

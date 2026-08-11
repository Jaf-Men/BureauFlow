export type SignaturePartyState = "concluida" | "aguardando";

export type SignatureParty = {
  nome: string;
  status: SignaturePartyState;
};

export type ProcessSignatureSnapshot = {
  id: string;
  documento: string;
  status: "aguardando" | "andamento" | "concluida";
  data: string;
  proximaAssinatura: string;
  assinantes: SignatureParty[];
};

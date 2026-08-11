import { Injectable, NotFoundException } from "@nestjs/common";

export type ProcessType = "Trabalhista" | "Inventario" | "Usucapiao" | "Licitacao" | "Imovel" | "Empresa" | "Consumidor" | "Familia";
export type AlertType = "CPF invalido" | "Documento ilegivel" | "Imagem cortada" | "Baixa resolucao" | "Duplicado";

export type OCRFields = {
  nome: string;
  cpf: string;
  rg: string;
  nascimento: string;
  orgaoEmissor: string;
  validade: string;
  endereco: string;
};

export type AnalysisDoc = {
  id: string;
  nomeArquivo: string;
  processo: ProcessType;
  qualidade: "boa" | "media" | "baixa";
  versao: number;
};

export type ChecklistSuggestion = {
  processo: ProcessType;
  faltantes: string[];
};

@Injectable()
export class BureauIAService {
  private readonly docs: AnalysisDoc[] = [
    { id: "AID-201", nomeArquivo: "rg-marina.pdf", processo: "Trabalhista", qualidade: "boa", versao: 1 },
    { id: "AID-202", nomeArquivo: "cpf-marina.jpg", processo: "Trabalhista", qualidade: "media", versao: 2 },
    { id: "AID-203", nomeArquivo: "comprovante-endereco.png", processo: "Imovel", qualidade: "baixa", versao: 1 },
  ];

  private readonly checklistByProcess: Record<ProcessType, string[]> = {
    Trabalhista: ["RG", "CPF", "Carteira de Trabalho", "Comprovante de Endereco"],
    Inventario: ["RG", "CPF", "Certidao", "Comprovante Bancario"],
    Usucapiao: ["RG", "CPF", "Comprovante de Endereco", "Laudo"],
    Licitacao: ["Contrato Social", "Certidao", "Comprovante Bancario", "Procuracao"],
    Imovel: ["RG", "CPF", "Contrato", "Comprovante Bancario"],
    Empresa: ["Contrato Social", "Certidao", "Comprovante Bancario"],
    Consumidor: ["RG", "CPF", "Contrato", "Comprovante de Endereco"],
    Familia: ["RG", "CPF", "Certidao", "Comprovante de Endereco"],
  };

  listDocs() {
    return { items: this.docs };
  }

  analyzeDocument(docId: string) {
    const doc = this.getDocById(docId);
    const ocr = this.makeOCR(doc);
    const alerts = this.deriveAlerts(doc);
    const baseline = this.makeOCR({ id: "BASE", nomeArquivo: "baseline", processo: doc.processo, qualidade: "boa", versao: 1 });

    return {
      ocr,
      summary: `${ocr.nome}, CPF ${ocr.cpf}, RG ${ocr.rg}, validade ${ocr.validade}.`,
      comparisons: {
        cpfCoincide: ocr.cpf === baseline.cpf,
        nomeCoincide: ocr.nome === baseline.nome,
        enderecoMudou: ocr.endereco !== baseline.endereco,
        documentoVencido: new Date(ocr.validade) < new Date(),
      },
      alerts,
      generatedAt: new Date().toISOString(),
    };
  }

  checklist(processo: ProcessType) {
    return {
      processo,
      faltantes: this.checklistByProcess[processo].slice(0, 2),
    };
  }

  alerts(docId: string) {
    const doc = this.getDocById(docId);
    return { items: this.deriveAlerts(doc) };
  }

  chat(prompt: string) {
    const lower = prompt.toLowerCase();
    let answer = "Analisei o processo e recomendo revisar pendencias e prazos desta semana.";

    if (lower.includes("pendencia")) answer = "Pendencias atuais: documentos faltantes no checklist e alerta de qualidade em um arquivo.";
    if (lower.includes("risco")) answer = "Riscos: baixa resolucao pode atrasar aprovacao e gerar retrabalho.";
    if (lower.includes("prazo")) answer = "Prazos: priorize validacao em 24h para manter o cronograma do processo.";
    if (lower.includes("proxima") || lower.includes("acao")) answer = "Proximas acoes: solicitar reenvio do arquivo critico e concluir validacao de dados extraidos.";

    return { answer };
  }

  insights(input: { alerts: AlertType[]; checklistSuggestions: ChecklistSuggestion[]; hasOcr: boolean }) {
    const pendencias = input.checklistSuggestions.flatMap((item) => item.faltantes).slice(0, 4);
    const riscos = input.alerts.length > 0
      ? ["Risco de retrabalho documental", "Risco de atraso por baixa qualidade"]
      : ["Sem riscos criticos identificados"];

    return {
      pendencias,
      riscos,
      prazos: ["Revisar pendencias em ate 24h", "Validar novos uploads antes do prazo final"],
      proximasAcoes: ["Solicitar documento faltante", "Confirmar dados extraidos", "Concluir aprovacao documental"],
      economiaMin: input.hasOcr ? 42 : 0,
      camposPreenchidos: input.hasOcr ? 7 : 0,
    };
  }

  private getDocById(docId: string) {
    const doc = this.docs.find((item) => item.id === docId);
    if (!doc) throw new NotFoundException("Documento nao encontrado para analise.");
    return doc;
  }

  private makeOCR(doc: AnalysisDoc): OCRFields {
    if (doc.id === "AID-203") {
      return {
        nome: "Carlos Matos",
        cpf: "123.456.789-00",
        rg: "40.123.123-4",
        nascimento: "1992-06-12",
        orgaoEmissor: "SSP-SP",
        validade: "2026-02-10",
        endereco: "Rua das Flores, 321 - Sao Paulo/SP",
      };
    }

    return {
      nome: "Marina Costa",
      cpf: "321.654.987-00",
      rg: "55.987.234-1",
      nascimento: "1989-03-22",
      orgaoEmissor: "SSP-RJ",
      validade: "2030-12-01",
      endereco: "Av. Brasil, 1000 - Rio de Janeiro/RJ",
    };
  }

  private deriveAlerts(doc: AnalysisDoc): AlertType[] {
    if (doc.qualidade === "baixa") return ["Documento ilegivel", "Imagem cortada", "Baixa resolucao"];
    if (doc.qualidade === "media") return ["Duplicado"];
    return [];
  }
}

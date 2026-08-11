import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle2,
  Clock3,
  Copy,
  FileSearch,
  FileText,
  ListChecks,
  ScanText,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { api } from "./api";

type ProcessType = "Trabalhista" | "Inventario" | "Usucapiao" | "Licitacao" | "Imovel" | "Empresa" | "Consumidor" | "Familia";
type AlertType = "CPF invalido" | "Documento ilegivel" | "Imagem cortada" | "Baixa resolucao" | "Duplicado";

type OCRFields = {
  nome: string;
  cpf: string;
  rg: string;
  nascimento: string;
  orgaoEmissor: string;
  validade: string;
  endereco: string;
};

type AnalysisDoc = {
  id: string;
  nomeArquivo: string;
  processo: ProcessType;
  qualidade: "boa" | "media" | "baixa";
  versao: number;
};

type ChecklistSuggestion = {
  processo: ProcessType;
  faltantes: string[];
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type Comparisons = {
  cpfCoincide: boolean;
  nomeCoincide: boolean;
  enderecoMudou: boolean;
  documentoVencido: boolean;
};

type InsightsResponse = {
  pendencias: string[];
  riscos: string[];
  prazos: string[];
  proximasAcoes: string[];
  economiaMin: number;
  camposPreenchidos: number;
};

function CardMetric({ title, value, icon, tone }: { title: string; value: string; icon: React.ReactNode; tone: "blue" | "green" | "amber" | "red" }) {
  const toneClass: Record<typeof tone, string> = {
    blue: "bg-[#f2f6ff] border-[#c6d8ff] text-[#183b9e]",
    green: "bg-[#edf9ea] border-[#bde7b4] text-[#196515]",
    amber: "bg-[#fff8e8] border-[#f1d095] text-[#825700]",
    red: "bg-[#fff0ef] border-[#f5b5ad] text-[#9e261d]",
  };

  return (
    <article className={`rounded-2xl border p-4 ${toneClass[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{title}</p>
        <span>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-.02em]">{value}</p>
    </article>
  );
}

function SecondaryAction({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#7c3aed]">
      {children}
    </button>
  );
}

export default function BureauIAModule({ goBack }: { goBack: () => void }) {
  const [docs, setDocs] = useState<AnalysisDoc[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [ocrData, setOcrData] = useState<OCRFields | null>(null);
  const [autoFillAccepted, setAutoFillAccepted] = useState(false);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [checklistSuggestions, setChecklistSuggestions] = useState<ChecklistSuggestion[]>([]);
  const [extractedSummary, setExtractedSummary] = useState("Sem resumo gerado.");
  const [comparisons, setComparisons] = useState<Comparisons | null>(null);
  const [insights, setInsights] = useState<InsightsResponse>({
    pendencias: [],
    riscos: ["Sem riscos criticos identificados"],
    prazos: ["Revisar pendencias em ate 24h", "Validar novos uploads antes do prazo final"],
    proximasAcoes: ["Solicitar documento faltante", "Confirmar dados extraidos", "Concluir aprovacao documental"],
    economiaMin: 0,
    camposPreenchidos: 0,
  });
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "M1", role: "assistant", text: "Pergunte sobre este processo." },
  ]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [busyAction, setBusyAction] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [toast, setToast] = useState("");

  const selectedDoc = docs.find(doc => doc.id === selectedDocId);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const toErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) return error.message;
    return "Nao foi possivel concluir esta acao.";
  };

  const syncInsights = async (input?: { alerts?: AlertType[]; checklistSuggestions?: ChecklistSuggestion[]; hasOcr?: boolean }) => {
    const response = await api<InsightsResponse>("/bureau-ia/insights", {
      method: "POST",
      body: JSON.stringify({
        alerts: input?.alerts ?? alerts,
        checklistSuggestions: input?.checklistSuggestions ?? checklistSuggestions,
        hasOcr: input?.hasOcr ?? !!ocrData,
      }),
    });
    setInsights(response);
  };

  useEffect(() => {
    let active = true;
    const loadDocs = async () => {
      setLoadingDocs(true);
      try {
        const response = await api<{ items: AnalysisDoc[] }>("/bureau-ia/docs");
        if (!active) return;
        setDocs(response.items);
        setSelectedDocId(response.items[0]?.id ?? "");
      } catch (error) {
        if (!active) return;
        notify(toErrorMessage(error));
      } finally {
        if (active) setLoadingDocs(false);
      }
    };

    void loadDocs();
    return () => {
      active = false;
    };
  }, []);

  const counters = useMemo(() => {
    const analisados = docs.length;
    const pendencias = alerts.length + checklistSuggestions.reduce((sum, item) => sum + item.faltantes.length, 0);
    const camposPreenchidos = insights.camposPreenchidos;
    const economiaMin = insights.economiaMin;
    return {
      analisados,
      pendencias,
      camposPreenchidos,
      economiaMin,
      alertas: alerts.length,
    };
  }, [alerts, checklistSuggestions, insights.camposPreenchidos, insights.economiaMin, docs.length]);

  const runOCR = async () => {
    if (!selectedDoc) return;
    setBusyAction(true);
    try {
      const response = await api<{ ocr: OCRFields; summary: string; comparisons: Comparisons; alerts: AlertType[] }>("/bureau-ia/analyze", {
        method: "POST",
        body: JSON.stringify({ docId: selectedDoc.id }),
      });
      setOcrData(response.ocr);
      setExtractedSummary(response.summary);
      setComparisons(response.comparisons);
      setAlerts(response.alerts);
      await syncInsights({ alerts: response.alerts, hasOcr: true });
      notify("OCR e extracao automatica concluidos.");
    } catch (error) {
      notify(toErrorMessage(error));
    } finally {
      setBusyAction(false);
    }
  };

  const runAlerts = async () => {
    if (!selectedDoc) return;
    setBusyAction(true);
    try {
      const response = await api<{ items: AlertType[] }>("/bureau-ia/alerts", {
        method: "POST",
        body: JSON.stringify({ docId: selectedDoc.id }),
      });
      setAlerts(response.items);
      await syncInsights({ alerts: response.items });
      notify("Alertas atualizados.");
    } catch (error) {
      notify(toErrorMessage(error));
    } finally {
      setBusyAction(false);
    }
  };

  const runChecklist = async () => {
    if (!selectedDoc) return;
    setBusyAction(true);
    try {
      const response = await api<ChecklistSuggestion>("/bureau-ia/checklist", {
        method: "POST",
        body: JSON.stringify({ processo: selectedDoc.processo }),
      });
      const suggestions = [response];
      setChecklistSuggestions(suggestions);
      await syncInsights({ checklistSuggestions: suggestions });
      notify("Checklist inteligente atualizado.");
    } catch (error) {
      notify(toErrorMessage(error));
    } finally {
      setBusyAction(false);
    }
  };

  const fillAuto = () => {
    setAutoFillAccepted(true);
    notify("Cadastro preenchido automaticamente.");
  };

  const refuseAutoFill = () => {
    setAutoFillAccepted(false);
    notify("Preenchimento automatico mantido como opcional.");
  };

  const copyExtractedCPF = async () => {
    if (!ocrData) return;
    await navigator.clipboard.writeText(ocrData.cpf);
    notify("CPF copiado.");
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const prompt = chatInput.trim();
    const userMessage: ChatMessage = { id: `U-${crypto.randomUUID()}`, role: "user", text: prompt };
    setChatBusy(true);
    setChatMessages(current => [...current, userMessage]);
    setChatInput("");
    try {
      const response = await api<{ answer: string }>("/bureau-ia/chat", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      const assistantMessage: ChatMessage = { id: `A-${crypto.randomUUID()}`, role: "assistant", text: response.answer };
      setChatMessages(current => [...current, assistantMessage]);
    } catch (error) {
      const assistantMessage: ChatMessage = { id: `A-${crypto.randomUUID()}`, role: "assistant", text: toErrorMessage(error) };
      setChatMessages(current => [...current, assistantMessage]);
    } finally {
      setChatBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#6247c8]">Sprint 5 - IA Documental</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-.03em]">BureauIA</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={goBack} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground hover:bg-muted">
            Voltar
          </button>
          <button onClick={() => void runOCR()} disabled={loadingDocs || busyAction || !selectedDoc} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2f63e5] px-4 text-sm font-semibold text-white hover:bg-[#2454ce] disabled:cursor-not-allowed disabled:opacity-60">
            <ScanText size={16} />
            {busyAction ? "Processando..." : "Analisar documento"}
          </button>
        </div>
      </div>

      <div className="mb-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Dashboard IA</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CardMetric title="Documentos analisados" value={String(counters.analisados)} icon={<FileSearch size={17} />} tone="blue" />
        <CardMetric title="Pendências" value={String(counters.pendencias)} icon={<TriangleAlert size={17} />} tone="amber" />
        <CardMetric title="Campos preenchidos automaticamente" value={String(counters.camposPreenchidos)} icon={<Sparkles size={17} />} tone="green" />
        <CardMetric title="Economia de tempo" value={`${counters.economiaMin} min`} icon={<Clock3 size={17} />} tone="blue" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-4">
          <article className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-lg font-semibold">OCR e Extração automática</h2>
            <p className="mt-1 text-sm text-muted-foreground">Documento selecionado para leitura inteligente e validacao.</p>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {docs.length === 0 && <p className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground">Nenhum documento carregado.</p>}
              {docs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm ${selectedDocId === doc.id ? "border-[#2f63e5] bg-[#eef3ff]" : "border-border"}`}
                >
                  <p className="font-semibold">{doc.nomeArquivo}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{doc.processo} | v{doc.versao}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <SecondaryAction onClick={() => void runOCR()}>OCR</SecondaryAction>
              <SecondaryAction onClick={() => void runOCR()}>Extração automática</SecondaryAction>
              <SecondaryAction onClick={() => void runOCR()}>Resumo</SecondaryAction>
              <SecondaryAction onClick={() => void runOCR()}>Comparação</SecondaryAction>
              <SecondaryAction onClick={() => void runOCR()}>Validação</SecondaryAction>
              <SecondaryAction onClick={() => void runChecklist()}>Checklist Inteligente</SecondaryAction>
              <SecondaryAction onClick={() => void runAlerts()}>Gerar Alertas</SecondaryAction>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-sm font-semibold">Campos extraidos</p>
              {!ocrData && <p className="mt-2 text-sm text-muted-foreground">Execute OCR para extrair Nome, CPF, RG, Nascimento, Orgao emissor, Validade e Endereco.</p>}
              {ocrData && (
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  <p>Nome: {ocrData.nome}</p>
                  <p>CPF: {ocrData.cpf}</p>
                  <p>RG: {ocrData.rg}</p>
                  <p>Nascimento: {ocrData.nascimento}</p>
                  <p>Orgao emissor: {ocrData.orgaoEmissor}</p>
                  <p>Validade: {ocrData.validade}</p>
                  <p className="sm:col-span-2">Endereco: {ocrData.endereco}</p>
                </div>
              )}
            </div>

            {ocrData && (
              <div className="mt-3 rounded-xl border border-[#d6e5ff] bg-[#f8fbff] p-3">
                <p className="text-sm font-semibold text-[#193eaf]">Deseja preencher automaticamente o cadastro?</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button onClick={fillAuto} className="min-h-11 rounded-lg border border-[#bde7b4] bg-[#edf9ea] px-3 text-sm font-semibold text-[#196515]">
                    Sim, preencher
                  </button>
                  <button onClick={refuseAutoFill} className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold">
                    Nao agora
                  </button>
                  <button onClick={() => void copyExtractedCPF()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold">
                    <Copy size={14} />
                    Copiar CPF
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {autoFillAccepted ? "Cadastro preenchido automaticamente com os dados extraidos." : "Preenchimento automatico ainda nao aplicado."}
                </p>
              </div>
            )}

            <div className="mt-3 rounded-xl border border-border p-3">
              <p className="text-sm font-semibold">Resumo IA</p>
              <p className="mt-1 text-sm text-muted-foreground">{extractedSummary}</p>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-lg font-semibold">Comparação de documentos</h2>
            {!comparisons && <p className="mt-2 text-sm text-muted-foreground">Execute OCR para comparar CPF, Nome, Endereco e validade.</p>}
            {comparisons && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <p className="rounded-lg border border-border p-2 text-sm">CPF coincide: {comparisons.cpfCoincide ? "Sim" : "Nao"}</p>
                <p className="rounded-lg border border-border p-2 text-sm">Nome coincide: {comparisons.nomeCoincide ? "Sim" : "Nao"}</p>
                <p className="rounded-lg border border-border p-2 text-sm">Endereço mudou: {comparisons.enderecoMudou ? "Sim" : "Nao"}</p>
                <p className="rounded-lg border border-border p-2 text-sm">Documento vencido: {comparisons.documentoVencido ? "Sim" : "Nao"}</p>
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-lg font-semibold">Checklist Inteligente</h2>
            <p className="mt-1 text-sm text-muted-foreground">Conforme tipo de processo, sugere automaticamente documentos faltantes.</p>
            <div className="mt-3 grid gap-2">
              {checklistSuggestions.length === 0 && <p className="text-sm text-muted-foreground">Sem sugestoes ainda. Execute o checklist inteligente.</p>}
              {checklistSuggestions.map(item => (
                <div key={item.processo} className="rounded-xl border border-border p-3">
                  <p className="text-sm font-semibold">Processo: {item.processo}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Documentos faltantes: {item.faltantes.join(" | ")}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="space-y-4">
          <article className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-lg font-semibold">Alertas</h2>
            <p className="mt-1 text-sm text-muted-foreground">CPF invalido, documento ilegivel, imagem cortada, baixa resolucao e duplicado.</p>
            <div className="mt-3 space-y-2">
              {alerts.length === 0 && <p className="text-sm text-muted-foreground">Nenhum alerta no momento.</p>}
              {alerts.map(alert => (
                <div key={alert} className="rounded-lg border border-[#f1d095] bg-[#fff8e8] px-3 py-2 text-sm text-[#825700]">
                  <span className="inline-flex items-center gap-2"><AlertTriangle size={14} />{alert}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-lg font-semibold">Criar Chat IA</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pergunte sobre este processo.</p>
            <div className="mt-3 max-h-60 space-y-2 overflow-auto">
              {chatMessages.map(message => (
                <div key={message.id} className={`rounded-lg border px-3 py-2 text-sm ${message.role === "assistant" ? "border-[#c7d6ff] bg-[#f2f6ff]" : "border-border bg-card"}`}>
                  <p className="font-semibold">{message.role === "assistant" ? "BureauIA" : "Voce"}</p>
                  <p className="mt-1">{message.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={chatInput}
                onChange={event => setChatInput(event.target.value)}
                placeholder="Pergunte sobre este processo"
                className="min-h-11 w-full rounded-lg border border-border px-3 text-sm"
              />
              <button onClick={() => void sendChat()} disabled={chatBusy} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#2f63e5] px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                <Send size={14} />
                {chatBusy ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-lg font-semibold">Criar Insights</h2>
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm font-semibold">Pendências</p>
                <p className="mt-1 text-sm text-muted-foreground">{insights.pendencias.length ? insights.pendencias.join(" | ") : "Sem pendencias"}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm font-semibold">Riscos</p>
                <p className="mt-1 text-sm text-muted-foreground">{insights.riscos.join(" | ")}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm font-semibold">Prazos</p>
                <p className="mt-1 text-sm text-muted-foreground">{insights.prazos.join(" | ")}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm font-semibold">Próximas ações</p>
                <p className="mt-1 text-sm text-muted-foreground">{insights.proximasAcoes.join(" | ")}</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-lg font-semibold">Dashboard IA - Economia</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border p-3 text-sm">
                <p className="font-semibold">Tempo economizado</p>
                <p className="mt-1 text-muted-foreground">{counters.economiaMin} minutos</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-sm">
                <p className="font-semibold">Campos preenchidos</p>
                <p className="mt-1 text-muted-foreground">{counters.camposPreenchidos}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-sm">
                <p className="font-semibold">Pendências encontradas</p>
                <p className="mt-1 text-muted-foreground">{counters.pendencias}</p>
              </div>
              <div className="rounded-lg border border-border p-3 text-sm">
                <p className="font-semibold">Alertas</p>
                <p className="mt-1 text-muted-foreground">{counters.alertas}</p>
              </div>
            </div>
          </article>
        </div>
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-50 rounded-xl bg-[#12306f] px-4 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </section>
  );
}

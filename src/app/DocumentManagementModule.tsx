import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  AlertCircle,
  Archive,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  Eye,
  FileJson,
  FileText,
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "./components/ui/drawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "./components/ui/tooltip";

type DeliveryChannel = "email" | "whatsapp" | "ambos";
type EntityStatus =
  | "pendente"
  | "recebido"
  | "em_analise"
  | "aprovado"
  | "necessita_reenvio"
  | "rejeitado"
  | "expirado"
  | "arquivado";
type FilterKey = "todos" | "pendentes" | "urgentes" | "assinados" | "arquivados";
type IntegrityStatus = "garantida" | "pendente" | "alterado";
type AdminView = "documentos" | "auditoria";

type DocumentCategory =
  | "RG"
  | "CPF"
  | "CNH"
  | "Comprovante Residencia"
  | "Carteira Trabalho"
  | "Contrato Social"
  | "Procuracao"
  | "Contrato"
  | "Comprovante Bancario"
  | "Certidao"
  | "Laudo"
  | "Outros";

type ProcessModel =
  | "Processo Trabalhista"
  | "Inventario"
  | "Usucapiao"
  | "Licitacao"
  | "Imovel"
  | "Empresa"
  | "Consumidor"
  | "Familia";

type DocumentEntry = {
  id: string;
  title: string;
  process: string;
  organization: string;
  client: string;
  requestedBy: string;
  dueDate: string;
  status: EntityStatus;
  updatedAt: string;
  signed?: boolean;
  urgent?: boolean;
  observations?: string;
  fileName?: string;
  fileType?: "pdf" | "image" | "other";
  version: number;
  downloads: number;
  views: number;
};

type TimelineAction =
  | "Documento criado"
  | "Documento enviado"
  | "Documento recebido"
  | "Documento visualizado"
  | "Documento aprovado"
  | "Documento rejeitado"
  | "Nova versao"
  | "Documento arquivado";

type TimelineEvent = {
  id: string;
  documentId: string;
  action: TimelineAction;
  user: string;
  date: string;
  time: string;
  description: string;
};

type CommentEntry = {
  id: string;
  documentId: string;
  author: "Advogado" | "Cliente";
  text: string;
  date: string;
  time: string;
};

type IntegrityEntry = {
  documentId: string;
  status: IntegrityStatus;
  algorithm: "SHA-256";
  currentHash: string;
  previousHash: string;
  currentVersion: number;
  chainVersion: number;
  lastValidationDate: string;
  lastValidationTime: string;
  responsible: string;
};

type AuditRecord = {
  id: string;
  documentId: string;
  event: string;
  user: string;
  process: string;
  document: string;
  organization: string;
  date: string;
  time: string;
  origin: "Sistema" | "Portal Cliente" | "Painel Interno";
  result: "Sucesso" | "Pendente" | "Falha";
};

type RequestForm = {
  title: string;
  category: string;
  customCategory: string;
  description: string;
  required: boolean;
  dueDate: string;
  recipients: string;
  message: string;
  checklistModel: "" | ProcessModel;
  channel: DeliveryChannel;
};

const categories: DocumentCategory[] = [
  "RG",
  "CPF",
  "CNH",
  "Comprovante Residencia",
  "Carteira Trabalho",
  "Contrato Social",
  "Procuracao",
  "Contrato",
  "Comprovante Bancario",
  "Certidao",
  "Laudo",
  "Outros",
];

const checklistModels: Record<ProcessModel, string[]> = {
  "Processo Trabalhista": ["RG", "CPF", "Carteira Trabalho", "Comprovante Residencia"],
  Inventario: ["RG", "CPF", "Certidao", "Comprovante Bancario"],
  Usucapiao: ["RG", "CPF", "Comprovante Residencia", "Laudo"],
  Licitacao: ["Contrato Social", "Certidao", "Comprovante Bancario", "Procuracao"],
  Imovel: ["RG", "CPF", "Contrato", "Comprovante Bancario"],
  Empresa: ["Contrato Social", "Certidao", "Comprovante Bancario"],
  Consumidor: ["RG", "CPF", "Contrato", "Comprovante Residencia"],
  Familia: ["RG", "CPF", "Certidao", "Comprovante Residencia"],
};

const filterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: "todos", label: "Todos" },
  { key: "pendentes", label: "Pendentes" },
  { key: "urgentes", label: "Urgentes" },
  { key: "assinados", label: "Assinados" },
  { key: "arquivados", label: "Arquivados" },
];

const statusMap: Record<EntityStatus, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-[#fff4df] text-[#8a5b00]" },
  recebido: { label: "Recebido", className: "bg-[#eef3ff] text-[#1d4fd4]" },
  em_analise: { label: "Em analise", className: "bg-[#f2edff] text-[#6331bc]" },
  aprovado: { label: "Aprovado", className: "bg-[#edf9ea] text-[#196515]" },
  necessita_reenvio: { label: "Necessita novo envio", className: "bg-[#fff4df] text-[#8a5b00]" },
  rejeitado: { label: "Rejeitado", className: "bg-[#fff0ef] text-[#a12a21]" },
  expirado: { label: "Expirado", className: "bg-[#fee4e2] text-[#7a271a]" },
  arquivado: { label: "Arquivado", className: "bg-[#f3f4f6] text-[#374151]" },
};

const integrityMap: Record<IntegrityStatus, { label: string; icon: string; className: string; ariaLabel: string }> = {
  garantida: {
    label: "Integridade Garantida",
    icon: "🛡",
    className: "bg-[#edf9ea] text-[#196515]",
    ariaLabel: "Integridade garantida",
  },
  pendente: {
    label: "Validacao Pendente",
    icon: "⚠",
    className: "bg-[#fff8e8] text-[#825700]",
    ariaLabel: "Validacao pendente",
  },
  alterado: {
    label: "Documento Alterado",
    icon: "❌",
    className: "bg-[#fff0ef] text-[#a12a21]",
    ariaLabel: "Documento alterado",
  },
};

const initialDocuments: DocumentEntry[] = [
  {
    id: "DOC-1041",
    title: "RG atualizado",
    process: "TRB-2026-0019",
    organization: "FluxHub Legal",
    client: "Marina Costa",
    requestedBy: "Paulina N.",
    dueDate: "2026-08-02",
    status: "pendente",
    updatedAt: "2026-07-29 09:30",
    urgent: true,
    observations: "Frente e verso legiveis.",
    version: 1,
    downloads: 0,
    views: 1,
  },
  {
    id: "DOC-1042",
    title: "Contrato Social",
    process: "LIC-2026-0071",
    organization: "Grupo Atlante",
    client: "Grupo Atlante",
    requestedBy: "Equipe Juridica",
    dueDate: "2026-08-05",
    status: "em_analise",
    updatedAt: "2026-07-29 10:48",
    fileName: "contrato-social-v2.pdf",
    fileType: "pdf",
    version: 2,
    signed: true,
    downloads: 3,
    views: 8,
  },
  {
    id: "DOC-1043",
    title: "Comprovante Residencia",
    process: "FAM-2026-0112",
    organization: "Escritorio Almeida",
    client: "Carlos Matos",
    requestedBy: "Dr. Almeida",
    dueDate: "2026-07-28",
    status: "expirado",
    updatedAt: "2026-07-28 18:10",
    version: 1,
    downloads: 0,
    views: 2,
  },
  {
    id: "DOC-1044",
    title: "CPF",
    process: "USU-2026-0008",
    organization: "FluxHub Legal",
    client: "Fernanda Luz",
    requestedBy: "Equipe Fluxo",
    dueDate: "2026-08-08",
    status: "aprovado",
    updatedAt: "2026-07-29 11:02",
    fileName: "cpf.pdf",
    fileType: "pdf",
    signed: true,
    version: 1,
    downloads: 1,
    views: 4,
  },
  {
    id: "DOC-1045",
    title: "Procuracao",
    process: "IMO-2026-0099",
    organization: "BureauFlow Operacoes",
    client: "Joao Ribeiro",
    requestedBy: "Paulina N.",
    dueDate: "2026-08-01",
    status: "necessita_reenvio",
    updatedAt: "2026-07-29 12:15",
    fileName: "procuracao-assinada.jpg",
    fileType: "image",
    version: 3,
    downloads: 2,
    views: 11,
  },
  {
    id: "DOC-1046",
    title: "Laudo tecnico",
    process: "EMP-2026-0214",
    organization: "Nova Lider Ltda",
    client: "Nova Lider Ltda",
    requestedBy: "Equipe Juridica",
    dueDate: "2026-08-10",
    status: "arquivado",
    updatedAt: "2026-07-25 16:21",
    fileName: "laudo.pdf",
    fileType: "pdf",
    version: 1,
    downloads: 5,
    views: 15,
  },
];

const initialEvents: TimelineEvent[] = [
  {
    id: "T1",
    documentId: "DOC-1042",
    action: "Documento criado",
    user: "Paulina N.",
    date: "2026-07-26",
    time: "09:10",
    description: "Solicitacao criada no painel interno.",
  },
  {
    id: "T2",
    documentId: "DOC-1042",
    action: "Documento visualizado",
    user: "Grupo Atlante",
    date: "2026-07-26",
    time: "09:34",
    description: "Cliente abriu a solicitacao no portal.",
  },
  {
    id: "T3",
    documentId: "DOC-1042",
    action: "Documento enviado",
    user: "Grupo Atlante",
    date: "2026-07-27",
    time: "11:05",
    description: "Arquivo enviado no portal do cliente.",
  },
  {
    id: "T4",
    documentId: "DOC-1042",
    action: "Documento recebido",
    user: "Sistema",
    date: "2026-07-27",
    time: "11:06",
    description: "Recebimento confirmado automaticamente.",
  },
  {
    id: "T5",
    documentId: "DOC-1042",
    action: "Documento aprovado",
    user: "Paulina N.",
    date: "2026-07-29",
    time: "10:48",
    description: "Documento aprovado apos revisao.",
  },
  {
    id: "T6",
    documentId: "DOC-1045",
    action: "Nova versao",
    user: "Joao Ribeiro",
    date: "2026-07-29",
    time: "12:05",
    description: "Nova versao enviada pelo cliente.",
  },
  {
    id: "T7",
    documentId: "DOC-1046",
    action: "Documento arquivado",
    user: "Equipe Juridica",
    date: "2026-07-25",
    time: "16:21",
    description: "Documento encerrado e arquivado.",
  },
];

const initialComments: CommentEntry[] = [
  {
    id: "C1",
    documentId: "DOC-1045",
    author: "Advogado",
    text: "Assinatura ilegivel na ultima pagina. Reenviar em melhor resolucao.",
    date: "2026-07-29",
    time: "12:10",
  },
  {
    id: "C2",
    documentId: "DOC-1045",
    author: "Cliente",
    text: "Perfeito, vou substituir ainda hoje.",
    date: "2026-07-29",
    time: "12:14",
  },
];

function formatNow() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);
  return { date, time };
}

function toDateLabel(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function toLongDateTimeLabel(date: string, time: string) {
  return `${toDateLabel(date)} as ${time}`;
}

function seedHash(input: string) {
  let acc = 0;
  for (let i = 0; i < input.length; i += 1) {
    acc = (acc * 31 + input.charCodeAt(i)) >>> 0;
  }
  const hex = acc.toString(16).padStart(8, "0");
  return `sha256:${(hex.repeat(8)).slice(0, 64)}`;
}

function buildInitialIntegrity(documents: DocumentEntry[]) {
  const map: Record<string, IntegrityEntry> = {};
  documents.forEach((document, index) => {
    const [date, time] = document.updatedAt.split(" ");
    const baseHash = seedHash(`${document.id}-${document.version}-${document.updatedAt}`);
    map[document.id] = {
      documentId: document.id,
      status: index % 5 === 2 ? "pendente" : index % 5 === 3 ? "alterado" : "garantida",
      algorithm: "SHA-256",
      currentHash: baseHash,
      previousHash: seedHash(`${document.id}-bootstrap`),
      currentVersion: document.version,
      chainVersion: document.version,
      lastValidationDate: date,
      lastValidationTime: time,
      responsible: document.requestedBy,
    };
  });
  return map;
}

function buildInitialAudit(events: TimelineEvent[], documents: DocumentEntry[]) {
  const docsById = new Map(documents.map(document => [document.id, document]));
  return events.map(event => {
    const doc = docsById.get(event.documentId);
    return {
      id: `AUD-${event.id}`,
      documentId: event.documentId,
      event: event.action,
      user: event.user,
      process: doc?.process ?? "-",
      document: doc?.title ?? "-",
      organization: doc?.organization ?? "-",
      date: event.date,
      time: event.time,
      origin: event.user === "Sistema" ? "Sistema" : event.user === "Portal Cliente" ? "Portal Cliente" : "Painel Interno",
      result: event.action === "Documento rejeitado" ? "Falha" : event.action === "Documento recebido" ? "Sucesso" : "Pendente",
    } as AuditRecord;
  });
}

function statusToIntegrity(status: EntityStatus): IntegrityStatus {
  if (status === "aprovado" || status === "arquivado" || status === "recebido") return "garantida";
  if (status === "rejeitado") return "alterado";
  return "pendente";
}

function StatusBadge({ status }: { status: EntityStatus }) {
  const meta = statusMap[status];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span>;
}

function IntegrityBadge({ status }: { status: IntegrityStatus }) {
  const meta = integrityMap[status];
  return (
    <span aria-label={meta.ariaLabel} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${meta.className}`}>
      <span aria-hidden="true">{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}

function IntegrityBadgeWithTooltip({ status }: { status: IntegrityStatus }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <IntegrityBadge status={status} />
        </span>
      </TooltipTrigger>
      <TooltipContent>O BureauFlow registrou automaticamente a cadeia de evidencias deste documento.</TooltipContent>
    </Tooltip>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
      <FolderOpen size={26} className="mx-auto text-muted-foreground" />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-[#f5b5ad] bg-[#fff3f1] p-4 text-sm text-[#9e261d]">
      <div className="flex items-center gap-2 font-semibold">
        <AlertCircle size={16} />
        Erro
      </div>
      <p className="mt-2">{message}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <RefreshCw size={16} className="animate-spin motion-reduce:animate-none" />
        Carregando documentos...
      </div>
    </div>
  );
}

function UploadDropzone({
  onSelectFile,
  busy,
  tooLarge,
  invalidFormat,
}: {
  onSelectFile: (file: File) => void;
  busy?: boolean;
  tooLarge?: boolean;
  invalidFormat?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) onSelectFile(file);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onSelectFile(file);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={event => event.preventDefault()}
        onDrop={handleDrop}
        className="w-full rounded-2xl border border-dashed border-[#9cb4ff] bg-[#f8faff] px-4 py-8 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]"
        aria-label="Upload drag and drop"
      >
        <Upload size={24} className="mx-auto text-[#2f63e5]" />
        <p className="mt-3 font-semibold text-[#163a91]">Upload Drag and Drop</p>
        <p className="mt-1 text-sm text-muted-foreground">Arraste um arquivo ou clique para selecionar.</p>
      </button>
      <input ref={inputRef} type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg" onChange={handleInput} />

      {busy && <LoadingState />}
      {tooLarge && <ErrorState message="Arquivo muito grande. Limite de 10 MB por envio." />}
      {invalidFormat && <ErrorState message="Formato invalido. Utilize PDF, PNG ou JPG." />}
    </div>
  );
}

function FilePreview({ fileName, fileType }: { fileName?: string; fileType?: "pdf" | "image" | "other" }) {
  if (!fileName) {
    return <EmptyState title="Sem arquivo enviado" subtitle="Nenhuma versao foi anexada para este documento." />;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">Visualizador</p>
      <p className="mt-1 text-xs text-muted-foreground">{fileName}</p>
      <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        {fileType === "pdf" && "Preview PDF"}
        {fileType === "image" && "Preview Imagem"}
        {(!fileType || fileType === "other") && "Visualizador"}
      </div>
    </div>
  );
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return <EmptyState title="Sem historico" subtitle="Ainda nao houve movimentacao deste documento." />;

  return (
    <ol className="space-y-3" aria-label="Timeline documental">
      {events.map(event => (
        <li key={event.id} className="rounded-xl border border-border bg-card p-3">
          <p className="text-sm font-semibold">{event.action}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Usuario: {event.user} | Data: {toDateLabel(event.date)} | Hora: {event.time}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
        </li>
      ))}
    </ol>
  );
}

function CommentsPanel({ comments }: { comments: CommentEntry[] }) {
  if (comments.length === 0) {
    return <EmptyState title="Sem comentarios" subtitle="Comentarios do advogado e do cliente aparecerao aqui." />;
  }

  return (
    <div className="space-y-3">
      {comments.map(comment => (
        <article key={comment.id} className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-bold uppercase tracking-[.08em] text-muted-foreground">{comment.author}</p>
          <p className="mt-1 text-sm">{comment.text}</p>
          <p className="mt-2 text-xs text-muted-foreground">{toDateLabel(comment.date)} as {comment.time}</p>
        </article>
      ))}
    </div>
  );
}

function MetricCard({
  title,
  count,
  icon,
  tone,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  tone: "warning" | "neutral" | "analysis" | "success" | "error" | "expired";
}) {
  const classes: Record<typeof tone, string> = {
    warning: "bg-[#fff8e8] border-[#f1d095] text-[#825700]",
    neutral: "bg-[#f8faff] border-[#c7d6ff] text-[#183b9e]",
    analysis: "bg-[#f2edff] border-[#d9ccff] text-[#5f31b0]",
    success: "bg-[#edf9ea] border-[#bde7b4] text-[#196515]",
    error: "bg-[#fff0ef] border-[#f5b5ad] text-[#9e261d]",
    expired: "bg-[#fee4e2] border-[#fda29b] text-[#7a271a]",
  };

  return (
    <div className={`rounded-2xl border p-4 ${classes[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <span>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-.02em]">{count}</p>
    </div>
  );
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function DocumentManagementModule({ goBack }: { goBack: () => void }) {
  const [documents, setDocuments] = useState<DocumentEntry[]>(initialDocuments);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(initialEvents);
  const [comments, setComments] = useState<CommentEntry[]>(initialComments);
  const [integrityByDoc, setIntegrityByDoc] = useState<Record<string, IntegrityEntry>>(() => buildInitialIntegrity(initialDocuments));
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(() => buildInitialAudit(initialEvents, initialDocuments));

  const [activeView, setActiveView] = useState<AdminView>("documentos");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>(initialDocuments[0]?.id ?? "");

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isClientPortalOpen, setIsClientPortalOpen] = useState(true);
  const [isIntegrityDrawerOpen, setIsIntegrityDrawerOpen] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [showUploadTooLarge, setShowUploadTooLarge] = useState(false);
  const [showInvalidFormat, setShowInvalidFormat] = useState(false);

  const [showLoadingDemo, setShowLoadingDemo] = useState(false);
  const [showEmptyDemo, setShowEmptyDemo] = useState(false);
  const [showErrorDemo, setShowErrorDemo] = useState(false);
  const [approvalComment, setApprovalComment] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const [auditFilterUser, setAuditFilterUser] = useState("");
  const [auditFilterProcess, setAuditFilterProcess] = useState("");
  const [auditFilterDocument, setAuditFilterDocument] = useState("");
  const [auditFilterOrganization, setAuditFilterOrganization] = useState("");
  const [auditFilterDate, setAuditFilterDate] = useState("");

  const [requestForm, setRequestForm] = useState<RequestForm>({
    title: "",
    category: "RG",
    customCategory: "",
    description: "",
    required: true,
    dueDate: "",
    recipients: "",
    message: "",
    checklistModel: "",
    channel: "ambos",
  });

  const selectedDocument = documents.find(item => item.id === selectedDocumentId) ?? documents[0] ?? null;
  const selectedIntegrity = selectedDocument ? integrityByDoc[selectedDocument.id] : null;

  const dashboardMetrics = useMemo(() => {
    return {
      pendentes: documents.filter(item => item.status === "pendente" || item.status === "necessita_reenvio").length,
      aguardandoCliente: documents.filter(item => item.status === "pendente").length,
      emAnalise: documents.filter(item => item.status === "em_analise").length,
      aprovados: documents.filter(item => item.status === "aprovado").length,
      rejeitados: documents.filter(item => item.status === "rejeitado" || item.status === "necessita_reenvio").length,
      expirados: documents.filter(item => item.status === "expirado").length,
    };
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(document => {
      const q = searchTerm.trim().toLowerCase();
      const searchable = `${document.title} ${document.client} ${document.process}`.toLowerCase();
      const searchMatches = q.length === 0 || searchable.includes(q);

      const filterMatches =
        activeFilter === "todos" ||
        (activeFilter === "pendentes" && (document.status === "pendente" || document.status === "necessita_reenvio")) ||
        (activeFilter === "urgentes" && !!document.urgent) ||
        (activeFilter === "assinados" && !!document.signed) ||
        (activeFilter === "arquivados" && document.status === "arquivado");

      return searchMatches && filterMatches;
    });
  }, [documents, activeFilter, searchTerm]);

  const selectedTimeline = useMemo(
    () => timelineEvents.filter(item => item.documentId === selectedDocument?.id),
    [timelineEvents, selectedDocument?.id],
  );

  const selectedComments = useMemo(
    () => comments.filter(item => item.documentId === selectedDocument?.id),
    [comments, selectedDocument?.id],
  );

  const selectedAudit = useMemo(
    () => auditRecords.filter(item => item.documentId === selectedDocument?.id),
    [auditRecords, selectedDocument?.id],
  );

  const adminAuditList = useMemo(() => {
    return auditRecords.filter(item => {
      const userMatch = !auditFilterUser || item.user.toLowerCase().includes(auditFilterUser.toLowerCase());
      const processMatch = !auditFilterProcess || item.process.toLowerCase().includes(auditFilterProcess.toLowerCase());
      const docMatch = !auditFilterDocument || item.document.toLowerCase().includes(auditFilterDocument.toLowerCase());
      const orgMatch = !auditFilterOrganization || item.organization.toLowerCase().includes(auditFilterOrganization.toLowerCase());
      const dateMatch = !auditFilterDate || item.date === auditFilterDate;
      return userMatch && processMatch && docMatch && orgMatch && dateMatch;
    });
  }, [auditRecords, auditFilterDate, auditFilterDocument, auditFilterOrganization, auditFilterProcess, auditFilterUser]);

  const notify = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 3200);
  };

  const addAuditRecord = (entry: Omit<AuditRecord, "id">) => {
    setAuditRecords(current => [{ id: `AUD-${crypto.randomUUID()}`, ...entry }, ...current]);
  };

  const touchIntegrity = (document: DocumentEntry, status: IntegrityStatus, responsible: string) => {
    const now = formatNow();
    setIntegrityByDoc(current => {
      const previous = current[document.id];
      const previousHash = previous?.currentHash ?? seedHash(`${document.id}-previous`);
      const nextVersion = Math.max(document.version, previous?.currentVersion ?? 1);
      const nextHash = seedHash(`${document.id}-${document.updatedAt}-${nextVersion}-${status}-${responsible}`);

      return {
        ...current,
        [document.id]: {
          documentId: document.id,
          status,
          algorithm: "SHA-256",
          currentHash: nextHash,
          previousHash,
          currentVersion: nextVersion,
          chainVersion: (previous?.chainVersion ?? 0) + 1,
          lastValidationDate: now.date,
          lastValidationTime: now.time,
          responsible,
        },
      };
    });
  };

  const addTimelineEvent = (documentId: string, action: TimelineAction, user: string, description: string) => {
    const now = formatNow();
    setTimelineEvents(current => [
      {
        id: `T-${crypto.randomUUID()}`,
        documentId,
        action,
        user,
        date: now.date,
        time: now.time,
        description,
      },
      ...current,
    ]);

    const doc = documents.find(item => item.id === documentId);
    if (doc) {
      addAuditRecord({
        documentId,
        event: action,
        user,
        process: doc.process,
        document: doc.title,
        organization: doc.organization,
        date: now.date,
        time: now.time,
        origin: user === "Sistema" ? "Sistema" : user === "Portal Cliente" ? "Portal Cliente" : "Painel Interno",
        result: action === "Documento rejeitado" ? "Falha" : action === "Documento recebido" ? "Sucesso" : "Pendente",
      });
    }
  };

  const setStatus = (documentId: string, status: EntityStatus, action: TimelineAction, commentText?: string) => {
    const now = formatNow();
    let updatedDoc: DocumentEntry | null = null;

    setDocuments(current =>
      current.map(item => {
        if (item.id !== documentId) return item;
        const next = {
          ...item,
          status,
          updatedAt: `${now.date} ${now.time}`,
          observations: commentText || item.observations,
        };
        updatedDoc = next;
        return next;
      }),
    );

    addTimelineEvent(documentId, action, "Advogado", `Status atualizado para ${statusMap[status].label.toLowerCase()}.`);

    if (commentText && commentText.trim().length > 0) {
      setComments(current => [
        {
          id: `C-${crypto.randomUUID()}`,
          documentId,
          author: "Advogado",
          text: commentText.trim(),
          date: now.date,
          time: now.time,
        },
        ...current,
      ]);
    }

    if (updatedDoc) {
      touchIntegrity(updatedDoc, statusToIntegrity(status), "Advogado");
    }
  };

  const handleFileUpload = (file: File) => {
    setShowUploadTooLarge(false);
    setShowInvalidFormat(false);

    const maxBytes = 10 * 1024 * 1024;
    const valid = ["application/pdf", "image/png", "image/jpeg"];

    if (file.size > maxBytes) {
      setShowUploadTooLarge(true);
      return;
    }

    if (!valid.includes(file.type)) {
      setShowInvalidFormat(true);
      return;
    }

    if (!selectedDocument) return;

    setIsUploading(true);
    window.setTimeout(() => {
      setIsUploading(false);
      const now = formatNow();
      let updatedDoc: DocumentEntry | null = null;

      setDocuments(current =>
        current.map(item => {
          if (item.id !== selectedDocument.id) return item;
          const next = {
            ...item,
            fileName: file.name,
            fileType: file.type.includes("pdf") ? "pdf" : "image",
            version: item.version + 1,
            status: "recebido" as const,
            updatedAt: `${now.date} ${now.time}`,
          };
          updatedDoc = next;
          return next;
        }),
      );

      addTimelineEvent(selectedDocument.id, "Documento enviado", "Portal Cliente", "Arquivo recebido no BureauFlow.");
      addTimelineEvent(selectedDocument.id, "Documento recebido", "Sistema", "Recebimento e validacao registrados automaticamente.");
      addTimelineEvent(selectedDocument.id, "Nova versao", "Sistema", "Cadeia de evidencias atualizada em segundo plano.");
      if (updatedDoc) {
        touchIntegrity(updatedDoc, "garantida", "Sistema");
      }
      notify("Upload concluido com sucesso.");
    }, 900);
  };

  const markVisualized = (documentId: string, actor: "Portal Cliente" | "Advogado") => {
    const now = formatNow();
    let updatedDoc: DocumentEntry | null = null;
    setDocuments(current =>
      current.map(item => {
        if (item.id !== documentId) return item;
        const next = { ...item, views: item.views + 1, updatedAt: `${now.date} ${now.time}` };
        updatedDoc = next;
        return next;
      }),
    );
    addTimelineEvent(documentId, "Documento visualizado", actor, "Documento aberto para visualizacao.");
    if (updatedDoc) {
      touchIntegrity(updatedDoc, integrityByDoc[documentId]?.status ?? "garantida", actor);
    }
  };

  const applyChecklistModel = (model: ProcessModel) => {
    const docs = checklistModels[model];
    const list = docs.join(", ");
    setRequestForm(current => ({
      ...current,
      checklistModel: model,
      description: current.description || `Checklist sugerido para ${model}: ${list}`,
      title: current.title || `${model} - solicitacao documental`,
    }));
    setIsModelModalOpen(false);
    notify(`Modelo ${model} aplicado.`);
  };

  const submitNewRequest = () => {
    if (!requestForm.title || !requestForm.dueDate || !requestForm.recipients) {
      notify("Preencha titulo, prazo e destinatarios para enviar a solicitacao.");
      return;
    }

    const now = formatNow();
    const newDoc: DocumentEntry = {
      id: `DOC-${Math.floor(Math.random() * 9000) + 1000}`,
      title: requestForm.title,
      process: requestForm.checklistModel ? `${requestForm.checklistModel.slice(0, 3).toUpperCase()}-2026-NEW` : "PROC-2026-NEW",
      organization: "BureauFlow Operacoes",
      client: requestForm.recipients,
      requestedBy: "Advogado responsavel",
      dueDate: requestForm.dueDate,
      status: "pendente",
      updatedAt: `${now.date} ${now.time}`,
      version: 1,
      urgent: requestForm.required,
      observations: requestForm.message,
      downloads: 0,
      views: 0,
    };

    setDocuments(current => [newDoc, ...current]);
    setIntegrityByDoc(current => ({
      ...current,
      [newDoc.id]: {
        documentId: newDoc.id,
        status: "pendente",
        algorithm: "SHA-256",
        currentHash: seedHash(`${newDoc.id}-${newDoc.updatedAt}`),
        previousHash: seedHash(`${newDoc.id}-seed`),
        currentVersion: 1,
        chainVersion: 1,
        lastValidationDate: now.date,
        lastValidationTime: now.time,
        responsible: "Advogado responsavel",
      },
    }));
    setSelectedDocumentId(newDoc.id);
    addTimelineEvent(newDoc.id, "Documento criado", "Advogado", "Documento criado e cadeia de evidencias iniciada automaticamente.");

    setRequestForm({
      title: "",
      category: "RG",
      customCategory: "",
      description: "",
      required: true,
      dueDate: "",
      recipients: "",
      message: "",
      checklistModel: "",
      channel: "ambos",
    });

    setIsRequestModalOpen(false);
    notify("Solicitacao de documento enviada.");
  };

  const exportTechnicalJson = () => {
    if (!selectedDocument || !selectedIntegrity) return;
    const payload = {
      documentId: selectedDocument.id,
      processId: selectedDocument.process,
      organizationId: selectedDocument.organization,
      version: selectedDocument.version,
      createdAt: selectedDocument.updatedAt,
      events: selectedTimeline,
      integrity: {
        status: selectedIntegrity.status === "garantida" ? "valid" : selectedIntegrity.status,
        algorithm: selectedIntegrity.algorithm,
      },
    };
    downloadTextFile(`integridade-${selectedDocument.id}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
    notify("Exportacao concluida.");
  };

  const exportTechnicalPdf = () => {
    if (!selectedDocument || !selectedIntegrity) return;
    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Dossie Tecnico ${selectedDocument.id}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 28px; color: #1f2f48; }
    h1, h2 { margin: 0 0 8px; }
    h1 { font-size: 22px; }
    h2 { font-size: 16px; margin-top: 16px; }
    p { margin: 2px 0; font-size: 13px; }
    .box { border: 1px solid #d6e0f5; border-radius: 10px; padding: 12px; margin-top: 8px; }
    .mono { font-family: Consolas, monospace; word-break: break-all; }
  </style>
</head>
<body>
  <h1>BureauFlow - Dossie Tecnico</h1>
  <div class="box">
    <p><strong>Documento:</strong> ${selectedDocument.title}</p>
    <p><strong>Processo:</strong> ${selectedDocument.process}</p>
    <p><strong>Organizacao:</strong> ${selectedDocument.organization}</p>
  </div>

  <h2>Linha do Tempo</h2>
  <div class="box">
    ${selectedTimeline.map(event => `<p>${event.date} ${event.time} - ${event.action} (${event.user})</p>`).join("")}
  </div>

  <h2>Resumo da Integridade</h2>
  <div class="box">
    <p><strong>Status:</strong> ${integrityMap[selectedIntegrity.status].label}</p>
    <p><strong>Hash:</strong> <span class="mono">${selectedIntegrity.currentHash}</span></p>
    <p><strong>Carimbo Temporal:</strong> ${toLongDateTimeLabel(selectedIntegrity.lastValidationDate, selectedIntegrity.lastValidationTime)}</p>
    <p><strong>Versoes:</strong> ${selectedIntegrity.chainVersion}</p>
    <p><strong>Eventos:</strong> ${selectedTimeline.length}</p>
    <p><strong>Historico:</strong> ${selectedAudit.length} registros de auditoria</p>
  </div>

  <p style="margin-top: 18px; color: #4b5f7c;">Documento gerado automaticamente pelo BureauFlow.</p>
</body>
</html>`;

    downloadTextFile(`dossie-${selectedDocument.id}.html`, html, "text/html;charset=utf-8");
    notify("Exportacao concluida.");
  };

  const copyHash = async () => {
    if (!selectedIntegrity) return;
    await navigator.clipboard.writeText(selectedIntegrity.currentHash);
    notify("Hash copiado.");
  };

  const downloadHistory = () => {
    if (!selectedDocument) return;
    const rows = selectedTimeline.map(event => `${event.date};${event.time};${event.action};${event.user};${event.description}`);
    const csv = ["data;hora;evento;usuario;descricao", ...rows].join("\n");
    downloadTextFile(`historico-${selectedDocument.id}.csv`, csv, "text/csv;charset=utf-8");
    notify("Exportacao concluida.");
  };

  const exportFailed = () => {
    notify("Exportacao falhou.");
  };

  const adminMetrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const eventsToday = auditRecords.filter(record => record.date === today).length;
    const docsAudited = new Set(auditRecords.map(record => record.documentId)).size;
    const alerts = Object.values(integrityByDoc).filter(entry => entry.status !== "garantida").length;
    const pendingDocs = documents.filter(document => document.status === "pendente" || document.status === "necessita_reenvio").length;
    return { eventsToday, docsAudited, alerts, pendingDocs };
  }, [auditRecords, documents, integrityByDoc]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#6247c8]">Gestao Documental Inteligente</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-.03em]">Documentos</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={goBack}
            className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
          >
            Voltar
          </button>
          <button
            onClick={() => setActiveView(value => (value === "documentos" ? "auditoria" : "documentos"))}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
          >
            <Shield size={16} />
            Auditoria
          </button>
          <button
            onClick={() => setIsClientPortalOpen(value => !value)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
          >
            <User size={16} />
            Portal Cliente
          </button>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2f63e5] px-4 text-sm font-semibold text-white hover:bg-[#2454ce] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7c3aed]"
          >
            <Plus size={16} />
            Nova Solicitacao
          </button>
        </div>
      </div>

      {activeView === "auditoria" ? (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Auditoria</h2>
          <p className="text-sm text-muted-foreground">Dashboard administrativo para acompanhamento de eventos e pendencias.</p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard title="Eventos Hoje" count={adminMetrics.eventsToday} icon={<CalendarClock size={17} />} tone="neutral" />
            <MetricCard title="Documentos Auditados" count={adminMetrics.docsAudited} icon={<ShieldCheck size={17} />} tone="success" />
            <MetricCard title="Alertas" count={adminMetrics.alerts} icon={<ShieldAlert size={17} />} tone="error" />
            <MetricCard title="Documentos com Pendencias" count={adminMetrics.pendingDocs} icon={<Clock3 size={17} />} tone="warning" />
            <MetricCard title="Ultimas Alteracoes" count={auditRecords.slice(0, 5).length} icon={<RefreshCw size={17} />} tone="analysis" />
          </div>

          <div className="grid gap-2 md:grid-cols-5">
            <input value={auditFilterUser} onChange={e => setAuditFilterUser(e.target.value)} placeholder="Usuario" className="min-h-11 rounded-lg border border-border px-3 text-sm" />
            <input value={auditFilterProcess} onChange={e => setAuditFilterProcess(e.target.value)} placeholder="Processo" className="min-h-11 rounded-lg border border-border px-3 text-sm" />
            <input value={auditFilterDocument} onChange={e => setAuditFilterDocument(e.target.value)} placeholder="Documento" className="min-h-11 rounded-lg border border-border px-3 text-sm" />
            <input type="date" value={auditFilterDate} onChange={e => setAuditFilterDate(e.target.value)} className="min-h-11 rounded-lg border border-border px-3 text-sm" />
            <input value={auditFilterOrganization} onChange={e => setAuditFilterOrganization(e.target.value)} placeholder="Organizacao" className="min-h-11 rounded-lg border border-border px-3 text-sm" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-[.08em] text-muted-foreground">
                  <th className="px-2 py-2">Evento</th>
                  <th className="px-2 py-2">Usuario</th>
                  <th className="px-2 py-2">Processo</th>
                  <th className="px-2 py-2">Documento</th>
                  <th className="px-2 py-2">Data</th>
                  <th className="px-2 py-2">Origem</th>
                  <th className="px-2 py-2">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {adminAuditList.map(row => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="px-2 py-2">{row.event}</td>
                    <td className="px-2 py-2">{row.user}</td>
                    <td className="px-2 py-2">{row.process}</td>
                    <td className="px-2 py-2">{row.document}</td>
                    <td className="px-2 py-2">{toDateLabel(row.date)} {row.time}</td>
                    <td className="px-2 py-2">{row.origin}</td>
                    <td className="px-2 py-2">{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {adminAuditList.length === 0 && <EmptyState title="Sem resultados" subtitle="Ajuste os filtros para encontrar eventos." />}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard title="Documentos pendentes" count={dashboardMetrics.pendentes} icon={<Clock3 size={18} />} tone="warning" />
            <MetricCard title="Aguardando cliente" count={dashboardMetrics.aguardandoCliente} icon={<User size={18} />} tone="neutral" />
            <MetricCard title="Em analise" count={dashboardMetrics.emAnalise} icon={<Search size={18} />} tone="analysis" />
            <MetricCard title="Aprovados" count={dashboardMetrics.aprovados} icon={<CheckCircle2 size={18} />} tone="success" />
            <MetricCard title="Rejeitados" count={dashboardMetrics.rejeitados} icon={<XCircle size={18} />} tone="error" />
            <MetricCard title="Expirados" count={dashboardMetrics.expirados} icon={<CalendarClock size={18} />} tone="expired" />
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              {filterOptions.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveFilter(item.key)}
                  className={`min-h-11 rounded-lg border px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[#7c3aed] ${
                    activeFilter === item.key
                      ? "border-[#2f63e5] bg-[#eef3ff] text-[#193eaf]"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <label className="ml-auto flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground">
                <Search size={15} />
                <span className="sr-only">Buscar documento</span>
                <input
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  placeholder="Buscar por documento, processo ou cliente"
                  className="w-[260px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </label>
            </div>

            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-[.08em] text-muted-foreground">
                    <th className="px-2 py-2">Documento</th>
                    <th className="px-2 py-2">Processo</th>
                    <th className="px-2 py-2">Cliente</th>
                    <th className="px-2 py-2">Solicitado por</th>
                    <th className="px-2 py-2">Prazo</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Integridade</th>
                    <th className="px-2 py-2">Ultima atualizacao</th>
                    <th className="px-2 py-2">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map(document => (
                    <tr key={document.id} className="border-b border-border/60 align-top">
                      <td className="px-2 py-3 font-semibold">{document.title}</td>
                      <td className="px-2 py-3">{document.process}</td>
                      <td className="px-2 py-3">{document.client}</td>
                      <td className="px-2 py-3">{document.requestedBy}</td>
                      <td className="px-2 py-3">{toDateLabel(document.dueDate)}</td>
                      <td className="px-2 py-3"><StatusBadge status={document.status} /></td>
                      <td className="px-2 py-3"><IntegrityBadgeWithTooltip status={integrityByDoc[document.id]?.status ?? "pendente"} /></td>
                      <td className="px-2 py-3">{document.updatedAt}</td>
                      <td className="px-2 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSelectedDocumentId(document.id);
                              markVisualized(document.id, "Advogado");
                            }}
                            className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => {
                              const comment = window.prompt("Comentario para aprovacao:", "Documento validado e aprovado.") || "";
                              setStatus(document.id, "aprovado", "Documento aprovado", comment);
                              notify("Documento aprovado.");
                            }}
                            className="rounded-lg border border-[#a9df9e] bg-[#edf9ea] px-2 py-1 text-xs font-semibold text-[#196515] focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => {
                              const comment =
                                window.prompt("Comentario para solicitar novo envio:", "Arquivo com baixa qualidade. Favor reenviar.") || "";
                              setStatus(document.id, "necessita_reenvio", "Nova versao", comment);
                              notify("Novo envio solicitado.");
                            }}
                            className="rounded-lg border border-[#f1d095] bg-[#fff8e8] px-2 py-1 text-xs font-semibold text-[#825700] focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
                          >
                            Solicitar novo envio
                          </button>
                          <button
                            onClick={() => {
                              const comment = window.prompt("Comentario para rejeicao:", "Documento nao atende os criterios.") || "";
                              setStatus(document.id, "rejeitado", "Documento rejeitado", comment);
                              notify("Documento rejeitado.");
                            }}
                            className="rounded-lg border border-[#f5b5ad] bg-[#fff0ef] px-2 py-1 text-xs font-semibold text-[#9e261d] focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
                          >
                            Rejeitar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredDocuments.length === 0 && <EmptyState title="Sem documentos" subtitle="Nenhum item encontrado para os filtros atuais." />}
            </div>

            <div className="mt-4 grid gap-3 md:hidden">
              {filteredDocuments.length === 0 && <EmptyState title="Sem documentos" subtitle="Nenhum item encontrado para os filtros atuais." />}
              {filteredDocuments.map(document => (
                <article key={document.id} className="rounded-xl border border-border bg-card p-3">
                  <p className="font-semibold">{document.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Processo {document.process}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Cliente {document.client}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={document.status} />
                    <IntegrityBadgeWithTooltip status={integrityByDoc[document.id]?.status ?? "pendente"} />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDocumentId(document.id);
                      markVisualized(document.id, "Advogado");
                    }}
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
                  >
                    <Eye size={16} />
                    Abrir
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">Upload e Visualizador</h2>
                  {selectedDocument && <StatusBadge status={selectedDocument.status} />}
                </div>
                {selectedDocument ? (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Documento {selectedDocument.title} | Versao {selectedDocument.version} | Prazo {toDateLabel(selectedDocument.dueDate)}
                    </p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <UploadDropzone
                        busy={isUploading}
                        tooLarge={showUploadTooLarge}
                        invalidFormat={showInvalidFormat}
                        onSelectFile={handleFileUpload}
                      />
                      <FilePreview fileName={selectedDocument.fileName} fileType={selectedDocument.fileType} />
                    </div>

                    <div className="mt-4 rounded-2xl border border-border bg-card p-4">
                      <h3 className="text-sm font-semibold">Integridade do Documento</h3>
                      <div className="mt-2 rounded-xl border border-[#d6e5ff] bg-[#f8fbff] p-3 text-sm">
                        <p className="font-semibold text-[#1a3f98]">🛡 Documento integro</p>
                        <p className="mt-1 text-muted-foreground">Ultima verificacao</p>
                        <p className="text-muted-foreground">
                          {selectedIntegrity ? toLongDateTimeLabel(selectedIntegrity.lastValidationDate, selectedIntegrity.lastValidationTime) : "-"}
                        </p>
                        <p className="mt-1 text-muted-foreground">Nenhuma alteracao detectada.</p>
                      </div>
                      <button
                        onClick={() => setIsIntegrityDrawerOpen(true)}
                        className="mt-3 min-h-11 rounded-lg border border-border px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
                      >
                        Ver detalhes tecnicos
                      </button>
                    </div>

                    <label className="mt-3 block text-sm font-semibold">
                      Adicionar comentario
                      <textarea
                        value={approvalComment}
                        onChange={event => setApprovalComment(event.target.value)}
                        placeholder="Escreva orientacoes para o cliente."
                        className="mt-1 min-h-20 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <button
                        onClick={() => {
                          setStatus(selectedDocument.id, "aprovado", "Documento aprovado", approvalComment || "Documento validado sem pendencias.");
                          setApprovalComment("");
                          notify("Documento aprovado.");
                        }}
                        className="min-h-11 rounded-xl border border-[#a9df9e] bg-[#edf9ea] px-3 text-sm font-semibold text-[#196515] focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => {
                          setStatus(
                            selectedDocument.id,
                            "necessita_reenvio",
                            "Nova versao",
                            approvalComment || "Solicitado novo envio por divergencia de informacao.",
                          );
                          setApprovalComment("");
                          notify("Novo envio solicitado.");
                        }}
                        className="min-h-11 rounded-xl border border-[#f1d095] bg-[#fff8e8] px-3 text-sm font-semibold text-[#825700] focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
                      >
                        Solicitar novo envio
                      </button>
                      <button
                        onClick={() => {
                          setStatus(selectedDocument.id, "rejeitado", "Documento rejeitado", approvalComment || "Documento rejeitado apos revisao.");
                          setApprovalComment("");
                          notify("Documento rejeitado.");
                        }}
                        className="min-h-11 rounded-xl border border-[#f5b5ad] bg-[#fff0ef] px-3 text-sm font-semibold text-[#9e261d] focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
                      >
                        Rejeitar
                      </button>
                      <button
                        onClick={() => {
                          setStatus(selectedDocument.id, "arquivado", "Documento arquivado", approvalComment || "Documento finalizado e arquivado.");
                          setApprovalComment("");
                          notify("Documento arquivado.");
                        }}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-muted-foreground focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
                      >
                        <Archive size={16} />
                        Arquivar
                      </button>
                    </div>
                  </>
                ) : (
                  <EmptyState title="Sem documento selecionado" subtitle="Escolha um item na lista para iniciar a analise." />
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h2 className="text-lg font-semibold">Comentarios</h2>
                <p className="mt-1 text-sm text-muted-foreground">Comentarios do advogado e respostas do cliente.</p>
                <div className="mt-3">
                  <CommentsPanel comments={selectedComments} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <h2 className="text-lg font-semibold">Timeline</h2>
                <p className="mt-1 text-sm text-muted-foreground">Historico completo com icone, data, hora, usuario e descricao.</p>
                <div className="mt-3">
                  <Timeline events={selectedTimeline} />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h2 className="text-lg font-semibold">Estados e Componentes</h2>
                <p className="mt-1 text-sm text-muted-foreground">Estados da Sprint 3 e auditoria transparente.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => setShowLoadingDemo(value => !value)} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold">
                    Alternar Loading
                  </button>
                  <button onClick={() => setShowEmptyDemo(value => !value)} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold">
                    Alternar Empty
                  </button>
                  <button onClick={() => setShowErrorDemo(value => !value)} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold">
                    Alternar Erro
                  </button>
                  <button onClick={() => notify("Exportacao concluida.")} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold">
                    Exportacao concluida
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full border border-[#bde7b4] bg-[#edf9ea] px-2 py-1 text-[#196515]">Documento integro</span>
                  <span className="rounded-full border border-[#f1d095] bg-[#fff8e8] px-2 py-1 text-[#825700]">Documento pendente</span>
                  <span className="rounded-full border border-[#f1d095] bg-[#fff8e8] px-2 py-1 text-[#825700]">Nova versao</span>
                  <span className="rounded-full border border-[#f5b5ad] bg-[#fff0ef] px-2 py-1 text-[#a12a21]">Documento alterado</span>
                  <span className="rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground">Documento removido</span>
                  <span className="rounded-full border border-[#f5b5ad] bg-[#fff0ef] px-2 py-1 text-[#a12a21]">Falha de validacao</span>
                  <span className="rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground">Historico indisponivel</span>
                </div>
                <div className="mt-3 space-y-3">
                  {showLoadingDemo && <LoadingState />}
                  {showEmptyDemo && <EmptyState title="Sem documentos" subtitle="Crie sua primeira solicitacao para iniciar o fluxo." />}
                  {showErrorDemo && <ErrorState message="Exportacao falhou." />}
                </div>
              </div>
            </div>
          </div>

          {isClientPortalOpen && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Portal Cliente</h2>
                <button
                  onClick={() => setIsClientPortalOpen(false)}
                  className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold text-muted-foreground"
                >
                  Fechar
                </button>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Visao simplificada sem termos tecnicos.</p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {documents
                  .filter(item => item.status !== "arquivado")
                  .slice(0, 4)
                  .map(item => (
                    <article key={`portal-${item.id}`} className="rounded-xl border border-border p-3">
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Documento recebido</p>
                      <p className="mt-1 text-xs text-muted-foreground">Integridade confirmada</p>
                      <p className="mt-1 text-xs text-muted-foreground">Ultima atualizacao {toDateLabel(item.updatedAt.slice(0, 10))}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <button
                          onClick={() => {
                            setSelectedDocumentId(item.id);
                            markVisualized(item.id, "Portal Cliente");
                          }}
                          className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold"
                        >
                          Visualizar historico
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocumentId(item.id);
                            notify("Upload selecionado para cliente.");
                          }}
                          className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold"
                        >
                          Enviar Arquivo
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      <Drawer open={isIntegrityDrawerOpen} onOpenChange={setIsIntegrityDrawerOpen}>
        <DrawerContent direction="right" className="w-full max-w-2xl overflow-y-auto sm:max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Integridade e Auditoria</DrawerTitle>
            <DrawerDescription>Profundidade tecnica sob demanda para validacao e rastreabilidade.</DrawerDescription>
          </DrawerHeader>

          {selectedDocument && selectedIntegrity && (
            <div className="space-y-4 px-4 pb-6">
              <section className="rounded-xl border border-border bg-card p-3">
                <h3 className="text-sm font-semibold">Resumo</h3>
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  <p>Status: Documento integro</p>
                  <p>Versao atual: {selectedDocument.version}</p>
                  <p>Ultima validacao: {toLongDateTimeLabel(selectedIntegrity.lastValidationDate, selectedIntegrity.lastValidationTime)}</p>
                  <p>Responsavel: {selectedIntegrity.responsible}</p>
                  <p>Organizacao: {selectedDocument.organization}</p>
                  <p>Processo: {selectedDocument.process}</p>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-3">
                <h3 className="text-sm font-semibold">Cadeia de Evidencias</h3>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-2 text-xs">
                    <p className="font-semibold">Hash SHA-256</p>
                    <p className="mt-1 break-all text-muted-foreground">{selectedIntegrity.currentHash}</p>
                  </div>
                  <div className="rounded-lg border border-border p-2 text-xs">
                    <p className="font-semibold">Hash anterior</p>
                    <p className="mt-1 break-all text-muted-foreground">{selectedIntegrity.previousHash}</p>
                  </div>
                  <div className="rounded-lg border border-border p-2 text-xs">
                    <p className="font-semibold">Versao</p>
                    <p className="mt-1 text-muted-foreground">{selectedIntegrity.currentVersion}</p>
                  </div>
                  <div className="rounded-lg border border-border p-2 text-xs">
                    <p className="font-semibold">Data e hora</p>
                    <p className="mt-1 text-muted-foreground">{toLongDateTimeLabel(selectedIntegrity.lastValidationDate, selectedIntegrity.lastValidationTime)}</p>
                  </div>
                  <div className="rounded-lg border border-border p-2 text-xs">
                    <p className="font-semibold">Algoritmo</p>
                    <p className="mt-1 text-muted-foreground">{selectedIntegrity.algorithm}</p>
                  </div>
                  <div className="rounded-lg border border-border p-2 text-xs">
                    <p className="font-semibold">Status da integridade</p>
                    <p className="mt-1 text-muted-foreground">{integrityMap[selectedIntegrity.status].label}</p>
                  </div>
                </div>
                <button onClick={() => void copyHash()} className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold">
                  <Copy size={14} />
                  Copiar Hash
                </button>
              </section>

              <section className="rounded-xl border border-border bg-card p-3">
                <h3 className="text-sm font-semibold">Linha do Tempo</h3>
                <div className="mt-2 space-y-2">
                  {selectedTimeline.map(event => (
                    <article key={`drawer-${event.id}`} className="rounded-lg border border-border p-2 text-xs">
                      <p className="font-semibold">• {event.action}</p>
                      <p className="mt-1 text-muted-foreground">
                        {toDateLabel(event.date)} | {event.time} | {event.user}
                      </p>
                      <p className="mt-1 text-muted-foreground">{event.description}</p>
                    </article>
                  ))}
                  {selectedTimeline.length === 0 && <p className="text-xs text-muted-foreground">Sem eventos registrados.</p>}
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-3">
                <h3 className="text-sm font-semibold">Auditoria</h3>
                <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                  <p>Eventos registrados: {selectedAudit.length}</p>
                  <p>Ultimo acesso: {selectedAudit[0] ? toLongDateTimeLabel(selectedAudit[0].date, selectedAudit[0].time) : "-"}</p>
                  <p>Quantidade de versoes: {selectedDocument.version}</p>
                  <p>Quantidade de downloads: {selectedDocument.downloads}</p>
                  <p>Visualizacoes: {selectedDocument.views}</p>
                  <p>Ultima alteracao: {selectedDocument.updatedAt}</p>
                  <p>Usuario responsavel: {selectedDocument.requestedBy}</p>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-3">
                <h3 className="text-sm font-semibold">Exportacoes</h3>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <button onClick={exportTechnicalPdf} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold">
                    <FileText size={14} />
                    Exportar Dossie Tecnico PDF
                  </button>
                  <button onClick={exportTechnicalJson} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold">
                    <FileJson size={14} />
                    Exportar JSON
                  </button>
                  <button onClick={() => void copyHash()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold">
                    <Copy size={14} />
                    Copiar Hash
                  </button>
                  <button onClick={downloadHistory} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold">
                    <Download size={14} />
                    Baixar historico
                  </button>
                </div>
                <button onClick={exportFailed} className="mt-2 text-xs font-semibold text-muted-foreground underline-offset-4 hover:underline">
                  Simular exportacao falhou
                </button>
              </section>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1330]/45 px-4" role="dialog" aria-modal="true" aria-label="Solicitar Documento">
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Solicitar Documento</h2>
              <button onClick={() => setIsRequestModalOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold">
                Fechar
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold">
                Titulo
                <input
                  value={requestForm.title}
                  onChange={event => setRequestForm(current => ({ ...current, title: event.target.value }))}
                  className="mt-1 min-h-11 w-full rounded-lg border border-border bg-card px-3"
                />
              </label>

              <label className="text-sm font-semibold">
                Categoria
                <select
                  value={requestForm.category}
                  onChange={event => setRequestForm(current => ({ ...current, category: event.target.value }))}
                  className="mt-1 min-h-11 w-full rounded-lg border border-border bg-card px-3"
                >
                  {categories.map(item => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              {requestForm.category === "Outros" && (
                <label className="text-sm font-semibold md:col-span-2">
                  Categoria personalizada
                  <input
                    value={requestForm.customCategory}
                    onChange={event => setRequestForm(current => ({ ...current, customCategory: event.target.value }))}
                    className="mt-1 min-h-11 w-full rounded-lg border border-border bg-card px-3"
                  />
                </label>
              )}

              <label className="text-sm font-semibold md:col-span-2">
                Descricao
                <textarea
                  value={requestForm.description}
                  onChange={event => setRequestForm(current => ({ ...current, description: event.target.value }))}
                  className="mt-1 min-h-24 w-full rounded-lg border border-border bg-card px-3 py-2"
                />
              </label>

              <label className="text-sm font-semibold">
                Obrigatorio
                <select
                  value={requestForm.required ? "sim" : "nao"}
                  onChange={event => setRequestForm(current => ({ ...current, required: event.target.value === "sim" }))}
                  className="mt-1 min-h-11 w-full rounded-lg border border-border bg-card px-3"
                >
                  <option value="sim">Sim</option>
                  <option value="nao">Nao</option>
                </select>
              </label>

              <label className="text-sm font-semibold">
                Prazo
                <input
                  type="date"
                  value={requestForm.dueDate}
                  onChange={event => setRequestForm(current => ({ ...current, dueDate: event.target.value }))}
                  className="mt-1 min-h-11 w-full rounded-lg border border-border bg-card px-3"
                />
              </label>

              <label className="text-sm font-semibold md:col-span-2">
                Destinatarios
                <input
                  value={requestForm.recipients}
                  onChange={event => setRequestForm(current => ({ ...current, recipients: event.target.value }))}
                  placeholder="Ex.: Marina Costa; Carlos Matos"
                  className="mt-1 min-h-11 w-full rounded-lg border border-border bg-card px-3"
                />
              </label>

              <label className="text-sm font-semibold md:col-span-2">
                Mensagem personalizada
                <textarea
                  value={requestForm.message}
                  onChange={event => setRequestForm(current => ({ ...current, message: event.target.value }))}
                  className="mt-1 min-h-20 w-full rounded-lg border border-border bg-card px-3 py-2"
                />
              </label>

              <div className="md:col-span-2">
                <p className="text-sm font-semibold">Modelo de checklist</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsModelModalOpen(true)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold"
                  >
                    <FileText size={15} />
                    Usar Modelo
                  </button>
                  <span className="inline-flex min-h-11 items-center rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground">
                    {requestForm.checklistModel || "Nenhum modelo aplicado"}
                  </span>
                </div>
              </div>

              <fieldset className="md:col-span-2">
                <legend className="text-sm font-semibold">Enviar por</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {([
                    ["email", "Email"],
                    ["whatsapp", "WhatsApp"],
                    ["ambos", "Ambos"],
                  ] as const).map(([value, label]) => (
                    <label key={value} className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold">
                      <input
                        type="radio"
                        checked={requestForm.channel === value}
                        onChange={() => setRequestForm(current => ({ ...current, channel: value }))}
                        className="size-4 accent-[#2f63e5]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setIsRequestModalOpen(false)} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold">
                Cancelar
              </button>
              <button
                onClick={submitNewRequest}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#2f63e5] px-4 text-sm font-semibold text-white"
              >
                <Send size={15} />
                Enviar solicitacao
              </button>
            </div>
          </div>
        </div>
      )}

      {isModelModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1330]/45 px-4" role="dialog" aria-modal="true" aria-label="Biblioteca de modelos">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Checklist Inteligente</h3>
              <button onClick={() => setIsModelModalOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold">
                Fechar
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Selecione um modelo para preencher automaticamente os documentos necessarios.</p>

            <div className="mt-4 grid gap-2">
              {(Object.keys(checklistModels) as ProcessModel[]).map(model => (
                <button
                  key={model}
                  onClick={() => applyChecklistModel(model)}
                  className="rounded-xl border border-border px-3 py-3 text-left text-sm font-semibold hover:border-[#9cb4ff] hover:bg-[#f8faff] focus-visible:outline-2 focus-visible:outline-[#7c3aed]"
                >
                  {model}
                  <p className="mt-1 text-xs font-normal text-muted-foreground">{checklistModels[model].join(" | ")}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-50 rounded-xl bg-[#12306f] px-4 py-3 text-sm font-semibold text-white shadow-xl">
          {toastMessage}
        </div>
      )}

      {selectedDocument && (
        <div className="sr-only" aria-live="polite">
          Integridade {integrityMap[integrityByDoc[selectedDocument.id]?.status ?? "pendente"].label}
        </div>
      )}
    </section>
  );
}

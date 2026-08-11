import { useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileSignature,
  PenSquare,
  Plus,
  Send,
  User,
  Users,
  XCircle,
} from "lucide-react";

type SignatureStatus = "aguardando" | "andamento" | "concluida" | "expirada" | "cancelada";
type SignatureType = "simples" | "avancada" | "rubrica" | "todas_paginas" | "inicial";
type SignatureLevel = "simples" | "avancada" | "qualificada";

type Signer = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  whatsapp: string;
  ordem: number;
  obrigatorio: boolean;
  posicao: string;
  status: "pendente" | "abriu" | "assinado" | "recusado";
  recusouMotivo?: string;
  assinadoEm?: string;
};

type SignatureFlow = {
  id: string;
  documento: string;
  status: SignatureStatus;
  prazo: string;
  atualizadoEm: string;
  assinaturaTipo: SignatureType;
  lembretesAtivos: boolean;
  versaoDocumento: number;
  hashDocumento: string;
  seladoEm?: string;
  carimboTempoConfiavel?: {
    provedor: string;
    protocolo: string;
    emitidoEmUTC: string;
  };
  cadeiaEvidencias?: {
    algoritmo: "SHA-256";
    hashAnterior: string;
    hashAtual: string;
    eventosTimeline: number;
    eventosAuditoria: number;
  };
  signers: Signer[];
  certificadoFinal?: {
    id: string;
    emitidoEm: string;
    resumo: string;
    hashDocumento: string;
    versaoDocumento: number;
  };
};

type AuditTrailRecord = {
  id: string;
  flowId: string;
  acao: string;
  usuario: string;
  email: string;
  ip: string;
  geolocalizacao: string;
  userAgent: string;
  timestamp: string;
  hashDocumento: string;
  versaoDocumento: number;
};

type TimelineEvent = {
  id: string;
  flowId: string;
  acao:
    | "Documento criado"
    | "Convites enviados"
    | "Assinante abriu"
    | "Assinou"
    | "Recusou"
    | "Expirou"
    | "Concluido";
  usuario: string;
  data: string;
  hora: string;
};

type FlowComment = {
  id: string;
  flowId: string;
  autor: string;
  mensagem: string;
  criadoEm: string;
};

const initialFlows: SignatureFlow[] = [
  {
    id: "SIG-3001",
    documento: "Contrato Social - Grupo Atlante",
    status: "aguardando",
    prazo: "2026-08-12",
    atualizadoEm: "2026-07-29 12:10",
    assinaturaTipo: "avancada",
    lembretesAtivos: true,
    versaoDocumento: 2,
    hashDocumento: "sha256:8f92c20ad8b3e6c14cae0c8b35d72f4f9d5f07e51603b5c79f667f602dd60c49",
    seladoEm: "2026-07-29 15:56",
    signers: [
      {
        id: "S1",
        nome: "Marina Costa",
        cpf: "321.654.987-00",
        email: "marina@exemplo.com",
        whatsapp: "(11) 99999-1111",
        ordem: 1,
        obrigatorio: true,
        posicao: "Pagina 3 - Rodape",
        status: "pendente",
      },
    ],
  },
  {
    id: "SIG-3002",
    documento: "Procuracao - Joao Ribeiro",
    status: "andamento",
    prazo: "2026-08-03",
    atualizadoEm: "2026-07-29 13:02",
    assinaturaTipo: "simples",
    lembretesAtivos: true,
    versaoDocumento: 1,
    hashDocumento: "sha256:c53b48aeb8a4548f31dd8a98d6de7d6f55cf2c7e4b4af2ebcfbc2658e4ad7da1",
    signers: [
      {
        id: "S2",
        nome: "Joao Ribeiro",
        cpf: "102.304.506-77",
        email: "joao@exemplo.com",
        whatsapp: "(11) 98888-7777",
        ordem: 1,
        obrigatorio: true,
        posicao: "Pagina 1 - Assinatura principal",
        status: "abriu",
      },
    ],
  },
  {
    id: "SIG-3003",
    documento: "Aditivo Contratual - Nova Lider",
    status: "concluida",
    prazo: "2026-07-28",
    atualizadoEm: "2026-07-28 16:24",
    assinaturaTipo: "todas_paginas",
    lembretesAtivos: false,
    versaoDocumento: 3,
    hashDocumento: "sha256:e544f4a3c777e0afec2d98d42e8755e300d1946f06d3198e2e8d6a12dcebc720",
    seladoEm: "2026-07-28 16:24",
    signers: [],
    certificadoFinal: {
      id: "CERT-SIG-3003",
      emitidoEm: "2026-07-28 16:24",
      resumo: "Documento Aditivo Contratual - Nova Lider concluido com 0/0 assinaturas.",
      hashDocumento: "sha256:e544f4a3c777e0afec2d98d42e8755e300d1946f06d3198e2e8d6a12dcebc720",
      versaoDocumento: 3,
    },
  },
];

const initialTimeline: TimelineEvent[] = [
  { id: "TE1", flowId: "SIG-3001", acao: "Documento criado", usuario: "Paulina", data: "2026-07-29", hora: "12:01" },
  { id: "TE2", flowId: "SIG-3001", acao: "Convites enviados", usuario: "Sistema", data: "2026-07-29", hora: "12:02" },
  { id: "TE3", flowId: "SIG-3002", acao: "Assinante abriu", usuario: "Joao Ribeiro", data: "2026-07-29", hora: "13:01" },
  { id: "TE4", flowId: "SIG-3003", acao: "Concluido", usuario: "Sistema", data: "2026-07-28", hora: "16:24" },
];

const initialAuditTrail: AuditTrailRecord[] = [
  {
    id: "AT1",
    flowId: "SIG-3001",
    acao: "CONVITES_ENVIADOS",
    usuario: "Sistema",
    email: "sistema@bureauflow.local",
    ip: "189.44.112.17",
    geolocalizacao: "Sao Paulo-SP, BR",
    userAgent: "BureauFlow-Client/4.2",
    timestamp: "2026-07-29 12:02",
    hashDocumento: "sha256:8f92c20ad8b3e6c14cae0c8b35d72f4f9d5f07e51603b5c79f667f602dd60c49",
    versaoDocumento: 2,
  },
  {
    id: "AT2",
    flowId: "SIG-3002",
    acao: "ASSINANTE_ABRIU",
    usuario: "Joao Ribeiro",
    email: "joao@exemplo.com",
    ip: "177.19.22.45",
    geolocalizacao: "Belo Horizonte-MG, BR",
    userAgent: "BureauFlow-Client/4.2",
    timestamp: "2026-07-29 13:01",
    hashDocumento: "sha256:c53b48aeb8a4548f31dd8a98d6de7d6f55cf2c7e4b4af2ebcfbc2658e4ad7da1",
    versaoDocumento: 1,
  },
];

const initialComments: FlowComment[] = [
  {
    id: "CM1",
    flowId: "SIG-3001",
    autor: "Paulina",
    mensagem: "Documento validado, pronto para coleta de assinaturas.",
    criadoEm: "2026-07-29 12:03",
  },
  {
    id: "CM2",
    flowId: "SIG-3002",
    autor: "Equipe Juridica",
    mensagem: "Cliente abriu o convite e iniciou a leitura.",
    criadoEm: "2026-07-29 13:05",
  },
];

function nowDateTime() {
  const now = new Date();
  const data = now.toISOString().slice(0, 10);
  const hora = now.toTimeString().slice(0, 5);
  return { data, hora, stamp: `${data} ${hora}` };
}

function nowUtcIso() {
  return new Date().toISOString();
}

function isExpiredDate(isoDate: string) {
  if (!isoDate) {
    return false;
  }
  const today = new Date().toISOString().slice(0, 10);
  return isoDate < today;
}

function mapSignatureTypeToLevel(signatureType: SignatureType): SignatureLevel {
  if (signatureType === "avancada") {
    return "avancada";
  }
  if (signatureType === "simples" || signatureType === "rubrica" || signatureType === "inicial") {
    return "simples";
  }
  return "qualificada";
}

async function generateSha256Hex(payload: string) {
  const data = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function mockAuditContext(email: string) {
  const ips = ["177.14.38.90", "187.9.201.14", "201.33.91.7", "189.44.112.17"];
  const geos = ["Sao Paulo-SP, BR", "Rio de Janeiro-RJ, BR", "Curitiba-PR, BR", "Salvador-BA, BR"];
  const index = Math.floor(Math.random() * ips.length);
  return {
    email: email || "nao-informado@bureauflow.local",
    ip: ips[index],
    geolocalizacao: geos[index],
    userAgent: navigator.userAgent || "BureauFlow-Client/4.2",
  };
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

function statusLabel(status: SignatureStatus) {
  const map: Record<SignatureStatus, string> = {
    aguardando: "Aguardando assinatura",
    andamento: "Em andamento",
    concluida: "Concluídas",
    expirada: "Expiradas",
    cancelada: "Canceladas",
  };
  return map[status];
}

function statusBadge(status: SignatureStatus) {
  const cls: Record<SignatureStatus, string> = {
    aguardando: "bg-[#fff8e8] text-[#825700]",
    andamento: "bg-[#eef3ff] text-[#193eaf]",
    concluida: "bg-[#edf9ea] text-[#196515]",
    expirada: "bg-[#fee4e2] text-[#7a271a]",
    cancelada: "bg-[#fff0ef] text-[#9e261d]",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${cls[status]}`}>{statusLabel(status)}</span>;
}

export default function ElectronicSignaturesModule({ goBack }: { goBack: () => void }) {
  const [flows, setFlows] = useState<SignatureFlow[]>(initialFlows);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialTimeline);
  const [auditTrail, setAuditTrail] = useState<AuditTrailRecord[]>(initialAuditTrail);
  const [comments, setComments] = useState<FlowComment[]>(initialComments);
  const [selectedFlowId, setSelectedFlowId] = useState(initialFlows[0]?.id ?? "");
  const [showNewModal, setShowNewModal] = useState(false);

  const [docName, setDocName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("Segue documento para assinatura.");
  const [reminders, setReminders] = useState(true);
  const [signatureType, setSignatureType] = useState<SignatureType>("simples");
  const [witnesses, setWitnesses] = useState("");

  const [signerName, setSignerName] = useState("");
  const [signerCpf, setSignerCpf] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signerWhatsapp, setSignerWhatsapp] = useState("");
  const [signerOrder, setSignerOrder] = useState(1);
  const [signerRequired, setSignerRequired] = useState(true);
  const [signerPosition, setSignerPosition] = useState("Pagina 1 - Assinatura");
  const [newSigners, setNewSigners] = useState<Signer[]>([]);

  const [toast, setToast] = useState("");
  const [refusalReason, setRefusalReason] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [portalSteps, setPortalSteps] = useState<Record<string, number>>({});
  const [signaturePositions, setSignaturePositions] = useState<Record<string, { x: number; y: number }>>({});
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const notify = (value: string) => {
    setToast(value);
    window.setTimeout(() => setToast(""), 2800);
  };

  const selected = flows.find(item => item.id === selectedFlowId) ?? null;

  const stats = useMemo(() => ({
    aguardando: flows.filter(item => item.status === "aguardando").length,
    andamento: flows.filter(item => item.status === "andamento").length,
    concluidas: flows.filter(item => item.status === "concluida").length,
    expiradas: flows.filter(item => item.status === "expirada").length,
    canceladas: flows.filter(item => item.status === "cancelada").length,
  }), [flows]);

  const selectedTimeline = useMemo(() => timeline.filter(item => item.flowId === selected?.id), [timeline, selected?.id]);
  const selectedAuditTrail = useMemo(() => auditTrail.filter(item => item.flowId === selected?.id), [auditTrail, selected?.id]);
  const selectedComments = useMemo(() => comments.filter(item => item.flowId === selected?.id), [comments, selected?.id]);

  const buildEvidencePayload = (flow: SignatureFlow) => {
    return {
      fluxo: {
        id: flow.id,
        documento: flow.documento,
        status: flow.status,
        assinaturaTipo: flow.assinaturaTipo,
        nivelAssinatura: mapSignatureTypeToLevel(flow.assinaturaTipo),
        versaoDocumento: flow.versaoDocumento,
        hashDocumento: flow.hashDocumento,
        seladoEm: flow.seladoEm ?? null,
      },
      carimboTempoConfiavel: flow.carimboTempoConfiavel ?? null,
      cadeiaEvidencias: flow.cadeiaEvidencias ?? null,
      assinantes: flow.signers,
      timeline: timeline.filter(event => event.flowId === flow.id),
      auditoria: auditTrail.filter(record => record.flowId === flow.id),
      baseLegal: {
        mp: "MP 2.200-2/2001",
        lei: "Lei 14.063/2020",
      },
      geradoEm: nowUtcIso(),
      observacao: "Prototipo de dossie tecnico-juridico para demonstracao.",
    };
  };

  const pushEvent = (flowId: string, acao: TimelineEvent["acao"], usuario: string) => {
    const now = nowDateTime();
    setTimeline(current => [{ id: `TE-${crypto.randomUUID()}`, flowId, acao, usuario, data: now.data, hora: now.hora }, ...current]);
  };

  const pushAudit = (flow: SignatureFlow, acao: string, usuario: string, email: string, override?: Partial<AuditTrailRecord>) => {
    const now = nowDateTime();
    const context = mockAuditContext(email);
    setAuditTrail(current => [
      {
        id: `AT-${crypto.randomUUID()}`,
        flowId: flow.id,
        acao,
        usuario,
        email: context.email,
        ip: context.ip,
        geolocalizacao: context.geolocalizacao,
        userAgent: context.userAgent,
        timestamp: now.stamp,
        hashDocumento: flow.hashDocumento,
        versaoDocumento: flow.versaoDocumento,
        ...override,
      },
      ...current,
    ]);
  };

  const addComment = () => {
    if (!selected || !commentDraft.trim()) {
      notify("Escreva um comentario antes de enviar.");
      return;
    }
    const now = nowDateTime();
    const message = commentDraft.trim();
    setComments(current => [
      {
        id: `CM-${crypto.randomUUID()}`,
        flowId: selected.id,
        autor: "Advogado",
        mensagem: message,
        criadoEm: now.stamp,
      },
      ...current,
    ]);
    setCommentDraft("");
    notify("Comentario adicionado.");
  };

  const clientStepLabels = ["Visualizar", "Aceitar termos", "Assinar", "Confirmar", "Download PDF"];

  const getPortalStepIndex = (flowId: string) => portalSteps[flowId] ?? 0;

  const setPortalStep = (flowId: string, stepIndex: number) => {
    setPortalSteps(current => ({ ...current, [flowId]: Math.max(0, Math.min(4, stepIndex)) }));
  };

  const startClientSigning = () => {
    if (!selected) {
      return;
    }
    const hasOpenEvent = timeline.some(event => event.flowId === selected.id && event.acao === "Assinante abriu");
    if (!hasOpenEvent) {
      pushEvent(selected.id, "Assinante abriu", "Portal Cliente");
      pushAudit(selected, "ASSINANTE_ABRIU", "Portal Cliente", "cliente@portal.local");
    }
    setPortalStep(selected.id, 0);
    notify("Fluxo iniciado no Portal Cliente.");
  };

  const movePortalStep = async (next: number) => {
    if (!selected) {
      return;
    }
    const currentStep = getPortalStepIndex(selected.id);
    if (next <= currentStep) {
      setPortalStep(selected.id, next);
      return;
    }

    if (next === 3 && currentStep < 3) {
      await signCurrentStep();
    }
    setPortalStep(selected.id, next);
  };

  const updateSignaturePosition = (flowId: string, x: number, y: number) => {
    setSignaturePositions(current => ({
      ...current,
      [flowId]: {
        x: Math.max(4, Math.min(92, x)),
        y: Math.max(8, Math.min(84, y)),
      },
    }));
  };

  const onCanvasDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!selected || !canvasRef.current) {
      return;
    }
    event.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    updateSignaturePosition(selected.id, x, y);
    notify("Assinatura posicionada no canvas.");
  };

  const createSignaturePosition = () => {
    if (!selected) {
      return;
    }
    const currentSigner = getCurrentSignerForOrder(selected.signers);
    if (!currentSigner) {
      notify("Nao ha assinante pendente para definir posicao.");
      return;
    }

    const pos = signaturePositions[selected.id] ?? { x: 52, y: 62 };
    setFlows(current =>
      current.map(flow => {
        if (flow.id !== selected.id) {
          return flow;
        }
        const updatedSigners = flow.signers.map(signer =>
          signer.id === currentSigner.id
            ? { ...signer, posicao: `Canvas ${Math.round(pos.x)}% x ${Math.round(pos.y)}%` }
            : signer,
        );
        return touchFlowUpdatedAt({ ...flow, signers: updatedSigners });
      }),
    );
    notify("Posicao de assinatura criada para o assinante atual.");
  };

  const applyTrustedTimestamp = async () => {
    if (!selected) {
      return;
    }
    if (!selected.hashDocumento) {
      notify("Fluxo sem hash de documento para carimbar.");
      return;
    }

    const now = nowDateTime();
    const previousHash = selected.cadeiaEvidencias?.hashAtual ?? selected.hashDocumento;
    const chainPayload = JSON.stringify({
      flowId: selected.id,
      previousHash,
      currentHash: selected.hashDocumento,
      timelineEvents: timeline.filter(event => event.flowId === selected.id).length,
      auditEvents: auditTrail.filter(record => record.flowId === selected.id).length,
      stampedAt: nowUtcIso(),
    });
    const chainHash = `sha256:${await generateSha256Hex(chainPayload)}`;
    const protocol = `ICPB-${Math.floor(Math.random() * 900000) + 100000}`;

    let updatedSnapshot: SignatureFlow | null = null;

    setFlows(current =>
      current.map(flow => {
        if (flow.id !== selected.id) {
          return flow;
        }

        const nextFlow = touchFlowUpdatedAt({
          ...flow,
          seladoEm: now.stamp,
          carimboTempoConfiavel: {
            provedor: "CarimboConfiavel-BR",
            protocolo: protocol,
            emitidoEmUTC: nowUtcIso(),
          },
          cadeiaEvidencias: {
            algoritmo: "SHA-256",
            hashAnterior: previousHash,
            hashAtual: chainHash,
            eventosTimeline: timeline.filter(event => event.flowId === flow.id).length,
            eventosAuditoria: auditTrail.filter(record => record.flowId === flow.id).length,
          },
        });

        updatedSnapshot = nextFlow;
        return nextFlow;
      }),
    );

    pushEvent(selected.id, "Concluido", "Carimbo Temporal");
    if (updatedSnapshot) {
      pushAudit(updatedSnapshot, "CARIMBO_TEMPO_CONFIAVEL", "Sistema", "sistema@bureauflow.local");
    }

    notify("Carimbo temporal confiavel aplicado e cadeia de evidencias atualizada.");
  };

  const exportEvidenceJson = () => {
    if (!selected) {
      return;
    }
    const payload = buildEvidencePayload(selected);
    downloadTextFile(`dossie-${selected.id}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
    notify("Dossie JSON exportado.");
  };

  const exportEvidencePrintable = () => {
    if (!selected) {
      return;
    }

    const payload = buildEvidencePayload(selected);
    const printableHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dossie de Evidencias ${payload.fluxo.id}</title>
    <style>
      body { font-family: "Segoe UI", Arial, sans-serif; margin: 28px; color: #1b2842; }
      h1, h2 { margin: 0 0 8px; }
      h1 { font-size: 22px; }
      h2 { font-size: 16px; margin-top: 18px; }
      p { margin: 2px 0; font-size: 13px; }
      .box { border: 1px solid #d8e0f2; border-radius: 10px; padding: 12px; margin-top: 8px; }
      .mono { font-family: Consolas, "Courier New", monospace; word-break: break-all; }
    </style>
  </head>
  <body>
    <h1>Dossie de Evidencias - ${payload.fluxo.id}</h1>
    <p>Base legal: ${payload.baseLegal.mp} e ${payload.baseLegal.lei}</p>
    <p>Gerado em: ${payload.geradoEm}</p>

    <h2>Fluxo</h2>
    <div class="box">
      <p>Documento: ${payload.fluxo.documento}</p>
      <p>Status: ${payload.fluxo.status}</p>
      <p>Nivel: ${payload.fluxo.nivelAssinatura}</p>
      <p>Versao: ${payload.fluxo.versaoDocumento}</p>
      <p class="mono">Hash: ${payload.fluxo.hashDocumento}</p>
      <p>Selado em: ${payload.fluxo.seladoEm ?? "nao selado"}</p>
    </div>

    <h2>Carimbo Temporal</h2>
    <div class="box">
      <p>Provedor: ${payload.carimboTempoConfiavel?.provedor ?? "nao aplicado"}</p>
      <p>Protocolo: ${payload.carimboTempoConfiavel?.protocolo ?? "-"}</p>
      <p>Emitido UTC: ${payload.carimboTempoConfiavel?.emitidoEmUTC ?? "-"}</p>
    </div>

    <h2>Cadeia de Evidencias</h2>
    <div class="box">
      <p>Algoritmo: ${payload.cadeiaEvidencias?.algoritmo ?? "-"}</p>
      <p class="mono">Hash anterior: ${payload.cadeiaEvidencias?.hashAnterior ?? "-"}</p>
      <p class="mono">Hash atual: ${payload.cadeiaEvidencias?.hashAtual ?? "-"}</p>
      <p>Eventos timeline: ${payload.cadeiaEvidencias?.eventosTimeline ?? 0}</p>
      <p>Eventos auditoria: ${payload.cadeiaEvidencias?.eventosAuditoria ?? 0}</p>
    </div>

    <h2>Observacao</h2>
    <div class="box">
      <p>${payload.observacao}</p>
      <p>Este HTML foi estruturado para exportacao por "Salvar como PDF" no navegador.</p>
    </div>
  </body>
</html>`;

    downloadTextFile(`dossie-${selected.id}.html`, printableHtml, "text/html;charset=utf-8");
    notify("Dossie imprimivel exportado (HTML pronto para PDF).");
  };

  const touchFlowUpdatedAt = (flow: SignatureFlow) => {
    const now = nowDateTime();
    return { ...flow, atualizadoEm: now.stamp };
  };

  const normalizeAndSortSigners = (signers: Signer[]) => {
    return [...signers].sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome));
  };

  const getCurrentSignerForOrder = (signers: Signer[]) => {
    const ordered = normalizeAndSortSigners(signers);
    const pending = ordered.find(s => s.status === "pendente" || s.status === "abriu");
    return pending ?? null;
  };

  const shouldConcludeFlow = (flow: SignatureFlow) => {
    if (flow.signers.length === 0) {
      return false;
    }
    return flow.signers.every(s => !s.obrigatorio || s.status === "assinado");
  };

  const emitCertificate = (flow: SignatureFlow) => {
    const now = nowDateTime();
    const total = flow.signers.length;
    const signed = flow.signers.filter(s => s.status === "assinado").length;
    return {
      id: `CERT-${flow.id}`,
      emitidoEm: now.stamp,
      resumo: `Documento ${flow.documento} concluido com ${signed}/${total} assinaturas.`,
      hashDocumento: flow.hashDocumento,
      versaoDocumento: flow.versaoDocumento,
    };
  };

  const expireOverdueFlows = () => {
    const changedFlowIds: string[] = [];

    setFlows(current =>
      current.map(flow => {
        const canExpire = flow.status === "aguardando" || flow.status === "andamento";
        if (!canExpire || !isExpiredDate(flow.prazo)) {
          return flow;
        }

        changedFlowIds.push(flow.id);
        return touchFlowUpdatedAt({ ...flow, status: "expirada" });
      }),
    );

    changedFlowIds.forEach(id => {
      pushEvent(id, "Expirou", "Sistema");
      const flow = flows.find(item => item.id === id);
      if (flow) {
        pushAudit(flow, "FLUXO_EXPIRADO", "Sistema", "sistema@bureauflow.local");
      }
    });

    if (changedFlowIds.length > 0) {
      notify(`${changedFlowIds.length} fluxo(s) marcado(s) como expirado(s).`);
    }
  };

  const signCurrentStep = async () => {
    if (!selected) {
      return;
    }
    if (selected.status === "expirada" || selected.status === "cancelada") {
      notify("Fluxo encerrado. Nao e possivel assinar.");
      return;
    }

    const currentSigner = getCurrentSignerForOrder(selected.signers);
    if (!currentSigner) {
      notify("Nao ha assinante pendente para este fluxo.");
      return;
    }

    const now = nowDateTime();
    let concluded = false;
    let selectedSignerName = currentSigner.nome;
    const updatedSignersPreview = selected.signers.map(signer =>
      signer.id === currentSigner.id
        ? { ...signer, status: "assinado" as const, assinadoEm: now.stamp }
        : signer,
    );
    const nextVersion = selected.versaoDocumento + 1;
    const hashPayload = JSON.stringify({
      flowId: selected.id,
      documento: selected.documento,
      versao: nextVersion,
      assinantes: updatedSignersPreview,
      timestamp: now.stamp,
    });
    const nextHash = `sha256:${await generateSha256Hex(hashPayload)}`;
    let updatedFlowSnapshot: SignatureFlow | null = null;

    setFlows(current =>
      current.map(flow => {
        if (flow.id !== selected.id) {
          return flow;
        }

        const updatedSigners = updatedSignersPreview;

        let nextFlow: SignatureFlow = touchFlowUpdatedAt({
          ...flow,
          signers: updatedSigners,
          status: "andamento",
          versaoDocumento: nextVersion,
          hashDocumento: nextHash,
        });

        if (shouldConcludeFlow(nextFlow)) {
          concluded = true;
          nextFlow = touchFlowUpdatedAt({
            ...nextFlow,
            status: "concluida",
            seladoEm: now.stamp,
            certificadoFinal: emitCertificate({ ...nextFlow, signers: updatedSigners }),
          });
        }

        updatedFlowSnapshot = nextFlow;

        return nextFlow;
      }),
    );

    pushEvent(selected.id, "Assinou", selectedSignerName);
    if (updatedFlowSnapshot) {
      pushAudit(updatedFlowSnapshot, "ASSINATURA_REGISTRADA", selectedSignerName, currentSigner.email);
    }
    if (concluded) {
      pushEvent(selected.id, "Concluido", "Sistema");
      if (updatedFlowSnapshot) {
        pushAudit(updatedFlowSnapshot, "SELO_FINAL_GERADO", "Sistema", "sistema@bureauflow.local", {
          hashDocumento: updatedFlowSnapshot.hashDocumento,
          versaoDocumento: updatedFlowSnapshot.versaoDocumento,
        });
      }
      notify("Fluxo concluido e certificado final emitido.");
      return;
    }

    notify(`Assinatura registrada para ${selectedSignerName}.`);
  };

  const refuseCurrentStep = () => {
    if (!selected) {
      return;
    }
    if (!refusalReason.trim()) {
      notify("Informe o motivo da recusa.");
      return;
    }
    if (selected.status === "expirada" || selected.status === "cancelada" || selected.status === "concluida") {
      notify("Fluxo encerrado. Nao e possivel recusar.");
      return;
    }

    const currentSigner = getCurrentSignerForOrder(selected.signers);
    if (!currentSigner) {
      notify("Nao ha assinante pendente para este fluxo.");
      return;
    }

    setFlows(current =>
      current.map(flow => {
        if (flow.id !== selected.id) {
          return flow;
        }

        const updatedSigners = flow.signers.map(signer =>
          signer.id === currentSigner.id
            ? { ...signer, status: "recusado" as const, recusouMotivo: refusalReason.trim() }
            : signer,
        );

        const nextFlow = touchFlowUpdatedAt({ ...flow, signers: updatedSigners, status: "cancelada" });
        pushAudit(nextFlow, "RECUSA_REGISTRADA", currentSigner.nome, currentSigner.email);
        return nextFlow;
      }),
    );

    pushEvent(selected.id, "Recusou", `${currentSigner.nome} (${refusalReason.trim()})`);
    setRefusalReason("");
    notify("Recusa registrada e fluxo cancelado.");
  };

  const addSigner = () => {
    if (!signerName || !signerEmail || !signerCpf) {
      notify("Preencha nome, CPF e email do assinante.");
      return;
    }

    setNewSigners(current => [
      ...current,
      {
        id: `S-${crypto.randomUUID()}`,
        nome: signerName,
        cpf: signerCpf,
        email: signerEmail,
        whatsapp: signerWhatsapp,
        ordem: signerOrder,
        obrigatorio: signerRequired,
        posicao: signerPosition,
        status: "pendente",
      },
    ]);

    setSignerName("");
    setSignerCpf("");
    setSignerEmail("");
    setSignerWhatsapp("");
    setSignerOrder(current => current + 1);
    setSignerRequired(true);
    setSignerPosition("Pagina 1 - Assinatura");
  };

  const createFlow = async () => {
    if (!docName || !dueDate || newSigners.length === 0) {
      notify("Informe documento, prazo e pelo menos 1 assinante.");
      return;
    }

    const now = nowDateTime();
    const initialVersion = 1;
    const initialHashPayload = JSON.stringify({
      documento: docName,
      prazo: dueDate,
      tipo: signatureType,
      testemunhas: witnesses,
      versao: initialVersion,
      assinantes: normalizeAndSortSigners(newSigners),
      timestamp: now.stamp,
    });
    const initialHash = `sha256:${await generateSha256Hex(initialHashPayload)}`;
    const newFlow: SignatureFlow = {
      id: `SIG-${Math.floor(Math.random() * 9000) + 1000}`,
      documento: docName,
      status: "aguardando",
      prazo: dueDate,
      atualizadoEm: now.stamp,
      assinaturaTipo: signatureType,
      lembretesAtivos: reminders,
      versaoDocumento: initialVersion,
      hashDocumento: initialHash,
      signers: normalizeAndSortSigners(newSigners),
    };

    setFlows(current => [newFlow, ...current]);
    setSelectedFlowId(newFlow.id);
    setShowNewModal(false);

    pushEvent(newFlow.id, "Documento criado", "Advogado");
    pushEvent(newFlow.id, "Convites enviados", "Sistema");
    pushAudit(newFlow, "CRIACAO_FLUXO", "Advogado", "advogado@escritorio.local");
    pushAudit(newFlow, "CONVITES_ENVIADOS", "Sistema", "sistema@bureauflow.local");

    setDocName("");
    setDueDate("");
    setMessage("Segue documento para assinatura.");
    setReminders(true);
    setSignatureType("simples");
    setWitnesses("");
    setNewSigners([]);

    notify("Nova assinatura criada com sucesso.");
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#6247c8]">Sprint 4 - Assinaturas Eletrônicas</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-.03em]">Assinaturas</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={goBack} className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground hover:bg-muted">
            Voltar
          </button>
          <button onClick={() => setShowNewModal(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2f63e5] px-4 text-sm font-semibold text-white hover:bg-[#2454ce]">
            <Plus size={16} />
            Nova Assinatura
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <CardMetric title="Aguardando assinatura" value={stats.aguardando} icon={<Clock3 size={17} />} />
        <CardMetric title="Em andamento" value={stats.andamento} icon={<FileSignature size={17} />} />
        <CardMetric title="Concluídas" value={stats.concluidas} icon={<CheckCircle2 size={17} />} />
        <CardMetric title="Expiradas" value={stats.expiradas} icon={<XCircle size={17} />} />
        <CardMetric title="Canceladas" value={stats.canceladas} icon={<XCircle size={17} />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Fluxos de assinatura</h2>
          <div className="mt-3">
            <button onClick={expireOverdueFlows} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted">
              <Clock3 size={15} />
              Verificar expiracao automatica
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {flows.map(flow => (
              <button
                key={flow.id}
                onClick={() => setSelectedFlowId(flow.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left ${selectedFlowId === flow.id ? "border-[#2f63e5] bg-[#f8faff]" : "border-border"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{flow.documento}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Prazo {flow.prazo} | Atualizado {flow.atualizadoEm}</p>
                  </div>
                  {statusBadge(flow.status)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Portal Cliente</h2>
          <p className="mt-1 text-sm text-muted-foreground">Assinar Documento: Visualizar | Aceitar termos | Assinar | Confirmar | Download PDF</p>
          <div className="mt-3">
            <button onClick={startClientSigning} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#2f63e5] px-3 text-sm font-semibold text-white hover:bg-[#2454ce]">
              <FileSignature size={15} />
              Assinar Documento
            </button>
          </div>
          {selected && (
            <div className="mt-3 rounded-xl border border-[#d5dff9] bg-[#f7f9ff] p-3">
              <p className="text-sm font-semibold text-[#193eaf]">Validade juridica e nivel de assinatura</p>
              <p className="mt-1 text-xs text-[#193eaf]">Base legal: MP 2.200-2/2001 e Lei 14.063/2020.</p>
              <p className="mt-1 text-xs text-[#193eaf]">Nivel aplicado neste fluxo: {mapSignatureTypeToLevel(selected.assinaturaTipo)}</p>
              <p className="mt-1 text-xs text-[#193eaf]">Hash atual: {selected.hashDocumento.slice(0, 28)}...</p>
              <p className="mt-1 text-xs text-[#193eaf]">Versao do documento: {selected.versaoDocumento}</p>
            </div>
          )}
          {selected && (
            <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-sm font-semibold">Regra de ordem bloqueante</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Proximo assinante: {getCurrentSignerForOrder(selected.signers)?.nome ?? "Nenhum"} | Ordem {getCurrentSignerForOrder(selected.signers)?.ordem ?? "-"}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button onClick={signCurrentStep} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#bde7b4] bg-[#edf9ea] px-3 text-sm font-semibold text-[#196515]">
                  <FileCheck2 size={15} />
                  Registrar assinatura do passo atual
                </button>
                <button onClick={refuseCurrentStep} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#fec9c2] bg-[#fff0ef] px-3 text-sm font-semibold text-[#9e261d]">
                  <XCircle size={15} />
                  Recusar assinatura do passo atual
                </button>
              </div>
              <label className="mt-2 block text-xs font-semibold text-muted-foreground">
                Motivo da recusa
                <textarea
                  value={refusalReason}
                  onChange={e => setRefusalReason(e.target.value)}
                  placeholder="Ex.: dados divergentes no documento"
                  className="mt-1 min-h-16 w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground"
                />
              </label>
            </div>
          )}
          {selected && (
            <div className="mt-3 grid gap-2">
              {clientStepLabels.map((label, index) => {
                const step = getPortalStepIndex(selected.id);
                const done = index <= step;
                return (
                  <button
                    key={label}
                    onClick={() => void movePortalStep(index)}
                    className={`min-h-11 rounded-lg border px-3 text-left text-sm font-semibold ${done ? "border-[#bde7b4] bg-[#edf9ea] text-[#196515]" : "border-border"}`}
                  >
                    {index + 1}. {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Canvas e posicionamento</h2>
          <p className="mt-1 text-sm text-muted-foreground">Canvas PDF | Arrastar assinatura | Assinatura em todas as páginas | Rubrica | Inicial</p>
          {selected && (
            <>
              <div className="mt-3 rounded-xl border border-border bg-muted/20 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Viewer</p>
                <p className="mt-1 text-xs text-muted-foreground">Documento: {selected.documento}</p>
              </div>
              <div
                ref={canvasRef}
                onDragOver={event => event.preventDefault()}
                onDrop={onCanvasDrop}
                className="relative mt-3 h-56 rounded-xl border border-dashed border-border bg-muted/40"
              >
                <p className="px-3 pt-3 text-xs text-muted-foreground">Canvas PDF (mock): arraste a etiqueta de assinatura para definir a posicao.</p>
                <div
                  style={{ left: `${(signaturePositions[selected.id]?.x ?? 52).toFixed(0)}%`, top: `${(signaturePositions[selected.id]?.y ?? 62).toFixed(0)}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <span className="rounded-md border border-[#2f63e5] bg-[#eef3ff] px-2 py-1 text-xs font-semibold text-[#193eaf]">Posicao alvo</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span draggable className="inline-flex cursor-grab rounded-lg border border-[#2f63e5] bg-[#eef3ff] px-3 py-1.5 text-xs font-semibold text-[#193eaf] active:cursor-grabbing">
                  Arrastar assinatura
                </span>
                <button onClick={createSignaturePosition} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted">
                  <PenSquare size={14} />
                  Criar posicionamento
                </button>
              </div>
            </>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-border px-2 py-1">Viewer</span>
            <span className="rounded-full border border-border px-2 py-1">Assinantes</span>
            <span className="rounded-full border border-border px-2 py-1">Comentarios</span>
            <span className="rounded-full border border-border px-2 py-1">Certificado Final</span>
            <span className="rounded-full border border-border px-2 py-1">Download</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">Documento criado, convites enviados, assinante abriu, assinou, recusou, expirou, concluido.</p>
          <div className="mt-3 space-y-2">
            {selectedTimeline.length === 0 && <p className="text-sm text-muted-foreground">Sem eventos para este fluxo.</p>}
            {selectedTimeline.map(event => (
              <div key={event.id} className="rounded-xl border border-border px-3 py-2">
                <p className="text-sm font-semibold">{event.acao}</p>
                <p className="mt-1 text-xs text-muted-foreground">Usuario: {event.usuario} | Data: {event.data} | Hora: {event.hora}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Trilha de auditoria</h2>
          <p className="mt-1 text-sm text-muted-foreground">Registros tecnicos com IP, geolocalizacao, timestamp, e-mail, hash e versao do documento.</p>
          <div className="mt-3 space-y-2">
            {selectedAuditTrail.length === 0 && <p className="text-sm text-muted-foreground">Sem registros para este fluxo.</p>}
            {selectedAuditTrail.slice(0, 8).map(record => (
              <div key={record.id} className="rounded-xl border border-border px-3 py-2">
                <p className="text-sm font-semibold">{record.acao}</p>
                <p className="mt-1 text-xs text-muted-foreground">Usuario: {record.usuario} | Email: {record.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">IP: {record.ip} | Geolocalizacao: {record.geolocalizacao}</p>
                <p className="mt-1 text-xs text-muted-foreground">Timestamp: {record.timestamp} | Versao: {record.versaoDocumento}</p>
                <p className="mt-1 text-xs text-muted-foreground">Hash: {record.hashDocumento}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Comentarios</h2>
          <p className="mt-1 text-sm text-muted-foreground">Registro colaborativo entre time interno e portal cliente.</p>
          <div className="mt-3 space-y-2">
            {selectedComments.length === 0 && <p className="text-sm text-muted-foreground">Sem comentarios neste fluxo.</p>}
            {selectedComments.map(item => (
              <div key={item.id} className="rounded-xl border border-border px-3 py-2">
                <p className="text-sm font-semibold">{item.autor}</p>
                <p className="mt-1 text-sm text-foreground">{item.mensagem}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.criadoEm}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={commentDraft}
              onChange={event => setCommentDraft(event.target.value)}
              placeholder="Adicionar comentario"
              className="min-h-11 rounded-lg border border-border bg-card px-3 text-sm"
            />
            <button onClick={addComment} className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted">
              Enviar comentario
            </button>
          </div>
        </div>
      )}

      {selected && (
        <div className="mt-4 rounded-2xl border border-[#d5dff9] bg-[#f7f9ff] p-4">
          <h2 className="text-lg font-semibold text-[#193eaf]">Cadeia de evidencias e carimbo temporal</h2>
          <p className="mt-1 text-sm text-[#193eaf]">Aplique carimbo temporal confiavel e exporte dossie tecnico para prova.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <button onClick={applyTrustedTimestamp} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c2d2ff] bg-white px-3 text-sm font-semibold text-[#193eaf]">
              <Clock3 size={15} />
              Aplicar carimbo temporal
            </button>
            <button onClick={exportEvidenceJson} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c2d2ff] bg-white px-3 text-sm font-semibold text-[#193eaf]">
              <FileCheck2 size={15} />
              Exportar dossie JSON
            </button>
            <button onClick={exportEvidencePrintable} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#c2d2ff] bg-white px-3 text-sm font-semibold text-[#193eaf]">
              <PenSquare size={15} />
              Exportar dossie PDF
            </button>
          </div>

          <div className="mt-3 rounded-xl border border-[#c2d2ff] bg-white p-3 text-xs text-[#193eaf]">
            <p>Provedor: {selected.carimboTempoConfiavel?.provedor ?? "Nao aplicado"}</p>
            <p>Protocolo: {selected.carimboTempoConfiavel?.protocolo ?? "-"}</p>
            <p>Emitido UTC: {selected.carimboTempoConfiavel?.emitidoEmUTC ?? "-"}</p>
            <p>Algoritmo: {selected.cadeiaEvidencias?.algoritmo ?? "SHA-256"}</p>
            <p>Hash anterior: {selected.cadeiaEvidencias?.hashAnterior ?? selected.hashDocumento}</p>
            <p>Hash atual: {selected.cadeiaEvidencias?.hashAtual ?? selected.hashDocumento}</p>
          </div>
        </div>
      )}

      {selected && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Assinantes do fluxo selecionado</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {selected.signers.length === 0 && <p className="text-sm text-muted-foreground">Sem assinantes vinculados.</p>}
            {selected.signers.map(signer => (
              <article key={signer.id} className="rounded-xl border border-border p-3">
                <p className="font-semibold">{signer.nome}</p>
                <p className="mt-1 text-xs text-muted-foreground">CPF {signer.cpf} | Email {signer.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">WhatsApp {signer.whatsapp} | Ordem {signer.ordem}</p>
                <p className="mt-1 text-xs text-muted-foreground">Posicao {signer.posicao} | Obrigatorio {signer.obrigatorio ? "Sim" : "Nao"}</p>
                <p className="mt-1 text-xs text-muted-foreground">Status {signer.status}</p>
                {signer.assinadoEm && <p className="mt-1 text-xs text-muted-foreground">Assinado em {signer.assinadoEm}</p>}
                {signer.recusouMotivo && <p className="mt-1 text-xs text-[#9e261d]">Motivo da recusa: {signer.recusouMotivo}</p>}
              </article>
            ))}
          </div>
          {selected.certificadoFinal && (
            <div className="mt-3 rounded-xl border border-[#bde7b4] bg-[#edf9ea] p-3">
              <p className="text-sm font-semibold text-[#196515]">Certificado Final</p>
              <p className="mt-1 text-xs text-[#196515]">ID {selected.certificadoFinal.id}</p>
              <p className="mt-1 text-xs text-[#196515]">Emitido em {selected.certificadoFinal.emitidoEm}</p>
              <p className="mt-1 text-xs text-[#196515]">Versao {selected.certificadoFinal.versaoDocumento} | Hash {selected.certificadoFinal.hashDocumento}</p>
              <p className="mt-1 text-xs text-[#196515]">{selected.certificadoFinal.resumo}</p>
            </div>
          )}
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1330]/45 px-4" role="dialog" aria-modal="true" aria-label="Nova Assinatura">
          <div className="w-full max-w-4xl rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">Nova Assinatura</h3>
              <button onClick={() => setShowNewModal(false)} className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold">
                Fechar
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold">
                Selecionar documento
                <input value={docName} onChange={e => setDocName(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-border px-3" />
              </label>
              <label className="text-sm font-semibold">
                Prazo
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-border px-3" />
              </label>

              <label className="text-sm font-semibold">
                Tipo de assinatura
                <select value={signatureType} onChange={e => setSignatureType(e.target.value as SignatureType)} className="mt-1 min-h-11 w-full rounded-lg border border-border px-3">
                  <option value="simples">Assinatura simples</option>
                  <option value="avancada">Assinatura avancada</option>
                  <option value="rubrica">Rubrica</option>
                  <option value="todas_paginas">Assinatura em todas paginas</option>
                  <option value="inicial">Inicial</option>
                </select>
              </label>

              <label className="text-sm font-semibold">
                Testemunhas
                <input value={witnesses} onChange={e => setWitnesses(e.target.value)} placeholder="Nome 1; Nome 2" className="mt-1 min-h-11 w-full rounded-lg border border-border px-3" />
              </label>

              <label className="text-sm font-semibold md:col-span-2">
                Mensagem personalizada
                <textarea value={message} onChange={e => setMessage(e.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-border px-3 py-2" />
              </label>

              <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold md:col-span-2">
                <input type="checkbox" checked={reminders} onChange={e => setReminders(e.target.checked)} className="size-4 accent-[#2f63e5]" />
                Lembretes automaticos
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-border p-3">
              <p className="text-sm font-semibold">Selecionar assinantes</p>
              <p className="mt-1 text-xs text-muted-foreground">Preencha os campos abaixo para adicionar cada assinante ao fluxo.</p>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                <input value={signerName} onChange={e => setSignerName(e.target.value)} placeholder="Nome" className="min-h-11 rounded-lg border border-border px-3 text-sm" />
                <input value={signerCpf} onChange={e => setSignerCpf(e.target.value)} placeholder="CPF" className="min-h-11 rounded-lg border border-border px-3 text-sm" />
                <input value={signerEmail} onChange={e => setSignerEmail(e.target.value)} placeholder="Email" className="min-h-11 rounded-lg border border-border px-3 text-sm" />
                <input value={signerWhatsapp} onChange={e => setSignerWhatsapp(e.target.value)} placeholder="WhatsApp" className="min-h-11 rounded-lg border border-border px-3 text-sm" />
                <input type="number" value={signerOrder} onChange={e => setSignerOrder(Number(e.target.value || 1))} placeholder="Ordem" className="min-h-11 rounded-lg border border-border px-3 text-sm" />
                <input value={signerPosition} onChange={e => setSignerPosition(e.target.value)} placeholder="Posicao da assinatura" className="min-h-11 rounded-lg border border-border px-3 text-sm" />
              </div>
              <label className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={signerRequired} onChange={e => setSignerRequired(e.target.checked)} className="size-4 accent-[#2f63e5]" />
                Assinante obrigatorio
              </label>
              <div className="mt-2">
                <button onClick={addSigner} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold">
                  <Users size={15} />
                  Adicionar assinante
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {newSigners.map(signer => (
                  <div key={signer.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                    {signer.nome} | {signer.email} | Ordem {signer.ordem}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setShowNewModal(false)} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold">
                Cancelar
              </button>
              <button onClick={createFlow} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#2f63e5] px-4 text-sm font-semibold text-white">
                <Send size={15} />
                Criar assinatura
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-5 right-5 z-50 rounded-xl bg-[#12306f] px-4 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </section>
  );
}

function CardMetric({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <span className="text-[#2f63e5]">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-.02em]">{value}</p>
    </div>
  );
}

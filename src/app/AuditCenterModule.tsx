type Props = {
  goBack: () => void;
  openAuditFlow: () => void;
};

export default function AuditCenterModule({ goBack, openAuditFlow }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#6247c8]">Auditoria</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-.03em]">Auditoria</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acompanhe integridade, eventos e cadeia de evidencias sem expor detalhes tecnicos na visao inicial.</p>
        </div>
        <button onClick={goBack} className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">
          Voltar ao painel
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Ultima atividade</p><p className="mt-2 text-lg font-semibold">Hoje 10:32</p></article>
        <article className="rounded-2xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Integridade</p><p className="mt-2 text-lg font-semibold">Garantida</p></article>
        <article className="rounded-2xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Eventos registrados</p><p className="mt-2 text-lg font-semibold">214</p></article>
        <article className="rounded-2xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Versoes</p><p className="mt-2 text-lg font-semibold">39</p></article>
      </div>

      <article className="mt-5 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Cadeia de evidencias</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use a visao completa para investigar eventos e trilhas por documento.</p>
        <button onClick={openAuditFlow} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">
          Ver auditoria completa
        </button>
      </article>
    </section>
  );
}

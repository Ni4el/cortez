type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
};

export function EmptyState({ eyebrow, title, children }: EmptyStateProps) {
  return (
    <section className="empty-state" aria-labelledby="empty-state-title">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 id="empty-state-title">{title}</h1>
      <div className="empty-state-copy">{children}</div>
    </section>
  );
}

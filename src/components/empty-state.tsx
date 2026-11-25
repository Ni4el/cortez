type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  backButton?: React.ReactNode;
};

export function EmptyState({ eyebrow, title, children, backButton }: EmptyStateProps) {
  return (
    <section className="empty-state" aria-labelledby="empty-state-title">
      {(backButton || eyebrow) ? (
        <div className="about-header">
          {backButton ? backButton : null}
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        </div>
      ) : null}
      <h1 id="empty-state-title">{title}</h1>
      <div className="empty-state-copy">{children}</div>
    </section>
  );
}

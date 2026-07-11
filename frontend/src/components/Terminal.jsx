export default function Terminal({ title, children, wide = false }) {
  return (
    <div className="screen center">
      <div className={wide ? "terminal terminal-wide" : "terminal"}>
        <div className="titlebar">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
          <span className="titlebar-name">{title}</span>
        </div>
        <div className="tux" aria-hidden="true">🐧</div>
        <div className="terminal-body">{children}</div>
      </div>
    </div>
  );
}

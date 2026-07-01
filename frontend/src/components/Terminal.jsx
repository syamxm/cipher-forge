export default function Terminal({ title, children }) {
  return (
    <div className="screen center">
      <div className="terminal">
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

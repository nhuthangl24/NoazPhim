export default function SiteLockScreen({ settings }) {
  return (
    <div className="site-lock-shell">
      <div className="site-lock-backdrop" />
      <div className="site-lock-card">
        <div className="site-lock-icon" aria-hidden="true">!</div>
        <div className="site-lock-badge">{settings.lockBadge}</div>
        <h1 className="site-lock-title">{settings.lockTitle}</h1>
        <p className="site-lock-message">{settings.lockMessage}</p>
  
      </div>
    </div>
  );
}

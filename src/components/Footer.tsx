import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="footer__copy mono">© 2026 NEXORA SYSTEMS</span>
        <span className="footer__mid mono">BUILT FOR GROWTH</span>
        <span className="footer__tag mono">
          TURNING ATTENTION INTO AUTOMATED REVENUE
        </span>
        <div className="footer__wave" aria-hidden="true">
          {Array.from({ length: 28 }).map((_, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      </div>
    </footer>
  );
}

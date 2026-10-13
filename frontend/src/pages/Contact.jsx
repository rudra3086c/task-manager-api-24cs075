export default function Contact() {
  return (
    <section className="panel route-page">
      <p className="eyebrow">CONTACT</p>
      <h2>Need help with your workflow?</h2>
      <p className="subtitle">
        Reach out to your team or course instructor for support. The Contact
        route is also downloaded only when it is visited.
      </p>
      <div className="route-highlight">
        <strong>Lazy-loaded page</strong>
        <span>Contact is not part of the initial JavaScript bundle.</span>
      </div>
    </section>
  );
}

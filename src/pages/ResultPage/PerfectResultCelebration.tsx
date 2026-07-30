export function PerfectResultCelebration() {
  return (
    <section className="perfect-result-celebration" role="status">
      <span className="perfect-result-celebration__message">ぜんもんせいかい！</span>
      <span
        className="perfect-result-celebration__stars"
        data-testid="perfect-result-stars"
        aria-hidden="true"
      >
        ★ ★ ★
      </span>
      <span
        className="perfect-result-celebration__confetti"
        data-testid="perfect-result-confetti"
        aria-hidden="true"
      >
        ✦ ✧ ✦ ✧ ✦
      </span>
    </section>
  )
}

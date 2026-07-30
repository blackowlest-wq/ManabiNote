export type QuizProgressProps = {
  current: number
  total: number
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  return <p aria-label="学習の進み具合">{current} / {total}</p>
}

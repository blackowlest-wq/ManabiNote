export type IdentifiedQuestion = { id: string };

export function selectUniqueQuestions<T extends IdentifiedQuestion>(
  questions: readonly T[],
  count: number,
  random: () => number = Math.random,
): T[] {
  if (count <= 0) {
    throw new Error('選出する問題数は1問以上で指定してください');
  }

  const uniqueQuestions = Array.from(
    new Map(questions.map((question) => [question.id, question])).values(),
  );

  if (uniqueQuestions.length < count) {
    throw new Error(`${count}問を選出するには問題が不足しています`);
  }

  const shuffled = [...uniqueQuestions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}

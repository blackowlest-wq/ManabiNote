export const STROKE_ROWS = [
  { id: 'a', label: 'あ行', kana: ['あ', 'い', 'う', 'え', 'お'] },
  { id: 'ka', label: 'か行', kana: ['か', 'き', 'く', 'け', 'こ'] },
  { id: 'sa', label: 'さ行', kana: ['さ', 'し', 'す', 'せ', 'そ'] },
  { id: 'ta', label: 'た行', kana: ['た', 'ち', 'つ', 'て', 'と'] },
  { id: 'na', label: 'な行', kana: ['な', 'に', 'ぬ', 'ね', 'の'] },
  { id: 'ha', label: 'は行', kana: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
  { id: 'ma', label: 'ま行', kana: ['ま', 'み', 'む', 'め', 'も'] },
  { id: 'ya', label: 'や行', kana: ['や', 'ゆ', 'よ'] },
  { id: 'ra', label: 'ら行', kana: ['ら', 'り', 'る', 'れ', 'ろ'] },
  { id: 'wa', label: 'わ行', kana: ['わ', 'を'] },
  { id: 'n', label: 'ん', kana: ['ん'] },
] as const

export type StrokeRow = (typeof STROKE_ROWS)[number]
export type StrokeRowId = StrokeRow['id']
export type StrokeKana = StrokeRow['kana'][number]

export const STROKE_KANA = STROKE_ROWS.flatMap((row) => row.kana) as readonly StrokeKana[]

export const getStrokeRow = (rowId: StrokeRowId): StrokeRow => {
  const row = STROKE_ROWS.find((candidate) => candidate.id === rowId)
  if (!row) {
    throw new Error(`Unknown stroke row: ${rowId}`)
  }
  return row
}

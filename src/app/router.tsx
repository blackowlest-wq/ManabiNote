import { Routes, Route } from 'react-router-dom'
import { HistoryPage } from '../pages/HistoryPage/HistoryPage'
import { AudioKanaPage } from '../pages/AudioKanaPage/AudioKanaPage'
import { AudioKanaResultPage } from '../pages/AudioKanaResultPage/AudioKanaResultPage'
import { MemoryPage } from '../pages/MemoryPage/MemoryPage'
import { MemoryResultPage } from '../pages/MemoryResultPage/MemoryResultPage'
import { SmallKanaPage } from '../pages/SmallKanaPage/SmallKanaPage'
import { SmallKanaResultPage } from '../pages/SmallKanaResultPage/SmallKanaResultPage'
import { ShiritoriPage } from '../pages/ShiritoriPage/ShiritoriPage'
import { ShiritoriResultPage } from '../pages/ShiritoriResultPage/ShiritoriResultPage'
import { CountingPage } from '../pages/CountingPage/CountingPage'
import { CountingResultPage } from '../pages/CountingResultPage/CountingResultPage'
import { ShapeColorPage } from '../pages/ShapeColorPage/ShapeColorPage'
import { ShapeColorResultPage } from '../pages/ShapeColorResultPage/ShapeColorResultPage'
import { KanaGroupPage } from '../pages/KanaGroupPage/KanaGroupPage'
import { KanaGroupResultPage } from '../pages/KanaGroupResultPage/KanaGroupResultPage'
import { DakutenPage } from '../pages/DakutenPage/DakutenPage'
import { DakutenResultPage } from '../pages/DakutenResultPage/DakutenResultPage'
import { KanaPairPage } from '../pages/KanaPairPage/KanaPairPage'
import { KanaPairResultPage } from '../pages/KanaPairResultPage/KanaPairResultPage'
import { MissingCharacterPage } from '../pages/MissingCharacterPage/MissingCharacterPage'
import { MissingCharacterResultPage } from '../pages/MissingCharacterResultPage/MissingCharacterResultPage'
import { HomePage } from '../pages/HomePage/HomePage'
import { QuizPage } from '../pages/QuizPage/QuizPage'
import { ResultPage } from '../pages/ResultPage/ResultPage'
import { StrokeOrderPage } from '../pages/StrokeOrderPage/StrokeOrderPage'
import { StrokeResultPage } from '../pages/StrokeResultPage/StrokeResultPage'
import { WordBuilderPage } from '../pages/WordBuilderPage/WordBuilderPage'
import { WordBuilderResultPage } from '../pages/WordBuilderResultPage/WordBuilderResultPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/stroke-order" element={<StrokeOrderPage />} />
      <Route path="/stroke-order/result" element={<StrokeResultPage />} />
      <Route path="/word-builder" element={<WordBuilderPage />} />
      <Route path="/word-builder/result" element={<WordBuilderResultPage />} />
      <Route path="/missing-character" element={<MissingCharacterPage />} />
      <Route path="/missing-character/result" element={<MissingCharacterResultPage />} />
      <Route path="/kana-pair" element={<KanaPairPage />} />
      <Route path="/kana-pair/result" element={<KanaPairResultPage />} />
      <Route path="/dakuten" element={<DakutenPage />} />
      <Route path="/dakuten/result" element={<DakutenResultPage />} />
      <Route path="/kana-group" element={<KanaGroupPage />} />
      <Route path="/kana-group/result" element={<KanaGroupResultPage />} />
      <Route path="/audio-kana" element={<AudioKanaPage />} />
      <Route path="/audio-kana/result" element={<AudioKanaResultPage />} />
      <Route path="/memory" element={<MemoryPage />} />
      <Route path="/memory/result" element={<MemoryResultPage />} />
      <Route path="/small-kana" element={<SmallKanaPage />} />
      <Route path="/small-kana/result" element={<SmallKanaResultPage />} />
      <Route path="/shiritori" element={<ShiritoriPage />} />
      <Route path="/shiritori/result" element={<ShiritoriResultPage />} />
      <Route path="/counting" element={<CountingPage />} />
      <Route path="/counting/result" element={<CountingResultPage />} />
      <Route path="/shape-color" element={<ShapeColorPage />} />
      <Route path="/shape-color/result" element={<ShapeColorResultPage />} />
    </Routes>
  )
}

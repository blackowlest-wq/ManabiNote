import { Routes, Route } from 'react-router-dom'
import { HistoryPage } from '../pages/HistoryPage/HistoryPage'
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
    </Routes>
  )
}

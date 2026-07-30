import { Routes, Route } from 'react-router-dom'
import { HistoryPage } from '../pages/HistoryPage/HistoryPage'
import { HomePage } from '../pages/HomePage/HomePage'
import { QuizPage } from '../pages/QuizPage/QuizPage'
import { ResultPage } from '../pages/ResultPage/ResultPage'
import { StrokeOrderPage } from '../pages/StrokeOrderPage/StrokeOrderPage'
import { StrokeResultPage } from '../pages/StrokeResultPage/StrokeResultPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/stroke-order" element={<StrokeOrderPage />} />
      <Route path="/stroke-order/result" element={<StrokeResultPage />} />
    </Routes>
  )
}

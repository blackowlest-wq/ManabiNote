import { Routes, Route } from 'react-router-dom'
import { HistoryPage } from '../pages/HistoryPage/HistoryPage'
import { HomePage } from '../pages/HomePage/HomePage'
import { QuizPage } from '../pages/QuizPage/QuizPage'
import { ResultPage } from '../pages/ResultPage/ResultPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  )
}

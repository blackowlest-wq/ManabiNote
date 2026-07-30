import { HashRouter } from 'react-router-dom'
import { QuizSessionProvider } from '../features/quiz/QuizSessionProvider'
import { StrokePracticeProvider } from '../features/stroke-order/StrokePracticeProvider'
import '../styles/global.css'
import { AppRouter } from './router'

export function App() {
  return (
    <HashRouter>
      <QuizSessionProvider>
        <StrokePracticeProvider>
          <AppRouter />
        </StrokePracticeProvider>
      </QuizSessionProvider>
    </HashRouter>
  )
}

export default App

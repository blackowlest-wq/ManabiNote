import { HashRouter } from 'react-router-dom'
import { QuizSessionProvider } from '../features/quiz/QuizSessionProvider'
import { StrokePracticeProvider } from '../features/stroke-order/StrokePracticeProvider'
import { WordBuilderSessionProvider } from '../features/word-builder/WordBuilderSessionProvider'
import '../styles/global.css'
import { AppRouter } from './router'

export function App() {
  return (
    <HashRouter>
      <QuizSessionProvider>
        <StrokePracticeProvider>
          <WordBuilderSessionProvider>
            <AppRouter />
          </WordBuilderSessionProvider>
        </StrokePracticeProvider>
      </QuizSessionProvider>
    </HashRouter>
  )
}

export default App

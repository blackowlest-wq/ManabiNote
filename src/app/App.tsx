import { HashRouter } from 'react-router-dom'
import { QuizSessionProvider } from '../features/quiz/QuizSessionProvider'
import '../styles/global.css'
import { AppRouter } from './router'

export function App() {
  return (
    <HashRouter>
      <QuizSessionProvider>
        <AppRouter />
      </QuizSessionProvider>
    </HashRouter>
  )
}

export default App

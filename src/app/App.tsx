import { HashRouter } from 'react-router-dom'
import { DakutenSessionProvider } from '../features/dakuten/DakutenSessionProvider'
import { AudioKanaSessionProvider } from '../features/audio-kana/AudioKanaSessionProvider'
import { KanaGroupSessionProvider } from '../features/kana-group/KanaGroupSessionProvider'
import { KanaPairSessionProvider } from '../features/kana-pair/KanaPairSessionProvider'
import { MemorySessionProvider } from '../features/memory/MemorySessionProvider'
import { SmallKanaSessionProvider } from '../features/small-kana/SmallKanaSessionProvider'
import { ShiritoriSessionProvider } from '../features/shiritori/ShiritoriSessionProvider'
import { CountingSessionProvider } from '../features/counting/CountingSessionProvider'
import { ShapeColorSessionProvider } from '../features/shape-color/ShapeColorSessionProvider'
import { MissingCharacterSessionProvider } from '../features/missing-character/MissingCharacterSessionProvider'
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
            <MissingCharacterSessionProvider>
              <KanaPairSessionProvider>
                <DakutenSessionProvider>
                  <KanaGroupSessionProvider>
                    <AudioKanaSessionProvider>
                      <MemorySessionProvider>
                        <SmallKanaSessionProvider>
                          <ShiritoriSessionProvider>
                            <CountingSessionProvider>
                              <ShapeColorSessionProvider>
                                <AppRouter />
                              </ShapeColorSessionProvider>
                            </CountingSessionProvider>
                          </ShiritoriSessionProvider>
                        </SmallKanaSessionProvider>
                      </MemorySessionProvider>
                    </AudioKanaSessionProvider>
                  </KanaGroupSessionProvider>
                </DakutenSessionProvider>
              </KanaPairSessionProvider>
            </MissingCharacterSessionProvider>
          </WordBuilderSessionProvider>
        </StrokePracticeProvider>
      </QuizSessionProvider>
    </HashRouter>
  )
}

export default App

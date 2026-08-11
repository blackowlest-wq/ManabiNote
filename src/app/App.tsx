import { HashRouter } from 'react-router-dom'
import { DakutenSessionProvider } from '../features/dakuten/DakutenSessionProvider'
import { AudioKanaSessionProvider } from '../features/audio-kana/AudioKanaSessionProvider'
import { ArithmeticSessionProvider } from '../features/arithmetic/ArithmeticSessionProvider'
import { ClockSessionProvider } from '../features/clock/ClockSessionProvider'
import { KanaGroupSessionProvider } from '../features/kana-group/KanaGroupSessionProvider'
import { KanaPairSessionProvider } from '../features/kana-pair/KanaPairSessionProvider'
import { MemorySessionProvider } from '../features/memory/MemorySessionProvider'
import { KanjiReadingSessionProvider } from '../features/kanji-reading/KanjiReadingSessionProvider'
import { KanjiChoiceSessionProvider } from '../features/kanji-choice/KanjiChoiceSessionProvider'
import { NumberCompareSessionProvider } from '../features/number-compare/NumberCompareSessionProvider'
import { NumberOrderSessionProvider } from '../features/number-order/NumberOrderSessionProvider'
import { ParticleChoiceSessionProvider } from '../features/particle-choice/ParticleChoiceSessionProvider'
import { ReadingComprehensionSessionProvider } from '../features/reading-comprehension/ReadingComprehensionSessionProvider'
import { SmallKanaSessionProvider } from '../features/small-kana/SmallKanaSessionProvider'
import { SentenceOrderSessionProvider } from '../features/sentence-order/SentenceOrderSessionProvider'
import { ShiritoriSessionProvider } from '../features/shiritori/ShiritoriSessionProvider'
import { CountingSessionProvider } from '../features/counting/CountingSessionProvider'
import { ShapeColorSessionProvider } from '../features/shape-color/ShapeColorSessionProvider'
import { ShapePatternSessionProvider } from '../features/shape-pattern/ShapePatternSessionProvider'
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
                      <ArithmeticSessionProvider>
                        <ClockSessionProvider>
                          <MemorySessionProvider>
                          <KanjiChoiceSessionProvider>
                            <KanjiReadingSessionProvider>
                              <NumberCompareSessionProvider>
                                <NumberOrderSessionProvider>
                                  <ParticleChoiceSessionProvider>
                                    <ReadingComprehensionSessionProvider>
                                      <SmallKanaSessionProvider>
                                        <SentenceOrderSessionProvider>
                                          <ShiritoriSessionProvider>
                                            <CountingSessionProvider>
                                              <ShapeColorSessionProvider>
                                                <ShapePatternSessionProvider>
                                                  <AppRouter />
                                                </ShapePatternSessionProvider>
                                              </ShapeColorSessionProvider>
                                            </CountingSessionProvider>
                                          </ShiritoriSessionProvider>
                                        </SentenceOrderSessionProvider>
                                      </SmallKanaSessionProvider>
                                    </ReadingComprehensionSessionProvider>
                                  </ParticleChoiceSessionProvider>
                                </NumberOrderSessionProvider>
                              </NumberCompareSessionProvider>
                            </KanjiReadingSessionProvider>
                          </KanjiChoiceSessionProvider>
                          </MemorySessionProvider>
                        </ClockSessionProvider>
                      </ArithmeticSessionProvider>
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

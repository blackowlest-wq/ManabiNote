import { Routes, Route } from 'react-router-dom'
import { GAME_CATEGORIES } from './gameCategories'
import { ScrollToTop } from './ScrollToTop'
import { HistoryPage } from '../pages/HistoryPage/HistoryPage'
import { AudioKanaPage } from '../pages/AudioKanaPage/AudioKanaPage'
import { AudioKanaResultPage } from '../pages/AudioKanaResultPage/AudioKanaResultPage'
import { MemoryPage } from '../pages/MemoryPage/MemoryPage'
import { MemoryResultPage } from '../pages/MemoryResultPage/MemoryResultPage'
import { SmallKanaPage } from '../pages/SmallKanaPage/SmallKanaPage'
import { SmallKanaResultPage } from '../pages/SmallKanaResultPage/SmallKanaResultPage'
import { SentenceOrderPage } from '../pages/SentenceOrderPage/SentenceOrderPage'
import { SentenceOrderResultPage } from '../pages/SentenceOrderResultPage/SentenceOrderResultPage'
import { ShiritoriPage } from '../pages/ShiritoriPage/ShiritoriPage'
import { ShiritoriResultPage } from '../pages/ShiritoriResultPage/ShiritoriResultPage'
import { CountingPage } from '../pages/CountingPage/CountingPage'
import { CountingResultPage } from '../pages/CountingResultPage/CountingResultPage'
import { ShapeColorPage } from '../pages/ShapeColorPage/ShapeColorPage'
import { ShapeColorResultPage } from '../pages/ShapeColorResultPage/ShapeColorResultPage'
import { CategoryPage } from '../pages/CategoryPage/CategoryPage'
import { KanaGroupPage } from '../pages/KanaGroupPage/KanaGroupPage'
import { KanaGroupResultPage } from '../pages/KanaGroupResultPage/KanaGroupResultPage'
import { DakutenPage } from '../pages/DakutenPage/DakutenPage'
import { DakutenResultPage } from '../pages/DakutenResultPage/DakutenResultPage'
import { KanaPairPage } from '../pages/KanaPairPage/KanaPairPage'
import { KanaPairResultPage } from '../pages/KanaPairResultPage/KanaPairResultPage'
import { MissingCharacterPage } from '../pages/MissingCharacterPage/MissingCharacterPage'
import { MissingCharacterResultPage } from '../pages/MissingCharacterResultPage/MissingCharacterResultPage'
import { NumberComparePage } from '../pages/NumberComparePage/NumberComparePage'
import { NumberCompareResultPage } from '../pages/NumberCompareResultPage/NumberCompareResultPage'
import { NumberOrderPage } from '../pages/NumberOrderPage/NumberOrderPage'
import { NumberOrderResultPage } from '../pages/NumberOrderResultPage/NumberOrderResultPage'
import { KanjiReadingPage } from '../pages/KanjiReadingPage/KanjiReadingPage'
import { KanjiReadingResultPage } from '../pages/KanjiReadingResultPage/KanjiReadingResultPage'
import { ArithmeticPage } from '../pages/ArithmeticPage/ArithmeticPage'
import { ArithmeticResultPage } from '../pages/ArithmeticResultPage/ArithmeticResultPage'
import { ClockPage } from '../pages/ClockPage/ClockPage'
import { ClockResultPage } from '../pages/ClockResultPage/ClockResultPage'
import { KanjiChoicePage } from '../pages/KanjiChoicePage/KanjiChoicePage'
import { KanjiChoiceResultPage } from '../pages/KanjiChoiceResultPage/KanjiChoiceResultPage'
import { ParticleChoicePage } from '../pages/ParticleChoicePage/ParticleChoicePage'
import { ParticleChoiceResultPage } from '../pages/ParticleChoiceResultPage/ParticleChoiceResultPage'
import { ReadingComprehensionPage } from '../pages/ReadingComprehensionPage/ReadingComprehensionPage'
import { ReadingComprehensionResultPage } from '../pages/ReadingComprehensionResultPage/ReadingComprehensionResultPage'
import { ShapePatternPage } from '../pages/ShapePatternPage/ShapePatternPage'
import { ShapePatternResultPage } from '../pages/ShapePatternResultPage/ShapePatternResultPage'
import { RescueMazePage } from '../pages/RescueMazePage/RescueMazePage'
import { CookingGamePage } from '../pages/CookingGamePage/CookingGamePage'
import { MonsterMergePage } from '../pages/MonsterMergePage/MonsterMergePage'
import { PipePathPage } from '../pages/PipePathPage/PipePathPage'
import { ShopGamePage } from '../pages/ShopGamePage/ShopGamePage'
import { TreasureHuntPage } from '../pages/TreasureHuntPage/TreasureHuntPage'
import { PackingPuzzlePage } from '../pages/PackingPuzzlePage/PackingPuzzlePage'
import { RobotRoutePage } from '../pages/RobotRoutePage/RobotRoutePage'
import { ShadowHuntPage } from '../pages/ShadowHuntPage/ShadowHuntPage'
import { ForestGuardPage } from '../pages/ForestGuardPage/ForestGuardPage'
import { CopyBeatPage } from '../pages/CopyBeatPage/CopyBeatPage'
import { SortingFactoryPage } from '../pages/SortingFactoryPage/SortingFactoryPage'
import { OppositeGhostPage } from '../pages/OppositeGhostPage/OppositeGhostPage'
import { BalanceBoatPage } from '../pages/BalanceBoatPage/BalanceBoatPage'
import { BridgeBuilderPage } from '../pages/BridgeBuilderPage/BridgeBuilderPage'
import { RollingLabyrinthPage } from '../pages/RollingLabyrinthPage/RollingLabyrinthPage'
import { FireflyLightsPage } from '../pages/FireflyLightsPage/FireflyLightsPage'
import { SheepMovePage } from '../pages/SheepMovePage/SheepMovePage'
import { BalloonFlightPage } from '../pages/BalloonFlightPage/BalloonFlightPage'
import { FrogJumpPage } from '../pages/FrogJumpPage/FrogJumpPage'
import { LogSlidePage } from '../pages/LogSlidePage/LogSlidePage'
import { GhostHidePage } from '../pages/GhostHidePage/GhostHidePage'
import { HelperTeamPage } from '../pages/HelperTeamPage/HelperTeamPage'
import { BeeRoutePage } from '../pages/BeeRoutePage/BeeRoutePage'
import { BubbleChainPage } from '../pages/BubbleChainPage/BubbleChainPage'
import { AnimalTowerPage } from '../pages/AnimalTowerPage/AnimalTowerPage'
import { PenguinIcePage } from '../pages/PenguinIcePage/PenguinIcePage'
import { HomePage } from '../pages/HomePage/HomePage'
import { QuizPage } from '../pages/QuizPage/QuizPage'
import { ResultPage } from '../pages/ResultPage/ResultPage'
import { StrokeOrderPage } from '../pages/StrokeOrderPage/StrokeOrderPage'
import { StrokeResultPage } from '../pages/StrokeResultPage/StrokeResultPage'
import { WordBuilderPage } from '../pages/WordBuilderPage/WordBuilderPage'
import { WordBuilderResultPage } from '../pages/WordBuilderResultPage/WordBuilderResultPage'

export function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path={GAME_CATEGORIES.words.to} element={<CategoryPage {...GAME_CATEGORIES.words} />} />
        <Route path={GAME_CATEGORIES.numbers.to} element={<CategoryPage {...GAME_CATEGORIES.numbers} />} />
        <Route path={GAME_CATEGORIES.shapes.to} element={<CategoryPage {...GAME_CATEGORIES.shapes} />} />
        <Route path={GAME_CATEGORIES.kanji.to} element={<CategoryPage {...GAME_CATEGORIES.kanji} />} />
        <Route path={GAME_CATEGORIES.sentences.to} element={<CategoryPage {...GAME_CATEGORIES.sentences} />} />
        <Route path={GAME_CATEGORIES.play.to} element={<CategoryPage {...GAME_CATEGORIES.play} />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/stroke-order" element={<StrokeOrderPage />} />
        <Route path="/stroke-order/result" element={<StrokeResultPage />} />
        <Route path="/word-builder" element={<WordBuilderPage />} />
        <Route path="/word-builder/result" element={<WordBuilderResultPage />} />
        <Route path="/missing-character" element={<MissingCharacterPage />} />
        <Route path="/missing-character/result" element={<MissingCharacterResultPage />} />
        <Route path="/number-compare" element={<NumberComparePage />} />
        <Route path="/number-compare/result" element={<NumberCompareResultPage />} />
        <Route path="/number-order" element={<NumberOrderPage />} />
        <Route path="/number-order/result" element={<NumberOrderResultPage />} />
        <Route path="/kanji-reading" element={<KanjiReadingPage />} />
        <Route path="/kanji-reading/result" element={<KanjiReadingResultPage />} />
        <Route path="/kanji-choice" element={<KanjiChoicePage />} />
        <Route path="/kanji-choice/result" element={<KanjiChoiceResultPage />} />
        <Route path="/addition" element={<ArithmeticPage kind="addition" />} />
        <Route path="/addition/result" element={<ArithmeticResultPage kind="addition" />} />
        <Route path="/subtraction" element={<ArithmeticPage kind="subtraction" />} />
        <Route path="/subtraction/result" element={<ArithmeticResultPage kind="subtraction" />} />
        <Route path="/clock" element={<ClockPage />} />
        <Route path="/clock/result" element={<ClockResultPage />} />
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
        <Route path="/sentence-order" element={<SentenceOrderPage />} />
        <Route path="/sentence-order/result" element={<SentenceOrderResultPage />} />
        <Route path="/particle-choice" element={<ParticleChoicePage />} />
        <Route path="/particle-choice/result" element={<ParticleChoiceResultPage />} />
        <Route path="/reading-comprehension" element={<ReadingComprehensionPage />} />
        <Route path="/reading-comprehension/result" element={<ReadingComprehensionResultPage />} />
        <Route path="/shiritori" element={<ShiritoriPage />} />
        <Route path="/shiritori/result" element={<ShiritoriResultPage />} />
        <Route path="/counting" element={<CountingPage />} />
        <Route path="/counting/result" element={<CountingResultPage />} />
        <Route path="/shape-color" element={<ShapeColorPage />} />
        <Route path="/shape-color/result" element={<ShapeColorResultPage />} />
        <Route path="/shape-pattern" element={<ShapePatternPage />} />
        <Route path="/shape-pattern/result" element={<ShapePatternResultPage />} />
        <Route path="/rescue-maze" element={<RescueMazePage />} />
        <Route path="/cooking" element={<CookingGamePage />} />
        <Route path="/monster-merge" element={<MonsterMergePage />} />
        <Route path="/pipe-path" element={<PipePathPage />} />
        <Route path="/shop-game" element={<ShopGamePage />} />
        <Route path="/treasure-hunt" element={<TreasureHuntPage />} />
        <Route path="/packing-puzzle" element={<PackingPuzzlePage />} />
        <Route path="/robot-route" element={<RobotRoutePage />} />
        <Route path="/shadow-hunt" element={<ShadowHuntPage />} />
        <Route path="/forest-guard" element={<ForestGuardPage />} />
        <Route path="/copy-beat" element={<CopyBeatPage />} />
        <Route path="/sorting-factory" element={<SortingFactoryPage />} />
        <Route path="/opposite-ghost" element={<OppositeGhostPage />} />
        <Route path="/balance-boat" element={<BalanceBoatPage />} />
        <Route path="/bridge-builder" element={<BridgeBuilderPage />} />
        <Route path="/rolling-labyrinth" element={<RollingLabyrinthPage />} />
        <Route path="/firefly-lights" element={<FireflyLightsPage />} />
        <Route path="/sheep-move" element={<SheepMovePage />} />
        <Route path="/balloon-flight" element={<BalloonFlightPage />} />
        <Route path="/frog-jump" element={<FrogJumpPage />} />
        <Route path="/log-slide" element={<LogSlidePage />} />
        <Route path="/ghost-hide" element={<GhostHidePage />} />
        <Route path="/helper-team" element={<HelperTeamPage />} />
        <Route path="/bee-route" element={<BeeRoutePage />} />
        <Route path="/bubble-chain" element={<BubbleChainPage />} />
        <Route path="/animal-tower" element={<AnimalTowerPage />} />
        <Route path="/penguin-ice" element={<PenguinIcePage />} />
      </Routes>
    </>
  )
}

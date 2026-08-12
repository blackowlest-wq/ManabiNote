import { readFileSync } from 'node:fs'

const requiredVersion = readFileSync(new URL('../.node-version', import.meta.url), 'utf8').trim()
const actualVersion = process.versions.node

if (actualVersion !== requiredVersion) {
  console.error(
    `ManabiNoteのproduction buildにはNode.js ${requiredVersion}が必要です（現在: ${actualVersion}）。` +
      ' .node-versionまたは.nvmrcを読み込んでから、もう一度実行してください。',
  )
  process.exit(1)
}

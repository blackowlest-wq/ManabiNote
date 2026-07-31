import { writeFile } from 'node:fs/promises'

const sourceBaseUrl = 'https://raw.githubusercontent.com/parsimonhi/animCJK/master/svgsJaKana'
const outputPath = new URL('../src/features/question-types/kana-to-stroke/data/strokes.json', import.meta.url)

const kana = [
  ['あ', 12354], ['い', 12356], ['う', 12358], ['え', 12360], ['お', 12362],
  ['か', 12363], ['き', 12365], ['く', 12367], ['け', 12369], ['こ', 12371],
  ['さ', 12373], ['し', 12375], ['す', 12377], ['せ', 12379], ['そ', 12381],
  ['た', 12383], ['ち', 12385], ['つ', 12388], ['て', 12390], ['と', 12392],
  ['な', 12394], ['に', 12395], ['ぬ', 12396], ['ね', 12397], ['の', 12398],
  ['は', 12399], ['ひ', 12402], ['ふ', 12405], ['へ', 12408], ['ほ', 12411],
  ['ま', 12414], ['み', 12415], ['む', 12416], ['め', 12417], ['も', 12418],
  ['や', 12420], ['ゆ', 12422], ['よ', 12424],
  ['ら', 12425], ['り', 12426], ['る', 12427], ['れ', 12428], ['ろ', 12429],
  ['わ', 12431], ['を', 12434], ['ん', 12435],
]

const parseAttributes = (rawAttributes) => {
  const attributes = {}
  for (const match of rawAttributes.matchAll(/([\w-]+)="([^"]*)"/g)) {
    attributes[match[1]] = match[2]
  }
  return attributes
}

const parseMedianPaths = (svg) => {
  const pathsByOrder = new Map()
  for (const match of svg.matchAll(/<path\b([^>]*)>/g)) {
    const attributes = parseAttributes(match[1])
    const orderMatch = attributes.style?.match(/--d:(\d+)s/)
    if (!orderMatch || !attributes.d) {
      continue
    }

    const order = Number(orderMatch[1])
    if (!pathsByOrder.has(order)) {
      pathsByOrder.set(order, attributes.d)
    }
  }

  return [...pathsByOrder.entries()].sort(([left], [right]) => left - right)
}

const parsePoints = (path) => {
  const tokens = [...path.matchAll(/[A-Za-z]|-?\d+(?:\.\d+)?/g)].map((match) => match[0])
  const commandArguments = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7 }
  const points = []
  let command = ''
  let current = { x: 0, y: 0 }
  let index = 0

  while (index < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[index])) {
      command = tokens[index]
      index += 1
      if (command.toUpperCase() === 'Z') {
        continue
      }
    }

    const absolute = command === command.toUpperCase()
    const commandType = command.toUpperCase()
    const argumentCount = commandArguments[commandType]
    if (!argumentCount || index + argumentCount > tokens.length) {
      throw new Error(`Unsupported median path: ${path}`)
    }

    const values = tokens.slice(index, index + argumentCount).map(Number)
    index += argumentCount
    const makePoint = (x, y) => ({ x: absolute ? x : current.x + x, y: absolute ? y : current.y + y })

    if (commandType === 'M' || commandType === 'L' || commandType === 'T') {
      current = makePoint(values[0], values[1])
      points.push(current)
      if (commandType === 'M') {
        command = absolute ? 'L' : 'l'
      }
    } else if (commandType === 'H') {
      current = makePoint(values[0], 0)
      points.push(current)
    } else if (commandType === 'V') {
      current = makePoint(0, values[0])
      points.push(current)
    } else {
      current = makePoint(values[values.length - 2], values[values.length - 1])
      points.push(current)
    }
  }

  if (points.length < 2) {
    throw new Error(`Median path has too few points: ${path}`)
  }

  return points
}

const scalePoint = ({ x, y }) => ({
  x: Number((x * 200 / 1024).toFixed(1)),
  y: Number((y * 200 / 1024).toFixed(1)),
})

const convertQuestion = async ([character, codePoint]) => {
  const response = await fetch(`${sourceBaseUrl}/${codePoint}.svg`)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${character} (${codePoint}): ${response.status}`)
  }

  const svg = await response.text()
  const strokes = parseMedianPaths(svg).map(([order, medianPath]) => {
    const checkpoints = parsePoints(medianPath).map(scalePoint)
    const guidePath = checkpoints.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
    return { order, guidePath, checkpoints }
  })

  if (strokes.length === 0) {
    throw new Error(`No median paths found for ${character} (${codePoint})`)
  }

  return {
    type: 'kana-to-stroke',
    id: `hiragana-${character}`,
    kana: character,
    viewBox: '0 0 200 200',
    strokes,
  }
}

const questions = []
for (const item of kana) {
  questions.push(await convertQuestion(item))
}

await writeFile(outputPath, `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
console.log(`Generated ${questions.length} kana questions at ${outputPath.pathname}`)

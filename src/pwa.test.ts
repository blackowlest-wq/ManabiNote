import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const distDirectory = resolve(process.cwd(), 'dist')
const packagePath = resolve(process.cwd(), 'package.json')
const nodeVersionPath = resolve(process.cwd(), '.node-version')
const nvmVersionPath = resolve(process.cwd(), '.nvmrc')
const manifestPath = resolve(distDirectory, 'manifest.webmanifest')
const serviceWorkerPath = resolve(distDirectory, 'sw.js')
const questionImageDirectory = resolve(process.cwd(), 'public/images/kana-to-picture')
const atlasManifestPath = resolve(
  process.cwd(),
  'src/features/question-types/kana-to-picture/data/image-atlas-manifest.json',
)

describe('production build runtime', () => {
  it('pins the Node.js version used by local tools and Cloudflare Pages', () => {
    const nodeVersion = readFileSync(nodeVersionPath, 'utf8').trim()
    const nvmVersion = readFileSync(nvmVersionPath, 'utf8').trim()
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as {
      engines?: { node?: string }
    }

    expect(nodeVersion).toBe('22.23.2')
    expect(nvmVersion).toBe(nodeVersion)
    expect(packageJson.engines?.node).toBe('22.x')
    expect(process.versions.node).toBe(nodeVersion)
  })
})

describe('production PWA output', () => {
  it('contains the offline manifest and local image precache', () => {
    expect(existsSync(manifestPath)).toBe(true)
    expect(existsSync(serviceWorkerPath)).toBe(true)

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      name: string
      short_name: string
      description: string
      start_url: string
      display: string
      theme_color: string
      background_color: string
      icons: Array<{ src: string; sizes: string; type: string }>
    }
    const atlasManifest = JSON.parse(readFileSync(atlasManifestPath, 'utf8')) as {
      atlases: Array<{ id: string; src: string; format: string; symbols: string[] }>
    }
    const serviceWorker = readFileSync(serviceWorkerPath, 'utf8')
    const questionImages = readdirSync(questionImageDirectory).filter((file) => file.endsWith('.svg'))

    expect(manifest).toMatchObject({
      name: 'ManabiNote',
      short_name: 'ManabiNote',
      description: expect.any(String),
      start_url: '/',
      display: 'standalone',
      theme_color: expect.any(String),
      background_color: expect.any(String),
    })
    expect(manifest.icons).toEqual([
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ])
    expect(questionImages).toHaveLength(15)
    for (const image of questionImages) {
      expect(serviceWorker).toContain(`images/kana-to-picture/${image}`)
    }
    expect(atlasManifest.atlases).toHaveLength(4)
    for (const atlas of atlasManifest.atlases) {
      expect(atlas.symbols.length).toBeGreaterThan(0)
      expect(atlas.format).toBe('raster-grid')
      expect(atlas.src).toMatch(/-v2\.webp$/)
      expect(serviceWorker).toContain(atlas.src.replace(/^\//, ''))
    }
    const animalAtlas = atlasManifest.atlases.find((atlas) => atlas.id === 'animals-01')
    expect(animalAtlas?.src).toBe('/images/kana-to-picture/atlases/animals-01-v2.webp')
    expect(
      animalAtlas && existsSync(resolve(distDirectory, animalAtlas.src.replace(/^\//, ''))),
    ).toBe(true)
    expect(serviceWorker).not.toMatch(/https?:\/\//)
  })
})

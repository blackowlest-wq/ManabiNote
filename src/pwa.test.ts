import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const distDirectory = resolve(process.cwd(), 'dist')
const manifestPath = resolve(distDirectory, 'manifest.webmanifest')
const serviceWorkerPath = resolve(distDirectory, 'sw.js')
const questionImageDirectory = resolve(process.cwd(), 'public/images/kana-to-picture')

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
    expect(serviceWorker).not.toMatch(/https?:\/\//)
  })
})

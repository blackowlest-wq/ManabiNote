import { loadImageAtlasManifest, resolveImageAtlas, type PictureImageRef } from '../model/imageAtlas'

export type SpriteImageProps = {
  image: PictureImageRef
  alt: string
  width?: number
  height?: number
}

const atlasManifest = loadImageAtlasManifest()

export function SpriteImage({ image, alt, width = 160, height = 160 }: SpriteImageProps) {
  const atlas = resolveImageAtlas(image, atlasManifest)

  if (atlas.format === 'raster-grid') {
    const symbolIndex = atlas.symbols.indexOf(image.symbolId)
    const column = symbolIndex % atlas.columns
    const row = Math.floor(symbolIndex / atlas.columns)

    return (
      <div
        role="img"
        aria-label={alt}
        className="kana-picture-choice__image"
        style={{
          width,
          height,
          flex: '0 0 auto',
          backgroundImage: `url("${atlas.src}")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${atlas.columns * 100}% ${atlas.rows * 100}%`,
          backgroundPosition: `${(column / Math.max(atlas.columns - 1, 1)) * 100}% ${(row / Math.max(atlas.rows - 1, 1)) * 100}%`,
        }}
      />
    )
  }

  const href = `${atlas.src}#${image.symbolId}`

  return (
    <svg
      role="img"
      aria-label={alt}
      className="kana-picture-choice__image"
      viewBox="0 0 160 160"
      width={width}
      height={height}
    >
      <use href={href} />
    </svg>
  )
}

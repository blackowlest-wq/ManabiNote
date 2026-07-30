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
  const href = `${atlas.src}#${image.symbolId}`

  return (
    <svg
      role="img"
      aria-label={alt}
      viewBox="0 0 160 160"
      width={width}
      height={height}
    >
      <use href={href} />
    </svg>
  )
}

import type { PictureImageRef } from '../model/imageAtlas'
import { resolvePictureImageSrc } from '../model/imageAtlas'

export type SpriteImageProps = {
  image: PictureImageRef
  alt: string
  width?: number
  height?: number
}

export function SpriteImage({ image, alt, width = 160, height = 160 }: SpriteImageProps) {
  const src = resolvePictureImageSrc(image)

  return <img src={src} alt={alt} width={width} height={height} />
}

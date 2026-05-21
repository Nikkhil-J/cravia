type ImageContext = 'thumbnail' | 'card' | 'banner' | 'grid' | 'lightbox'

type PixelCrop = {
  x: number
  y: number
  width: number
  height: number
}

const WIDTHS: Record<ImageContext, number> = {
  thumbnail: 300,
  card: 400,
  banner: 800,
  grid: 1200,
  lightbox: 1600,
}

export function getOptimizedImageUrl(
  url: string | null | undefined,
  context: ImageContext,
): string | null {
  if (!url) return null
  if (!url.includes('res.cloudinary.com')) return url

  const width = WIDTHS[context]
  const transformation = `w_${width},f_auto,q_auto,c_limit`

  return url.replace('/upload/', `/upload/${transformation}/`)
}

export async function cropImageToFile(
  imageSrc: string,
  cropPixels: PixelCrop,
  fileName: string,
  outputWidth = 1200,
  outputHeight = 900,
): Promise<File> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to prepare image crop')
  }

  canvas.width = outputWidth
  canvas.height = outputHeight
  context.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    outputWidth,
    outputHeight,
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error('Unable to export image crop'))
        }
      },
      'image/webp',
      0.92,
    )
  })

  const normalizedName = fileName.replace(/\.[^.]+$/, '') || 'dish-photo'
  return new File([blob], `${normalizedName}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to load image for cropping'))
    image.src = src
  })
}

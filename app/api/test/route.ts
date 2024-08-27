import { BASE_URL, TILE_SIZE } from '@/app/constants'
import Jimp from 'jimp'

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url)

  const image = await generateImage({
    holes: [
      [1, 0],
      [0, 1],
      [1, 0],
      [0, 1],
      [0, 1],
    ],
    character: [2, 3],
  })

  return Response.json({ message: 'Hello, world!', image })
}

async function generateImage(config: { holes: [number, number][]; character: [number, number] }) {
  // example config: { holes: [[1,0], [0,1], [1,0], [0,1], [0,1]], character: [0, 5] }
  try {
    // Load both images
    const EMPTY_MAP = await Jimp.read(`${BASE_URL}/statics/map-empty.png`)
    const CHARACTER = await Jimp.read(`${BASE_URL}/statics/character.png`)
    const HOLE = await Jimp.read(`${BASE_URL}/statics/hole.png`)

    config.holes.forEach((row, index) => {
      row.forEach((hole, col) => {
        if (hole === 1) {
          EMPTY_MAP.composite(HOLE, TILE_SIZE * 3 + col * TILE_SIZE, TILE_SIZE * 2 + index * TILE_SIZE, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 1,
            opacityDest: 1,
          })
        }
      })
    })

    EMPTY_MAP.composite(CHARACTER, TILE_SIZE * 3 + 0 * TILE_SIZE, TILE_SIZE * 2 + 4 * TILE_SIZE - 32, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 1,
    })

    // Convert the resulting image to a buffer
    const buffer = await EMPTY_MAP.getBase64Async(Jimp.MIME_PNG)

    return buffer
  } catch (error) {
    console.error('Error combining images:', error)
    throw error
  }
}

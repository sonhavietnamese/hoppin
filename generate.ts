import Jimp from 'jimp'

const BASE_URL = '/Users/ha.nguyen/workspace/projects/hoppin/public'
const TILE_SIZE = 64

// step 1-1: [[0,0], [0,0], [0,0], [0, 0] [0,1]] // character [0, 5]
// step 1-2: [[0,0], [0,0], [0,0], [0, 0] [1,0]] // character [1, 5]
// step 2-1: [[0,0], [0,0], [0,0], [1, 0] [1,0]] // character [1, 4]
// step 2-2: [[0,0], [0,0], [0,0], [1, 0] [0,1]] // character [1, 4]
// step 2-3: [[0,0], [0,0], [0,0], [0, 1] [1,0]] // character [0, 4]
// step 2-4: [[0,0], [0,0], [0,0], [0, 1] [0,1]] // character [0, 4]
// step 3-1: [[0,0], [0,0], [1, 0], [1, 0] [1,0]] // character [1, 3]
// step 3-2: [[0,0], [0,0], [1, 0], [1, 0] [0,1]] // character [1, 3]
// step 3-3: [[0,0], [0,0], [1, 0], [0, 1] [1,0]] // character [1, 3]
// step 3-4: [[0,0], [0,0], [1, 0], [0, 1] [0,1]] // character [1, 3]
// step 3-5: [[0,0], [0,0], [0, 1], [1, 0] [1,0]] // character [0, 3]
// step 3-6: [[0,0], [0,0], [0, 1], [1, 0] [0,1]] // character [0, 3]
// step 3-7: [[0,0], [0,0], [0, 1], [0, 1] [1,0]] // character [0, 3]
// step 3-8: [[0,0], [0,0], [0, 1], [0, 1] [0,1]] // character [0, 3]
// step 4-1: [[0,0], [0,1], [1, 0], [1, 0] [1,0]] // character [0, 2]
// step 4-2: [[0,0], [0,1], [1, 0], [1, 0] [0,1]] // character [0, 2]
// step 4-3: [[0,0], [0,1], [1, 0], [0, 1] [1,0]] // character [0, 2]
// step 4-4: [[0,0], [0,1], [1, 0], [0, 1] [0,1]] // character [0, 2]
// step 4-5: [[0,0], [0,1], [0, 1], [1, 0] [1,0]] // character [0, 2]
// step 4-6: [[0,0], [0,1], [0, 1], [1, 0] [0,1]] // character [0, 2]
// step 4-7: [[0,0], [0,1], [0, 1], [0, 1] [1,0]] // character [0, 2]
// step 4-8: [[0,0], [1,0], [0, 1], [0, 1] [0,1]] // character [1, 2]
// step 4-9: [[0,0], [1,0], [1, 0], [1, 0] [1,0]] // character [1, 2]
// step 4-10: [[0,0], [1,0], [1, 0], [1, 0] [0,1]] // character [1, 2]
// step 4-11: [[0,0], [1,0], [1, 0], [0, 1] [1,0]] // character [1, 2]
// step 4-12: [[0,0], [1,0], [1, 0], [0, 1] [0,1]] // character [1, 2]
// step 4-13: [[0,0], [1,0], [0, 1], [1, 0] [1,0]] // character [1, 2]
// step 4-14: [[0,0], [1,0], [0, 1], [1, 0] [0,1]] // character [1, 2]
// step 4-15: [[0,0], [1,0], [0, 1], [0, 1] [1,0]] // character [1, 2]
// step 4-16: [[0,0], [1,0], [0, 1], [0, 1] [0,1]] // character [1, 2]
// step 5-1: [[0,1], [0,1], [1, 0], [1, 0] [1,0]] // character [0, 1]
// step 5-2: [[0,1], [0,1], [1, 0], [1, 0] [0,1]] // character [0, 1]
// step 5-3: [[0,1], [0,1], [1, 0], [0, 1] [1,0]] // character [0, 1]
// step 5-4: [[0,1], [0,1], [1, 0], [0, 1] [0,1]] // character [0, 1]
// step 5-5: [[0,1], [0,1], [0, 1], [1, 0] [1,0]] // character [0, 1]
// step 5-6: [[0,1], [0,1], [0, 1], [1, 0] [0,1]] // character [0, 1]
// step 5-7: [[0,1], [0,1], [0, 1], [0, 1] [1,0]] // character [0, 1]
// step 5-8: [[0,1], [1,0], [0, 1], [0, 1] [0,1]] // character [0, 1]
// step 5-9: [[0,1], [1,0], [1, 0], [1, 0] [1,0]] // character [0, 1]
// step 5-10: [[0,1], [1,0], [1, 0], [1, 0] [0,1]] // character [0, 1]
// step 5-11: [[0,1], [1,0], [1, 0], [0, 1] [1,0]] // character [0, 1]
// step 5-12: [[0,1], [1,0], [1, 0], [0, 1] [0,1]] // character [0, 1]
// step 5-13: [[0,1], [1,0], [0, 1], [1, 0] [1,0]] // character [0, 1]
// step 5-14: [[0,1], [1,0], [0, 1], [1, 0] [0,1]] // character [0, 1]
// step 5-15: [[0,1], [1,0], [0, 1], [0, 1] [1,0]] // character [0, 1]
// step 5-16: [[0,1], [1,0], [0, 1], [0, 1] [0,1]] // character [0, 1]
// step 5-17: [[1,0], [0,1], [1, 0], [1, 0] [1,0]] // character [1, 1]
// step 5-18: [[1,0], [0,1], [1, 0], [1, 0] [0,1]] // character [1, 1]
// step 5-19: [[1,0], [0,1], [1, 0], [0, 1] [1,0]] // character [1, 1]
// step 5-20: [[1,0], [0,1], [1, 0], [0, 1] [0,1]] // character [1, 1]
// step 5-21: [[1,0], [0,1], [0, 1], [1, 0] [1,0]] // character [1, 1]
// step 5-22: [[1,0], [0,1], [0, 1], [1, 0] [0,1]] // character [1, 1]
// step 5-23: [[1,0], [0,1], [0, 1], [0, 1] [1,0]] // character [1, 1]
// step 5-24: [[1,0], [1,0], [0, 1], [0, 1] [0,1]] // character [1, 1]
// step 5-25: [[1,0], [1,0], [1, 0], [1, 0] [1,0]] // character [1, 1]
// step 5-26: [[1,0], [1,0], [1, 0], [1, 0] [0,1]] // character [1, 1]
// step 5-27: [[1,0], [1,0], [1, 0], [0, 1] [1,0]] // character [1, 1]
// step 5-28: [[1,0], [1,0], [1, 0], [0, 1] [0,1]] // character [1, 1]
// step 5-29: [[1,0], [1,0], [0, 1], [1, 0] [1,0]] // character [1, 1]
// step 5-30: [[1,0], [1,0], [0, 1], [1, 0] [0,1]] // character [1, 1]
// step 5-31: [[1,0], [1,0], [0, 1], [0, 1] [1,0]] // character [1, 1]
// step 5-32: [[1,0], [1,0], [0, 1], [0, 1] [0,1]] // character [1, 1]

const MAP_CASES = [
  {
    holes: [],
    character: [0, 0],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 1],
    ],
    character: [0, 5],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [1, 0],
    ],
    character: [1, 5],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [0, 0],
      [1, 0],
      [1, 0],
    ],
    character: [1, 4],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [0, 0],
      [1, 0],
      [0, 1],
    ],
    character: [1, 4],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 1],
      [1, 0],
    ],
    character: [0, 4],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 1],
      [0, 1],
    ],
    character: [0, 4],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [1, 0],
      [1, 0],
      [1, 0],
    ],
    character: [1, 3],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [1, 0],
      [1, 0],
      [0, 1],
    ],
    character: [1, 3],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 0],
    ],
    character: [1, 3],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 1],
    ],
    character: [1, 3],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 0],
    ],
    character: [0, 3],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [0, 1],
      [1, 0],
      [0, 1],
    ],
    character: [0, 3],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [0, 1],
      [0, 1],
      [1, 0],
    ],
    character: [0, 3],
  },
  {
    holes: [
      [0, 0],
      [0, 0],
      [0, 1],
      [0, 1],
      [0, 1],
    ],
    character: [0, 3],
  },
  {
    holes: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 0],
      [1, 0],
    ],
    character: [0, 2],
  },
  {
    holes: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 0],
      [0, 1],
    ],
    character: [0, 2],
  },
  {
    holes: [
      [0, 0],
      [0, 1],
      [1, 0],
      [0, 1],
      [1, 0],
    ],
    character: [0, 2],
  },
  {
    holes: [
      [0, 0],
      [0, 1],
      [1, 0],
      [0, 1],
      [0, 1],
    ],
    character: [0, 2],
  },
  {
    holes: [
      [0, 0],
      [0, 1],
      [0, 1],
      [1, 0],
      [1, 0],
    ],
    character: [0, 2],
  },
  {
    holes: [
      [0, 0],
      [0, 1],
      [0, 1],
      [1, 0],
      [0, 1],
    ],
    character: [0, 2],
  },
  {
    holes: [
      [0, 0],
      [0, 1],
      [0, 1],
      [0, 1],
      [1, 0],
    ],
    character: [0, 2],
  },
  {
    holes: [
      [0, 0],
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 1],
    ],
    character: [0, 2],
  },
  {
    holes: [
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 1],
      [0, 1],
    ],
    character: [1, 2],
  },
  {
    holes: [
      [0, 0],
      [1, 0],
      [1, 0],
      [1, 0],
      [1, 0],
    ],
    character: [1, 2],
  },
  {
    holes: [
      [0, 0],
      [1, 0],
      [1, 0],
      [1, 0],
      [0, 1],
    ],
    character: [1, 2],
  },
  {
    holes: [
      [0, 0],
      [1, 0],
      [1, 0],
      [0, 1],
      [1, 0],
    ],
    character: [1, 2],
  },
  {
    holes: [
      [0, 0],
      [1, 0],
      [1, 0],
      [0, 1],
      [0, 1],
    ],
    character: [1, 2],
  },
  {
    holes: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 0],
      [1, 0],
    ],
    character: [1, 2],
  },
  {
    holes: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 0],
      [0, 1],
    ],
    character: [1, 2],
  },
  {
    holes: [
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 1],
      [1, 0],
    ],
    character: [1, 2],
  },
  {
    holes: [
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 1],
      [0, 1],
    ],
    character: [1, 2],
  },
  {
    holes: [
      [0, 1],
      [0, 1],
      [1, 0],
      [1, 0],
      [1, 0],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [0, 1],
      [1, 0],
      [1, 0],
      [0, 1],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [0, 1],
      [1, 0],
      [0, 1],
      [1, 0],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [0, 1],
      [1, 0],
      [0, 1],
      [0, 1],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [0, 1],
      [0, 1],
      [1, 0],
      [1, 0],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [0, 1],
      [0, 1],
      [1, 0],
      [0, 1],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 1],
      [1, 0],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [1, 0],
      [0, 1],
      [0, 1],
      [0, 1],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [1, 0],
      [1, 0],
      [1, 0],
      [1, 0],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [1, 0],
      [1, 0],
      [1, 0],
      [0, 1],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [1, 0],
      [1, 0],
      [0, 1],
      [1, 0],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [1, 0],
      [1, 0],
      [0, 1],
      [0, 1],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [1, 0],
      [0, 1],
      [1, 0],
      [1, 0],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [1, 0],
      [0, 1],
      [1, 0],
      [0, 1],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [1, 0],
      [0, 1],
      [0, 1],
      [1, 0],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [1, 0],
      [0, 1],
      [0, 1],
      [0, 1],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 1],
    ],
    character: [0, 1],
  },
  {
    holes: [
      [1, 0],
      [0, 1],
      [1, 0],
      [1, 0],
      [1, 0],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [0, 1],
      [1, 0],
      [1, 0],
      [0, 1],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [0, 1],
      [1, 0],
      [0, 1],
      [1, 0],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [0, 1],
      [1, 0],
      [0, 1],
      [0, 1],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [0, 1],
      [0, 1],
      [1, 0],
      [1, 0],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [0, 1],
      [0, 1],
      [1, 0],
      [0, 1],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [0, 1],
      [0, 1],
      [0, 1],
      [1, 0],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [1, 0],
      [0, 1],
      [0, 1],
      [0, 1],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [1, 0],
      [1, 0],
      [1, 0],
      [1, 0],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [1, 0],
      [1, 0],
      [1, 0],
      [0, 1],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [1, 0],
      [1, 0],
      [0, 1],
      [1, 0],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [1, 0],
      [1, 0],
      [0, 1],
      [0, 1],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [1, 0],
      [0, 1],
      [1, 0],
      [1, 0],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [1, 0],
      [0, 1],
      [1, 0],
      [0, 1],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [1, 0],
      [0, 1],
      [0, 1],
      [1, 0],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [1, 0],
      [0, 1],
      [0, 1],
      [0, 1],
    ],
    character: [1, 1],
  },
  {
    holes: [
      [1, 0],
      [0, 1],
      [0, 1],
      [0, 1],
      [0, 1],
    ],
    character: [1, 1],
  },
]

async function generateImage(config: { holes: number[][]; character: number[] }) {
  // example config: { holes: [[1,0], [0,1], [1,0], [0,1], [0,1]], character: [0, 5] }
  try {
    // Load both images
    const EMPTY_MAP = await Jimp.read(`${BASE_URL}/statics/map-empty.png`)
    const CHARACTER = await Jimp.read(`${BASE_URL}/statics/character.png`)
    const HOLE = await Jimp.read(`${BASE_URL}/statics/hole.png`)

    if (config.holes.length > 0) {
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

      EMPTY_MAP.composite(CHARACTER, TILE_SIZE * 3 + config.character[0] * TILE_SIZE, TILE_SIZE * 2 + (config.character[1] - 1) * TILE_SIZE - 32, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1,
      })
    } else {
      // middle
      EMPTY_MAP.composite(CHARACTER, (EMPTY_MAP.getWidth() - CHARACTER.getWidth()) / 2, EMPTY_MAP.getHeight() - CHARACTER.getHeight() - 24, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1,
      })
    }

    const imageName = config.holes.flat().join('') + '.png'
    const outputFilePath = `./public/maps/${imageName}`

    await EMPTY_MAP.writeAsync(outputFilePath)
    return imageName
  } catch (error) {
    console.error('Error combining images:', error)
    throw error
  }
}

const generate = async () => {
  for (const mapCase of MAP_CASES) {
    const imageName = mapCase.holes.flat().join('') + '.png'
    const config = {
      holes: mapCase.holes,
      character: mapCase.character,
    }
    await generateImage(config)
    console.log(`Generated image: ${imageName}`)
  }
}

console.log(MAP_CASES.length)

generate()

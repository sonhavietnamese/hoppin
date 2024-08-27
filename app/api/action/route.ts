import { BASE_URL, connection, TILE_SIZE } from '@/app/constants'
import { blinksights } from '@/services/blinksight'
import { ActionGetResponse, ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from '@solana/actions'
import { ActionPostResponse, NextActionLink } from '@solana/actions-spec'
import { ComputeBudgetProgram, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import Jimp from 'jimp'

export async function GET(req: Request) {
  let response: ActionGetResponse = blinksights.createActionGetResponseV1(req.url, {
    type: 'action',
    icon: `${BASE_URL}/thumbnail.png`,
    title: 'Hoppin',
    description: 'Hop through holes and collect $SEND',
    label: '',
    links: {
      actions: [
        {
          label: 'Start',
          href: '/api/action?stage=start&step=0',
        },
        {
          label: 'Tutorial',
          href: '/api/action?to=tutorial',
        },
      ],
    },
  })

  return Response.json(response, {
    headers: ACTIONS_CORS_HEADERS,
  })
}

let hole = [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
]

// ensures cors
export const OPTIONS = GET

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { account: string; signature: string }
    const sender = new PublicKey(body.account)

    // blinksights.trackActionV2(body.account, req.url) // TODO: 400 error

    const { searchParams } = new URL(req.url)

    const stage = searchParams.get('stage') as string
    const step = parseInt(searchParams.get('step') as string)
    const direction = searchParams.get('direction') as string
    const claim = Boolean(searchParams.get('claim'))

    console.log('stage', stage)
    console.log('step', step)
    console.log('direction', direction)
    console.log('claim', claim)

    if (stage === 'start') {
      try {
        const transaction = await createBlankTransaction(sender)

        let params

        if (step === 0) {
          params = {
            holes: [],
            character: [0, 0],
            padding: [0, 0, 0, 0],
            offset: 0,
            state: undefined,
          }
        } else {
          let character = [0, 0]
          if (direction === 'left') {
            hole[5 - step] = [0, 1]
            character = [0, 5 - step]
          } else {
            hole[5 - step] = [1, 0]
            character = [1, 5 - step]
          }

          params = {
            holes: hole,
            character: character,
            padding: [0, 0, 0, 0],
            offset: 0,
            state: undefined,
          }
        }

        const image = await generateImage(params)

        console.log('image', image)

        let payload: ActionPostResponse

        if (step === 5) {
          payload = await createPostResponse({
            fields: {
              links: {
                next: {
                  type: 'inline',
                  action: {
                    description: ``,
                    icon: image,
                    label: ``,
                    title: `Hoppin | Congratulation 🎉`,
                    type: 'action',
                    links: {
                      actions: [
                        {
                          label: `Claim`,
                          href: `/api/action?stage=finish&claim=true`,
                        },
                      ],
                    },
                  },
                },
              },
              transaction,
            },
          })
        } else {
          payload = await createPostResponse({
            fields: {
              links: {
                next: {
                  type: 'inline',
                  action: {
                    description: ``,
                    icon: image,
                    label: ``,
                    title: `Hoppin | Ready`,
                    type: 'action',
                    links: {
                      actions: [
                        {
                          label: `Left`,
                          href: `/api/action?stage=start&direction=left&step=${step + 1}`,
                        },
                        {
                          label: `Right`,
                          href: `/api/action?stage=start&direction=right&step=${step + 1}`,
                        },
                      ],
                    },
                  },
                },
              },
              transaction,
            },
          })
        }

        console.log('payload', payload)
        console.log('tx', transaction.serialize().toString('base64'))

        return Response.json(payload, {
          headers: ACTIONS_CORS_HEADERS,
        })
      } catch (err) {
        console.log('POST /api/action', err)
        let message = 'An unknown error occurred'
        if (typeof err == 'string') message = err
        return Response.json({
          status: 400,
          message: message,
          headers: ACTIONS_CORS_HEADERS,
        })
      }
    }

    if (stage === 'finish') {
      if (claim) {
        // Memo transaction
        const transaction = await createBlankTransaction(sender)

        const image = await generateImage({
          holes: hole,
          character: [0, 0],
          padding: [0, 0, 0, 0],
          offset: 0,
          state: 'claimed',
        })

        const payload = await createPostResponse({
          fields: {
            links: {
              next: {
                type: 'inline',
                action: {
                  description: ``,
                  icon: image,
                  label: ``,
                  title: `Hoppin 🎉`,
                  type: 'action',
                  links: {
                    actions: [
                      {
                        label: `Hop Again`,
                        href: `/api/action?stage=start&step=0`,
                      },
                    ],
                  },
                },
              },
            },
            transaction,
          },
        })

        return Response.json(payload, {
          headers: ACTIONS_CORS_HEADERS,
        })
      }
    }

    // Memo transaction
    const transaction = await createBlankTransaction(sender)

    const payload = await createPostResponse({
      fields: {
        links: {
          next: {
            type: 'inline',
            action: {
              description: ``,
              icon: `${BASE_URL}/tutorial.png`,
              label: ``,
              title: `Hoppin | Tutorial`,
              type: 'action',
              links: {
                actions: [
                  {
                    label: `Hop in`,
                    href: `/api/action?stage=start&step=0`,
                  },
                ],
              },
            },
          },
        },
        transaction,
      },
    })

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    })
  } catch (err) {
    console.log('Error in POST /api/action', err)
    let message = 'An unknown error occurred'
    if (typeof err == 'string') message = err
    return Response.json({
      status: 400,
      message: message,
      headers: ACTIONS_CORS_HEADERS,
    })
  }
}

const createBlankTransaction = async (sender: PublicKey) => {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: new PublicKey('BnJsyytCwkzQoRs6X8P9fbFXLEUsC7EbNoFUuYJXuUER'),
      lamports: LAMPORTS_PER_SOL * 0,
    }),
  )
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  tx.feePayer = sender

  return tx
}

async function generateImage(config: {
  holes: number[][]
  character: number[]
  padding: number[] // [top, right, bottom, left]
  offset: number
  state: 'claimed' | 'failed' | undefined
}) {
  // example config: { holes: [[1,0], [0,1], [1,0], [0,1], [0,1]], character: [0, 5] }
  try {
    // Load both images
    const EMPTY_MAP = await Jimp.read(`${BASE_URL}/statics/map-empty.png`)
    const CHARACTER = await Jimp.read(`${BASE_URL}/statics/character.png`)
    const HOLE = await Jimp.read(`${BASE_URL}/statics/hole.png`)
    const CLAIMED = await Jimp.read(`${BASE_URL}/statics/claimed.png`)
    const FAILED = await Jimp.read(`${BASE_URL}/statics/failed.png`)

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

      EMPTY_MAP.composite(CHARACTER, TILE_SIZE * 3 + config.character[0] * TILE_SIZE, TILE_SIZE * 2 + config.character[1] * TILE_SIZE - 32, {
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

    if (config.state === 'claimed') {
      EMPTY_MAP.composite(CLAIMED, 0, 0, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1,
      })
    } else if (config.state === 'failed') {
      EMPTY_MAP.composite(FAILED, 0, 0, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 1,
        opacityDest: 1,
      })
    }

    // Convert the resulting image to a buffer
    const buffer = await EMPTY_MAP.getBase64Async(Jimp.MIME_PNG)

    return buffer
  } catch (error) {
    console.error('Error combining images:', error)
    throw error
  }
}

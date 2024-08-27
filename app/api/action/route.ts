import { BASE_URL, connection, TILE_SIZE } from '@/app/constants'
import { blinksights } from '@/services/blinksight'
import { ActionGetResponse, ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from '@solana/actions'
import { ActionPostResponse, NextActionLink } from '@solana/actions-spec'
import { ComputeBudgetProgram, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import Jimp from 'jimp'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  let response: ActionGetResponse = {
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
          href: '/api/action?stage=tutorial',
        },
      ],
    },
  }

  return NextResponse.json(response, {
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
  const body = (await req.json()) as { account: string; signature: string }
  const { searchParams } = new URL(req.url)

  const sender = new PublicKey(body.account)
  // blinksights.trackActionV2(body.account, req.url) // TODO: 400 error
  const stage = searchParams.get('stage') as string
  const step = parseInt(searchParams.get('step') as string)
  const direction = searchParams.get('direction') as string
  const claim = Boolean(searchParams.get('claim'))

  const transaction = await createBlankTransaction(sender)

  if (stage === 'start') {
    // let params

    // if (step === 0) {
    //   params = {
    //     holes: [],
    //     character: [0, 0],
    //     padding: [0, 0, 0, 0],
    //     offset: 0,
    //     state: undefined,
    //   }
    // } else {
    //   let character = [0, 0]
    //   if (direction === 'left') {
    //     hole[5 - step] = [0, 1]
    //     character = [0, 5 - step]
    //   } else {
    //     hole[5 - step] = [1, 0]
    //     character = [1, 5 - step]
    //   }

    //   params = {
    //     holes: hole,
    //     character: character,
    //     padding: [0, 0, 0, 0],
    //     offset: 0,
    //     state: undefined,
    //   }
    // }

    // let image = 'https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg'

    // try {
    //   image = await generateImage({
    //     holes: [
    //       [0, 0],
    //       [0, 0],
    //       [0, 0],
    //       [0, 0],
    //       [0, 0],
    //     ],
    //     character: [0, 0],
    //     padding: [0, 0, 0, 0],
    //     offset: 0,
    //     state: undefined,
    //   })
    // } catch (error) {
    //   console.error('Error generating image:', error)
    // }

    const transaction = await createBlankTransaction(sender)

    const payload = await createPostResponse({
      fields: {
        links: {
          next: {
            type: 'inline',
            action: {
              description: ``,
              icon: 'data:image/png;base64,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',
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

    return NextResponse.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    })

    // if (step === 5) {
    //   const transaction = await createBlankTransaction(sender)

    //   const payload = await createPostResponse({
    //     fields: {
    //       links: {
    //         next: {
    //           type: 'inline',
    //           action: {
    //             description: ``,
    //             icon: image,
    //             label: ``,
    //             title: `Hoppin | Congratulation 🎉`,
    //             type: 'action',
    //             links: {
    //               actions: [
    //                 {
    //                   label: `Claim`,
    //                   href: `/api/action?stage=finish&claim=true`,
    //                 },
    //               ],
    //             },
    //           },
    //         },
    //       },
    //       transaction,
    //     },
    //   })

    //   return NextResponse.json(payload, {
    //     headers: ACTIONS_CORS_HEADERS,
    //   })
    // } else {
    //   const transaction = await createBlankTransaction(sender)

    //   const payload = await createPostResponse({
    //     fields: {
    //       links: {
    //         next: {
    //           type: 'inline',
    //           action: {
    //             description: ``,
    //             icon: image,
    //             label: ``,
    //             title: `Hoppin | Ready`,
    //             type: 'action',
    //             links: {
    //               actions: [
    //                 {
    //                   label: `Left`,
    //                   href: `/api/action?stage=start&direction=left&step=${step + 1}`,
    //                 },
    //                 {
    //                   label: `Right`,
    //                   href: `/api/action?stage=start&direction=right&step=${step + 1}`,
    //                 },
    //               ],
    //             },
    //           },
    //         },
    //       },
    //       transaction,
    //     },
    //   })

    //   return NextResponse.json(payload, {
    //     headers: ACTIONS_CORS_HEADERS,
    //   })
    // }
  }

  if (stage === 'finish') {
    if (claim) {
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

      return NextResponse.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      })
    }
  }

  if (stage === 'tutorial') {
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

    return NextResponse.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    })
  }

  return NextResponse.json({
    status: 400,
    headers: ACTIONS_CORS_HEADERS,
  })
}

const createBlankTransaction = async (sender: PublicKey) => {
  // const transaction = new Transaction()
  // transaction.add(
  //   ComputeBudgetProgram.setComputeUnitPrice({
  //     microLamports: 1000,
  //   }),
  //   new TransactionInstruction({
  //     programId: new PublicKey(MEMO_PROGRAM_ID),
  //     data: Buffer.from('This is a blank memo transaction'),
  //     keys: [],
  //   }),
  // )
  // transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  // transaction.feePayer = sender

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: new PublicKey('CRtPaRBqT274CaE5X4tFgjccx5XXY5zKYfLPnvitKdJx'),
      lamports: LAMPORTS_PER_SOL * 0,
    }),
  )
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  transaction.feePayer = sender

  return transaction
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

// const example = {
//   "links": {
//       "next": {
//           "type": "inline",
//           "action": {
//               "description": "",
//               "icon": "",
//               "label": "",
//               "title": "Hoppin | Ready",
//               "type": "action",
//               "links": {
//                   "actions": [
//                       {
//                           "label": "Left",
//                           "href": "/api/action?stage=start&direction=left&step=1"
//                       },
//                       {
//                           "label": "Right",
//                           "href": "/api/action?stage=start&direction=right&step=1"
//                       }
//                   ]
//               }
//           }
//       }
//   },
//   "transaction": "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAID3ZpRq3edJK7R5sTixnD629ys6NF4K4WL2uuvm+CzFTQDBkZv5SEXMv/srbpyw5vnvIzlu8X3EmssQ5s6QAAAAAVKU1qZKSEGTSTocWDaOHx8NbXdvJK7geQfqEBBBUSNEJERiXyA6/bQn3nK0yGXyGuPp1d4m+5+kjfAeH3gLBQCAQAJA+gDAAAAAAAAAgAgVGhpcyBpcyBhIGJsYW5rIG1lbW8gdHJhbnNhY3Rpb24="
// }

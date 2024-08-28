import { BASE_URL, connection } from '@/app/constants'
import { blinksights } from '@/services/blinksight'
import { ActionGetResponse, ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from '@solana/actions'
import { ComputeBudgetProgram, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { NextResponse } from 'next/server'

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
          href: '/api/action?stage=tutorial',
        },
      ],
    },
  })

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

    const image = `${BASE_URL}/maps/${hole.flat().join('')}.png`

    if (step === 5) {
      const transaction = await createBlankTransaction(sender)

      const payload = await createPostResponse({
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

      return NextResponse.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      })
    } else {
      const transaction = await createBlankTransaction(sender)

      const payload = await createPostResponse({
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

      return NextResponse.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      })
    }
  }

  if (stage === 'finish') {
    if (claim) {
      const image = `${BASE_URL}/statics/claimed.png`

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
  const transaction = new Transaction()
  transaction.add(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1000,
    }),
    new TransactionInstruction({
      programId: new PublicKey(MEMO_PROGRAM_ID),
      data: Buffer.from('This is a blank memo transaction'),
      keys: [],
    }),
  )
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  transaction.feePayer = sender

  return transaction
}

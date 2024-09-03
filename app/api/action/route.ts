import {
  BASE_URL,
  connection,
  FEE_STEP_1,
  FEE_STEP_2,
  FEE_STEP_3,
  FEE_STEP_4,
  FEE_STEP_5,
  FROM_KEYPAIR,
  MINT_ADDRESS,
  REWARD_AMOUNT,
  WINRATE_STEP_1,
  WINRATE_STEP_2,
  WINRATE_STEP_3,
  WINRATE_STEP_4,
  WINRATE_STEP_5,
} from '@/app/constants'
import { blinksights } from '@/services/blinksight'
import { ActionGetResponse, ACTIONS_CORS_HEADERS, createPostResponse, MEMO_PROGRAM_ID } from '@solana/actions'
import { createTransferInstruction, getOrCreateAssociatedTokenAccount } from '@solana/spl-token'
import { ComputeBudgetProgram, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  let response: ActionGetResponse = await blinksights.createActionGetResponseV1(req.url, {
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

const DATA: Record<string, { currentHoles: number[][]; generatedHoles: number[][]; step: number; isWin: boolean }> = {
  dummy: {
    currentHoles: [],
    generatedHoles: [],
    step: 0,
    isWin: false,
  },
}

// ensures cors
export const OPTIONS = GET

export async function POST(req: Request) {
  const body = (await req.json()) as { account: string; signature: string }
  const { searchParams } = new URL(req.url)

  const sender = new PublicKey(body.account)
  // blinksights.trackActionV2(body.account, req.url)
  const stage = searchParams.get('stage') as string
  const step = parseInt(searchParams.get('step') as string)
  const direction = searchParams.get('direction') as string
  const claim = Boolean(searchParams.get('claim'))

  if (stage === 'start') {
    const transaction = await createBlankTransaction(sender)
    // const transaction = await createFeeTransaction(sender.toString(), calculateFee(step))

    if (step === 0)
      DATA[body.account] = {
        generatedHoles: generateHoles(),
        currentHoles: [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
        ],
        step: 0,
        isWin: false,
      }
    else {
      const win = determineWin(step)

      if (win) {
        if (direction === 'left') {
          DATA[body.account].currentHoles[5 - step] = [0, 1]
        } else {
          DATA[body.account].currentHoles[5 - step] = [1, 0]
        }
        DATA[body.account].isWin = true
      } else {
        if (direction === 'left') {
          DATA[body.account].currentHoles[5 - step] = [1, 0]
        } else {
          DATA[body.account].currentHoles[5 - step] = [0, 1]
        }
        DATA[body.account].isWin = false

        const payload = await createPostResponse({
          fields: {
            links: {
              next: {
                type: 'inline',
                action: {
                  description: ``,
                  icon: `${BASE_URL}/statics/failed.png`,
                  label: `Leg Broken`,
                  title: `Hoppin | Leg Broken`,
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
            transaction: transaction,
          },
        })

        return NextResponse.json(payload, {
          headers: ACTIONS_CORS_HEADERS,
        })
      }
    }

    DATA[body.account].step = step

    const image = `${BASE_URL}/maps/${DATA[body.account].currentHoles.flat().join('')}.png`

    if (step === 5 && DATA[body.account].isWin) {
      const transaction = await createFeeTransaction(sender.toString(), calculateFee(step))

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
                      label: `Open Chest`,
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
      // const transaction = await createBlankTransaction(sender)
      const transaction = await createFeeTransaction(sender.toString(), calculateFee(step))
      // console.log(transaction)

      const payload = await createPostResponse({
        fields: {
          links: {
            next: {
              type: 'inline',
              action: {
                description: ``,
                icon: image,
                label: ``,
                title: generateTitle(step),
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
      const transaction = await sendTokens(body.account)
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
          transaction: transaction,
        },
      })

      DATA[body.account].isWin = false

      return NextResponse.json(payload, {
        headers: ACTIONS_CORS_HEADERS,
      })
    }
  }

  if (stage === 'tutorial') {
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
        transaction: transaction,
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

function generateHoles() {
  const holes = []
  const cases = [
    [0, 1],
    [1, 0],
  ]
  for (let i = 0; i < 5; i++) {
    holes.push(cases[Math.floor(Math.random() * cases.length)])
  }
  return holes
}

function determineWin(step: number): boolean {
  let winRate: number

  switch (step) {
    case 1:
      winRate = WINRATE_STEP_1
      break
    case 2:
      winRate = WINRATE_STEP_2
      break
    case 3:
      winRate = WINRATE_STEP_3
      break
    case 4:
      winRate = WINRATE_STEP_4
      break
    case 5:
      winRate = WINRATE_STEP_5
      break
    default:
      winRate = 0
  }

  return Math.random() < winRate
}

async function sendTokens(recipient: string) {
  let sourceAccount = await getOrCreateAssociatedTokenAccount(connection, FROM_KEYPAIR, new PublicKey(MINT_ADDRESS), FROM_KEYPAIR.publicKey)

  let destinationAccount = await getOrCreateAssociatedTokenAccount(connection, FROM_KEYPAIR, new PublicKey(MINT_ADDRESS), new PublicKey(recipient))
  const tx = new Transaction()
  tx.add(createTransferInstruction(sourceAccount.address, destinationAccount.address, FROM_KEYPAIR.publicKey, REWARD_AMOUNT * 1e6))

  const latestBlockHash = await connection.getLatestBlockhash('confirmed')
  tx.recentBlockhash = latestBlockHash.blockhash
  tx.feePayer = new PublicKey(recipient)
  tx.partialSign(FROM_KEYPAIR)

  return tx
}

function calculateFee(step: number): number {
  switch (step) {
    case 1:
      return FEE_STEP_1
    case 2:
      return FEE_STEP_2
    case 3:
      return FEE_STEP_3
    case 4:
      return FEE_STEP_4
    case 5:
      return FEE_STEP_5
    default:
      return 0
  }
}

async function createFeeTransaction(recipient: string, fee: number) {
  let destinationAccount = await getOrCreateAssociatedTokenAccount(connection, FROM_KEYPAIR, new PublicKey(MINT_ADDRESS), FROM_KEYPAIR.publicKey)

  let sourceAccount = await getOrCreateAssociatedTokenAccount(connection, FROM_KEYPAIR, new PublicKey(MINT_ADDRESS), new PublicKey(recipient))
  const tx = new Transaction()
  tx.add(createTransferInstruction(sourceAccount.address, destinationAccount.address, new PublicKey(recipient), fee * 1e6))

  const latestBlockHash = await connection.getLatestBlockhash('confirmed')
  tx.recentBlockhash = latestBlockHash.blockhash
  tx.feePayer = new PublicKey(recipient)
  // tx.partialSign(FROM_KEYPAIR)
  return tx
}

function generateTitle(step: number): string {
  switch (step) {
    case 1:
      return 'Hoppin | Nice hop'
    case 2:
      return 'Hoppin | Streak 2'
    case 3:
      return 'Hoppin | 3 in a row'
    case 4:
      return 'Hoppin | 1 more'
    case 5:
      return 'Hoppin | Congratulation'
    default:
      return 'Hoppin | Choose wisely'
  }
}

import {
  Transaction,
  PublicKey,
  SystemProgram,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  ComputeBudgetProgram,
} from '@solana/web3.js'
import { ACTIONS_CORS_HEADERS, createPostResponse, ActionGetResponse, MEMO_PROGRAM_ID } from '@solana/actions'
import { NextActionLink } from '@solana/actions-spec'
import { BASE_URL, connection } from '@/app/constants'

export async function POST(req: Request) {
  const body = (await req.json()) as { account: string; signature: string }

  try {
    const { searchParams } = new URL(req.url)
    const destination = searchParams.get('to') as string

    // Memo transaction
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

    switch (destination) {
      case 'tutorial':
        const payload = await createPostResponse({
          fields: {
            links: {
              next: {
                type: 'inline',
                action: {
                  description: ``,
                  icon: `${BASE_URL}/tutorial.png`,
                  label: `Action  Label`,
                  title: `Action `,
                  type: 'action',
                  links: {
                    actions: [
                      {
                        label: `Submit `, // button text
                        href: `/api/act?amount={amount}&stage=`, // api endpoint
                        parameters: [
                          {
                            name: 'amount', // field name
                            label: 'Enter a custom SOL amount', // text input placeholder
                          },
                        ],
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

      default:
        break
    }
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

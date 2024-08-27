import { Connection } from '@solana/web3.js'

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL as string
export const connection = new Connection(process.env.HELIUS_RPC as string, 'confirmed')
export const TILE_SIZE = 64

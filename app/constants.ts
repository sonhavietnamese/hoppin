import { Connection, clusterApiUrl } from '@solana/web3.js'

export const BASE_URL = process.env.NODE_ENV === 'production' ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
export const TILE_SIZE = 64

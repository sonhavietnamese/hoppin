import { Cluster, Connection, clusterApiUrl } from '@solana/web3.js'

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL as string
export const connection = new Connection(clusterApiUrl(process.env.SOLANA_NETWORK as Cluster), 'processed')
export const TILE_SIZE = 64

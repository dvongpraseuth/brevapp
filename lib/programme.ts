import type { Notion } from './types'
import data from '../data/programme_brevet_2026.json'

type NotionData = Omit<Notion, 'st'>

export const NOTIONS: Notion[] = (data as NotionData[]).map(n => ({
  ...n,
  st: 'non_vu',
}))

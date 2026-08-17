export type SearchRound = 'round1' | 'round2'

export interface SearchRoundPreset {
  id: SearchRound
  label: string
  token: string
  description: string
  startDate?: string
  endDate?: string
}

export const ROUND_BOUNDARY = '2026-12-16'

export const ROUND_PRESETS: SearchRoundPreset[] = [
  {
    id: 'round1',
    label: '一阶段',
    token: '@round1',
    description: '2026年12月16日前的所有记忆',
    endDate: '2026-12-15',
  },
  {
    id: 'round2',
    label: '二阶段',
    token: '@round2',
    description: '2026年12月16日后的所有记忆',
    startDate: '2026-12-17',
  },
]

export function getRoundPreset(value: string) {
  const token = value.match(/@round(?:1|2)?/i)?.[0].toLowerCase()
  if (!token) return undefined
  const roundId: SearchRound = token === '@round2' ? 'round2' : 'round1'
  return ROUND_PRESETS.find((preset) => preset.id === roundId)
}

export function removeRoundToken(value: string) {
  return value.replace(/@round(?:1|2)?/gi, ' ').replace(/\s+/g, ' ').trim()
}

export function appendRoundToken(value: string, roundId: SearchRound) {
  const cleaned = removeRoundToken(value)
  const token = ROUND_PRESETS.find((preset) => preset.id === roundId)?.token ?? `@${roundId}`
  return cleaned ? `${cleaned} ${token}` : token
}

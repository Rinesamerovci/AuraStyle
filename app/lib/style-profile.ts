export type StyleProfile = {
  gender: string
  age: string
  skinTone: string
  undertone: string
  fitPreference: string
  styleVibe: string
  preferredColors: string
  avoidColors: string
  notes: string
}

export type UserProfile = {
  name: string
  email: string
  styleProfile: StyleProfile
}

export const emptyStyleProfile: StyleProfile = {
  gender: '',
  age: '',
  skinTone: '',
  undertone: '',
  fitPreference: '',
  styleVibe: '',
  preferredColors: '',
  avoidColors: '',
  notes: '',
}

function toSafeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function normalizeStyleProfile(value: unknown): StyleProfile {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    gender: toSafeString(record.gender),
    age: toSafeString(record.age),
    skinTone: toSafeString(record.skinTone),
    undertone: toSafeString(record.undertone),
    fitPreference: toSafeString(record.fitPreference),
    styleVibe: toSafeString(record.styleVibe),
    preferredColors: toSafeString(record.preferredColors),
    avoidColors: toSafeString(record.avoidColors),
    notes: toSafeString(record.notes),
  }
}

export function hasStyleProfile(profile: StyleProfile) {
  return Object.values(profile).some(Boolean)
}

export function buildStyleProfilePrompt(profile: StyleProfile) {
  const details = [
    profile.gender && `Gender: ${profile.gender}`,
    profile.age && `Age: ${profile.age}`,
    profile.skinTone && `Skin tone: ${profile.skinTone}`,
    profile.undertone && `Undertone: ${profile.undertone}`,
    profile.fitPreference && `Fit preference: ${profile.fitPreference}`,
    profile.styleVibe && `Style vibe: ${profile.styleVibe}`,
    profile.preferredColors && `Favorite colors: ${profile.preferredColors}`,
    profile.avoidColors && `Avoid these colors: ${profile.avoidColors}`,
    profile.notes && `Extra profile notes: ${profile.notes}`,
  ].filter(Boolean)

  if (details.length === 0) return ''

  return `PERSONAL PROFILE CONTEXT:\n${details.join('\n')}\nUse this profile to tailor colors, cuts, balance, and recommendations more precisely. `
}

import { createBrowserClient } from '@supabase/ssr'

export interface OutfitRecord {
  id: string
  user_id: string
  outfit_description: string
  color_palette: string
  style_tips: string | null
  rating: number | null
  created_at: string
}

export interface CreateOutfitPayload {
  prompt: string
  response: string
  occasion?: string[]
  language?: string
}

const getSupabase = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

/**
 * Create (Add) a new outfit
 */
export async function createOutfit(outfit: CreateOutfitPayload) {
  const supabase = getSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user.id) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('outfit_recommendations')
    .insert({
      user_id: session.user.id,
      outfit_description: outfit.prompt, // përdor prompt si description
      color_palette: outfit.response,   // përdor response si colors
      style_tips: null,
      rating: 5
    })
    .select('*')
    .single()

  if (error) throw new Error(`Failed to create outfit: ${error.message}`)
  return data as OutfitRecord
}

/**
 * Read (Get) all outfits for the current user
 */
export async function getOutfits(): Promise<OutfitRecord[]> {
  const supabase = getSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user.id) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('outfit_recommendations')
    .select('*')
    .eq('user_id', session.user.id)
    .order('saved_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch outfits: ${error.message}`)
  return (data || []) as OutfitRecord[]
}

/**
 * Update an outfit
 */
export async function updateOutfit(
  id: string,
  updates: Partial<Omit<OutfitRecord, 'id' | 'user_id' | 'saved_at'>>
) {
  const supabase = getSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user.id) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('outfit_recommendations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id) // Ensure user owns this outfit
    .select('*')
    .single()

  if (error) throw new Error(`Failed to update outfit: ${error.message}`)
  return data as OutfitRecord
}

/**
 * Delete (Remove) an outfit
 */
export async function deleteOutfit(id: string) {
  const supabase = getSupabase()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user.id) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('outfit_recommendations') // ✅ FIXED
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) throw new Error(`Failed to delete outfit: ${error.message}`)
}


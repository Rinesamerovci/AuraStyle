'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient, User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  userProfile: { name?: string; email?: string } | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

let browserSupabase: SupabaseClient | null = null

function getSupabaseClient() {
  if (!hasSupabaseEnv) return null

  if (!browserSupabase) {
    browserSupabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  return browserSupabase
}

function buildUserProfile(user: User | null) {
  if (!user) return null

  return {
    name: user.user_metadata?.name || user.user_metadata?.full_name || '',
    email: user.email || '',
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(hasSupabaseEnv)
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string } | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!supabase) return

    let isMounted = true

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!isMounted) return

      setUser(session?.user ?? null)
      setUserProfile(buildUserProfile(session?.user ?? null))
      setLoading(false)
    }

    void getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setUserProfile(buildUserProfile(session?.user ?? null))
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signUp = async (email: string, password: string, name?: string) => {
    if (!supabase) throw new Error('Supabase not initialized')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          full_name: name || email.split('@')[0],
        },
      },
    })

    if (error) throw error
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not initialized')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase not initialized')

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, userProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import {
  emptyStyleProfile,
  normalizeStyleProfile,
  type StyleProfile,
  type UserProfile,
} from '@/app/lib/style-profile'

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateStyleProfile: (profile: StyleProfile) => Promise<void>
  userProfile: UserProfile | null
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

function getFriendlyAuthError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (
      error instanceof TypeError ||
      message.includes('failed to fetch') ||
      message.includes('network')
    ) {
      return new Error(
        "Supabase nuk po arrihet. Kontrollo `.env.local`, verifiko URL/key te Supabase, dhe rifillo `npm run dev` pasi t'i ndryshosh."
      )
    }

    return error
  }

  return new Error('Dicka shkoi gabim gjate lidhjes me Supabase.')
}

function buildUserProfile(user: User | null) {
  if (!user) return null

  return {
    name: String(user.user_metadata?.name || user.user_metadata?.full_name || ''),
    email: String(user.email || ''),
    styleProfile: normalizeStyleProfile(user.user_metadata?.style_profile ?? emptyStyleProfile),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(hasSupabaseEnv)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!supabase) return

    let isMounted = true

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return

        setUser(session?.user ?? null)
        setUserProfile(buildUserProfile(session?.user ?? null))
      } catch (error) {
        console.error('Supabase session check failed:', getFriendlyAuthError(error))
        if (!isMounted) return

        setUser(null)
        setUserProfile(null)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
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
    if (!supabase) throw new Error('Supabase nuk u inicializua. Kontrollo `.env.local` dhe rifillo serverin.')

    try {
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
    } catch (error) {
      throw getFriendlyAuthError(error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase nuk u inicializua. Kontrollo `.env.local` dhe rifillo serverin.')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      throw getFriendlyAuthError(error)
    }
  }

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase nuk u inicializua. Kontrollo `.env.local` dhe rifillo serverin.')

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      throw getFriendlyAuthError(error)
    }
  }

  const updateStyleProfile = async (profile: StyleProfile) => {
    if (!supabase) throw new Error('Supabase nuk u inicializua. Kontrollo `.env.local` dhe rifillo serverin.')
    if (!user) throw new Error('Duhet te jesh i kycur per te ruajtur profilin.')

    try {
      const nextProfile = normalizeStyleProfile(profile)
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          style_profile: nextProfile,
        },
      })

      if (error) throw error

      const nextUser = data.user ?? user
      setUser(nextUser)
      setUserProfile(buildUserProfile(nextUser))
    } catch (error) {
      throw getFriendlyAuthError(error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateStyleProfile, userProfile }}>
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

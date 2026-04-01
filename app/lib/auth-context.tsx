'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  userProfile: { name?: string; email?: string } | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string } | null>(null)

  // Only create Supabase client if we have environment variables
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        setUserProfile({
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
          email: session.user.email || '',
        })
      }
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setUserProfile({
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
          email: session.user.email || '',
        })
      } else {
        setUserProfile(null)
      }
    })

    return () => subscription.unsubscribe()
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

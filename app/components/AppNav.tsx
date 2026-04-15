'use client'

import { useAuth } from '@/app/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AppNav() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/')
    }
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/profile', label: 'Profili' },
    { href: '/style', label: 'Gjenero Outfit' },
    { href: '/outfits', label: 'Koleksioni' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        .appnav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          background: rgba(13,13,13,0.92); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(157,193,131,0.12);
          padding: 0 48px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .appnav-logo { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: #f5f0e8; text-decoration: none; }
        .appnav-links { display: flex; align-items: center; gap: 4px; }
        .appnav-link { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #6b6560; text-decoration: none; padding: 6px 16px; transition: color 0.2s; position: relative; letter-spacing: 0.06em; }
        .appnav-link:hover { color: #f5f0e8; }
        .appnav-link.active { color: #9DC183; }
        .appnav-link.active::after { content: ''; position: absolute; bottom: -22px; left: 16px; right: 16px; height: 1px; background: #9DC183; }
        .appnav-right { display: flex; align-items: center; gap: 20px; }
        .appnav-email { font-size: 12px; color: #3d3832; font-family: 'DM Sans', sans-serif; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .appnav-logout { font-family: 'DM Sans', sans-serif; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #6b6560; background: none; border: 1px solid rgba(157,193,131,0.2); padding: 7px 16px; cursor: pointer; transition: all 0.2s; }
        .appnav-logout:hover { color: #9DC183; border-color: rgba(157,193,131,0.5); }
        @media (max-width: 768px) { .appnav { padding: 0 20px; } .appnav-links { display: none; } .appnav-email { display: none; } }
      `}</style>
      <nav className="appnav">
        <Link href="/dashboard" className="appnav-logo">AuraStyle</Link>
        <div className="appnav-links">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`appnav-link ${pathname === item.href ? 'active' : ''}`}>{item.label}</Link>
          ))}
        </div>
        <div className="appnav-right">
          {user && (
            <>
              <span className="appnav-email">{user.email}</span>
              <button className="appnav-logout" onClick={handleLogout}>Dil</button>
            </>
          )}
        </div>
      </nav>
    </>
  )
}

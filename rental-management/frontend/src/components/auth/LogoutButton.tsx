'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default', 
  className,
  children 
}: LogoutButtonProps) {
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
    >
      {children || (
        <>
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          Đăng xuất
        </>
      )}
    </Button>
  )
}

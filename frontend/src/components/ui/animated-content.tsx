'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedContentProps {
  children: ReactNode
  className?: string
  direction?: 'left' | 'right' | 'up' | 'down'
  duration?: number
}

export function AnimatedContent({ 
  children, 
  className,
  direction = 'right',
  duration = 300
}: AnimatedContentProps) {
  const getAnimationClass = () => {
    switch (direction) {
      case 'left':
        return 'animate-in slide-in-from-left-5'
      case 'right':
        return 'animate-in slide-in-from-right-5'
      case 'up':
        return 'animate-in slide-in-from-bottom-5'
      case 'down':
        return 'animate-in slide-in-from-top-5'
      default:
        return 'animate-in slide-in-from-right-5'
    }
  }

  return (
    <div 
      className={cn(
        getAnimationClass(),
        `duration-${duration}`,
        className
      )}
    >
      {children}
    </div>
  )
}
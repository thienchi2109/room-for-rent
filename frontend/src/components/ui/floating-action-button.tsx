'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  size?: 'default' | 'lg'
  variant?: 'default' | 'secondary'
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, icon, size = 'default', variant = 'default', children, ...props }, ref) => {
    return (
      <>
        {/* Mobile FAB - Only visible on screens < 1024px */}
        <button
          className={cn(
            // Base styles
            'lg:hidden fixed bottom-20 right-4 z-40 rounded-full transition-all duration-300 ease-in-out',
            'flex items-center justify-center font-medium',
            'shadow-lg hover:shadow-2xl transform hover:scale-110 active:scale-95',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'backdrop-blur-sm border border-white/20',

            // Variant styles
            {
              'bg-gray-900 text-white hover:bg-black focus:ring-black': variant === 'default',
              'bg-gray-600/90 text-white hover:bg-gray-700/95 focus:ring-gray-500 hover:border-gray-400/30': variant === 'secondary',
            },

            // Size styles
            {
              'h-14 w-14': size === 'default',
              'h-16 w-16': size === 'lg',
            },

            className
          )}
          ref={ref}
          {...props}
        >
          {icon || <Plus className="h-6 w-6" />}
        </button>

        {/* Desktop version - Only visible on screens >= 1024px */}
        <button
          className={cn(
            // Base styles for desktop
            'hidden lg:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            
            // Variant styles
            {
              'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
              'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            },
            
            // Size styles
            {
              'h-10 px-4 py-2': size === 'default',
              'h-11 px-8 py-2': size === 'lg',
            },
            
            className
          )}
          ref={ref}
          {...props}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </button>
      </>
    )
  }
)

FloatingActionButton.displayName = 'FloatingActionButton'

export { FloatingActionButton }
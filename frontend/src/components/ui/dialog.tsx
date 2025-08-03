import * as React from 'react'
import { cn } from '@/lib/utils'

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
}

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
} | null>(null)

const Dialog: React.FC<DialogProps> = ({ open = false, onOpenChange, children }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
  const context = React.useContext(DialogContext)
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    context?.onOpenChange(true)
  }

  return (
    <button
      ref={ref}
      className={className}
      onClick={handleClick}
      {...props}
    />
  )
})
DialogTrigger.displayName = 'DialogTrigger'

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, onClose, children, ...props }, ref) => {
    const context = React.useContext(DialogContext)

    const handleClose = () => {
      onClose?.()
      context?.onOpenChange(false)
    }

    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose()
      }
    }

    if (!context?.open) return null

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={handleOverlayClick}
      >
        <div
          ref={ref}
          className={cn(
            'relative bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-auto',
            className
          )}
          {...props}
        >
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </div>
    )
  }
)
DialogContent.displayName = 'DialogContent'

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-2',
      className
    )}
    {...props}
  />
))
DialogHeader.displayName = 'DialogHeader'

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = 'DialogDescription'

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-2',
      className
    )}
    {...props}
  />
))
DialogFooter.displayName = 'DialogFooter'

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}

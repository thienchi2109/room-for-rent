'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'default'
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
  isLoading = false
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {variant === 'destructive' && (
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              </div>
            )}
            <div>
              <DialogTitle className={variant === 'destructive' ? 'text-red-900' : ''}>
                {title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-3 text-gray-600">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  title: string
  description?: string
  icon: LucideIcon
}

interface ProgressStepsProps {
  steps: Step[]
  currentStep: number
  className?: string
  variant?: 'default' | 'compact'
}

export function ProgressSteps({ 
  steps, 
  currentStep, 
  className,
  variant = 'default'
}: ProgressStepsProps) {
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                isActive ? "border-blue-500 bg-blue-500 text-white shadow-lg scale-110" :
                isCompleted ? "border-green-500 bg-green-500 text-white" :
                "border-gray-300 bg-white text-gray-400"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-6 h-0.5 mx-1 transition-colors duration-300",
                  isCompleted ? "bg-green-500" : "bg-gray-300"
                )} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = currentStep === step.id
        const isCompleted = currentStep > step.id
        
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center text-center">
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 mb-2",
                isActive ? "border-blue-500 bg-blue-500 text-white shadow-lg scale-110" :
                isCompleted ? "border-green-500 bg-green-500 text-white" :
                "border-gray-300 bg-white text-gray-400"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <div className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  isActive ? "text-blue-600" :
                  isCompleted ? "text-green-600" :
                  "text-gray-500"
                )}>
                  {step.title}
                </div>
                
                {step.description && (
                  <div className="text-xs text-gray-500 max-w-24">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4 transition-colors duration-300 mt-6",
                isCompleted ? "bg-green-500" : "bg-gray-300"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ContractList } from '@/components/contracts'

export default function ContractsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <ContractList />
      </div>
    </ProtectedRoute>
  )
}

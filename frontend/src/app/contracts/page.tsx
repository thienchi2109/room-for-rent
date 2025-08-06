'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ContractList } from '@/components/contracts'

export default function ContractsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <ContractList />
      </div>
    </ProtectedRoute>
  )
}

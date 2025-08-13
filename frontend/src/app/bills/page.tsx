'use client'

import { useState } from 'react'
import { Plus, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { BillList } from '../../components/bills'
import { BillForm } from '../../components/bills/BillForm'
import { GenerateBillsDialog } from '../../components/bills/GenerateBillsDialog'

export default function BillsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QUẢN LÝ HÓA ĐƠN</h1>
          <p className="text-gray-600 mt-1">
            Quản lý hóa đơn thanh toán và doanh thu
          </p>
        </div>
        
        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowGenerateDialog(true)}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Tạo hóa đơn hàng loạt
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo hóa đơn mới
          </Button>
        </div>
      </div>

      {/* Bill List Component */}
      <BillList showHeader={false} />

      {/* Mobile Floating Action Buttons */}
      <div className="lg:hidden">
        <FloatingActionButton
          onClick={() => setShowCreateForm(true)}
          className="bottom-20 right-6"
        >
          <Plus className="w-5 h-5" />
        </FloatingActionButton>
        <FloatingActionButton
          onClick={() => setShowGenerateDialog(true)}
          className="bottom-36 right-6 bg-blue-600 hover:bg-blue-700"
        >
          <Calculator className="w-5 h-5" />
        </FloatingActionButton>
      </div>

      {/* Create Bill Dialog */}
      <BillForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={() => setShowCreateForm(false)}
      />

      {/* Generate Bills Dialog */}
      <GenerateBillsDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
      />
    </div>
  )
}
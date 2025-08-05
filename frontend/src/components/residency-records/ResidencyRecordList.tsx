'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Edit, Trash2, Calendar, FileText, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FloatingActionButton } from '@/components/ui/floating-action-button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ResidencyRecordDialog } from './ResidencyRecordDialog'
import { ResidencyRecordDeleteDialog } from './ResidencyRecordDeleteDialog'
import { useResidencyRecordsByTenant } from '@/hooks/useResidencyRecords'
import {
  ResidencyRecordWithTenant,
  getResidencyTypeLabel,
  isResidencyRecordActive,
  formatResidencyDuration
} from '@/types/residencyRecord'
import { ResidencyType } from '@shared/types/models'

interface ResidencyRecordListProps {
  tenantId: string
  tenantName: string
  showCreateButton?: boolean
}

export function ResidencyRecordList({ 
  tenantId, 
  tenantName, 
  showCreateButton = true 
}: ResidencyRecordListProps) {
  const [editingRecord, setEditingRecord] = useState<ResidencyRecordWithTenant | null>(null)
  const [deletingRecord, setDeletingRecord] = useState<ResidencyRecordWithTenant | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data, isLoading, error } = useResidencyRecordsByTenant(tenantId, {
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Lỗi tải dữ liệu: {error.message}</p>
      </div>
    )
  }

  const records = data?.data || []

  const getStatusBadge = (record: ResidencyRecordWithTenant) => {
    const isActive = isResidencyRecordActive(record)
    
    if (isActive) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Đang diễn ra
        </Badge>
      )
    } else if (record.endDate && new Date(record.endDate) < new Date()) {
      return (
        <Badge variant="secondary">
          Đã kết thúc
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline">
          Chưa bắt đầu
        </Badge>
      )
    }
  }

  const getTypeColor = (type: ResidencyType) => {
    switch (type) {
      case ResidencyType.TEMPORARY_RESIDENCE:
        return 'bg-blue-100 text-blue-800'
      case ResidencyType.TEMPORARY_ABSENCE:
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Lịch sử tạm trú/tạm vắng</h3>
          <p className="text-sm text-gray-600">
            {records.length} bản ghi
          </p>
        </div>

        {showCreateButton && (
          <div className="hidden lg:block">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="sm"
            >
              Thêm bản ghi
            </Button>
          </div>
        )}
      </div>

      {/* Records List */}
      {records.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có bản ghi nào
          </h4>
          <p className="text-gray-600 mb-4">
            Khách thuê này chưa có bản ghi tạm trú hoặc tạm vắng nào.
          </p>
          {showCreateButton && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Tạo bản ghi đầu tiên
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Card key={record.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <Badge className={getTypeColor(record.type)}>
                      {getResidencyTypeLabel(record.type)}
                    </Badge>
                    {getStatusBadge(record)}
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatResidencyDuration(record)}</span>
                  </div>

                  {/* Notes */}
                  {record.notes && (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Ghi chú:</span> {record.notes}
                    </div>
                  )}

                  {/* Created date */}
                  <div className="text-xs text-gray-500">
                    Tạo ngày {format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRecord(record)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingRecord(record)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <ResidencyRecordDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        tenantId={tenantId}
        tenantName={tenantName}
        mode="create"
      />

      {/* Edit Dialog */}
      <ResidencyRecordDialog
        open={!!editingRecord}
        onOpenChange={(open) => !open && setEditingRecord(null)}
        record={editingRecord || undefined}
        mode="edit"
      />

      {/* Delete Dialog */}
      <ResidencyRecordDeleteDialog
        open={!!deletingRecord}
        onOpenChange={(open) => !open && setDeletingRecord(null)}
        record={deletingRecord || undefined}
      />

      {/* Floating Action Button for Mobile */}
      {showCreateButton && (
        <FloatingActionButton
          onClick={() => setIsCreateDialogOpen(true)}
          icon={<Plus className="h-6 w-6" />}
          size="default"
        >
          Thêm bản ghi
        </FloatingActionButton>
      )}
    </div>
  )
}

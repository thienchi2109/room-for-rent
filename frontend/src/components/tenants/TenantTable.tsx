'use client'

import { Phone, MapPin, Calendar, Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TenantWithContracts } from '@/types/tenant'

interface TenantTableProps {
  tenants: TenantWithContracts[]
  onView: (tenant: TenantWithContracts) => void
  onEdit: (tenant: TenantWithContracts) => void
  onDelete: (tenant: TenantWithContracts) => void
}

export function TenantTable({ tenants, onView, onEdit, onDelete }: TenantTableProps) {
  const getActiveContract = (tenant: TenantWithContracts) => {
    return tenant.contracts?.find(ct => ct.contract.status === 'ACTIVE')
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Họ và tên</TableHead>
            <TableHead>CCCD</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Ngày sinh</TableHead>
            <TableHead>Phòng hiện tại</TableHead>
            <TableHead className="w-[120px]">Số hợp đồng</TableHead>
            <TableHead className="text-right w-[200px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Không có khách thuê nào.
              </TableCell>
            </TableRow>
          ) : (
            tenants.map((tenant) => {
              const activeContract = getActiveContract(tenant)
              
              return (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{tenant.fullName}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tenant.hometown}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{tenant.idCard}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {tenant.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(tenant.dateOfBirth).toLocaleDateString('vi-VN')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {activeContract ? (
                      <Badge variant="default">
                        Phòng {activeContract.contract.room.number}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Không thuê
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${(tenant._count?.contracts || 0) > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                      {tenant._count?.contracts || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(tenant)}
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(tenant)}
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(tenant)}
                        title="Xóa"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
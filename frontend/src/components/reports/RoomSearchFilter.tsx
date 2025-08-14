'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Building, Search, Loader2 } from 'lucide-react'
import { useAllRooms } from '@/hooks/useRooms'
import { Room } from '@/types/room'
import { useDebounce } from '@/hooks/useDebounce'

interface RoomSearchFilterProps {
  selectedRoomIds: string[]
  onRoomIdsChange: (roomIds: string[]) => void
  placeholder?: string
}

export function RoomSearchFilter({ 
  selectedRoomIds, 
  onRoomIdsChange, 
  placeholder = "Tìm kiếm phòng theo số phòng..." 
}: RoomSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 250)
  
  // Get all rooms without any filters to ensure we get complete data
  const { data: roomsResponse, isLoading } = useAllRooms()
  const rooms = roomsResponse?.data || []
  
  // Filter rooms based on search term
  const filteredRooms = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return rooms
    }
    
    const searchLower = debouncedSearchTerm.toLowerCase().trim()
    return rooms.filter((room: Room) => 
      room.number.toLowerCase().includes(searchLower) ||
      room.floor.toString().includes(searchLower)
    )
  }, [rooms, debouncedSearchTerm])
  
  // Get selected rooms for display
  const selectedRooms = rooms.filter((room: Room) => selectedRoomIds.includes(room.id))
  
  // Group filtered rooms by floor
  const roomsByFloor = useMemo(() => {
    return filteredRooms.reduce((acc: Record<number, Room[]>, room: Room) => {
      if (!acc[room.floor]) {
        acc[room.floor] = []
      }
      acc[room.floor].push(room)
      return acc
    }, {})
  }, [filteredRooms])
  
  const floors = Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b)
  
  const handleRoomToggle = (roomId: string) => {
    if (selectedRoomIds.includes(roomId)) {
      // Remove room if already selected
      onRoomIdsChange(selectedRoomIds.filter(id => id !== roomId))
    } else {
      // Add room to selection
      onRoomIdsChange([...selectedRoomIds, roomId])
    }
  }
  
  const handleRemoveRoom = (roomId: string) => {
    onRoomIdsChange(selectedRoomIds.filter(id => id !== roomId))
  }
  
  const handleClearAll = () => {
    onRoomIdsChange([])
    setSearchTerm('')
  }
  
  const handleSelectAll = () => {
    const allRoomIds = filteredRooms.map((room: Room) => room.id)
    onRoomIdsChange(allRoomIds)
  }
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.room-search-container')) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-2 room-search-container relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
        {searchTerm && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setSearchTerm('')}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      {/* Results Dropdown */}
      {isOpen && (
        <Card className="absolute z-50 w-full max-h-80 overflow-hidden shadow-lg">
          <CardContent className="p-0">
            {/* Header with actions */}
            <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
              <div className="text-sm font-medium">
                {filteredRooms.length} phòng tìm thấy
              </div>
              <div className="flex items-center space-x-2">
                {filteredRooms.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs h-6"
                  >
                    Chọn tất cả
                  </Button>
                )}
                {selectedRoomIds.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs h-6 text-red-600"
                  >
                    Bỏ chọn
                  </Button>
                )}
              </div>
            </div>
            
            {/* Room List */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  Đang tải danh sách phòng...
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {searchTerm ? 'Không tìm thấy phòng nào' : 'Không có phòng nào'}
                </div>
              ) : (
                floors.map(floor => (
                  <div key={floor}>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
                      Tầng {floor} ({roomsByFloor[floor].length} phòng)
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {roomsByFloor[floor]
                        .sort((a, b) => a.number.localeCompare(b.number))
                        .map((room: Room) => (
                          <div
                            key={room.id}
                            className={`p-2 rounded cursor-pointer transition-colors border ${
                              selectedRoomIds.includes(room.id)
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'hover:bg-muted/50 border-transparent'
                            }`}
                            onClick={() => handleRoomToggle(room.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Building className="w-3 h-3" />
                                <span className="text-sm font-medium">
                                  {room.number}
                                </span>
                              </div>
                              {selectedRoomIds.includes(room.id) && (
                                <Badge variant="secondary" className="text-xs">✓</Badge>
                              )}
                            </div>
                            <div className="mt-1">
                              <Badge 
                                variant={room.status === 'OCCUPIED' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {room.status === 'OCCUPIED' ? 'Đã thuê' : 
                                 room.status === 'AVAILABLE' ? 'Trống' : 
                                 room.status === 'MAINTENANCE' ? 'Bảo trì' : room.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Selected rooms display */}
      {selectedRooms.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Đã chọn {selectedRooms.length} phòng:
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedRooms.map((room: Room) => (
              <Badge 
                key={room.id} 
                variant="secondary" 
                className="text-xs flex items-center space-x-1"
              >
                <Building className="w-3 h-3" />
                <span>Phòng {room.number}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                  onClick={() => handleRemoveRoom(room.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

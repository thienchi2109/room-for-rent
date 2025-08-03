import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserMenu } from '@/components/auth/UserMenu'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Dashboard - Quản lý nhà trọ
                </h1>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Chào mừng đến với hệ thống quản lý nhà trọ!
              </h2>
              <p className="text-gray-600 mb-6">
                Dashboard chính sẽ được phát triển trong các task tiếp theo.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Quản lý phòng</h3>
                  <p className="text-gray-500">Theo dõi tình trạng các phòng trọ</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Quản lý khách thuê</h3>
                  <p className="text-gray-500">Quản lý thông tin khách thuê</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Quản lý hóa đơn</h3>
                  <p className="text-gray-500">Theo dõi thanh toán và hóa đơn</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

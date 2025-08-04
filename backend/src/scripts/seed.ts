import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'Administrator',
      role: 'ADMIN'
    }
  })

  console.log('👤 Created admin user:', adminUser.username)

  // Create default settings
  const defaultSettings = [
    // General settings
    { category: 'general', key: 'facilityName', value: 'Nhà trọ ABC', dataType: 'string' },
    { category: 'general', key: 'address', value: '123 Đường ABC, Quận 1, TP.HCM', dataType: 'string' },
    { category: 'general', key: 'phone', value: '0123456789', dataType: 'string' },
    { category: 'general', key: 'email', value: 'admin@nhatro.com', dataType: 'string' },
    
    // Pricing settings
    { category: 'pricing', key: 'electricPrice', value: '3500', dataType: 'number' },
    { category: 'pricing', key: 'waterPrice', value: '25000', dataType: 'number' },
    { category: 'pricing', key: 'internetFee', value: '100000', dataType: 'number' },
    { category: 'pricing', key: 'cleaningFee', value: '50000', dataType: 'number' },
    
    // AI settings
    { category: 'ai', key: 'enableAiScan', value: 'true', dataType: 'boolean' },
    { category: 'ai', key: 'scanConfidence', value: '0.8', dataType: 'number' },
    { category: 'ai', key: 'maxImageSize', value: '5', dataType: 'number' },
    
    // System settings
    { category: 'system', key: 'currency', value: 'VND', dataType: 'string' },
    { category: 'system', key: 'dateFormat', value: 'DD/MM/YYYY', dataType: 'string' },
    { category: 'system', key: 'language', value: 'vi', dataType: 'string' },
  ]

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: {
        category_key: {
          category: setting.category,
          key: setting.key
        }
      },
      update: {},
      create: setting
    })
  }

  console.log('⚙️ Created default settings')

  // Create sample rooms
  const sampleRooms = [
    { number: '101', floor: 1, area: 20, capacity: 1, basePrice: 2500000 }, // Phòng đơn = 1 người
    { number: '102', floor: 1, area: 25, capacity: 2, basePrice: 3000000 }, // Phòng đôi = 2 người
    { number: '103', floor: 1, area: 20, capacity: 1, basePrice: 2500000 }, // Phòng đơn = 1 người
    { number: '201', floor: 2, area: 30, capacity: 4, basePrice: 3500000 }, // Phòng gia đình = 4 người
    { number: '202', floor: 2, area: 25, capacity: 2, basePrice: 3000000 }, // Phòng đôi = 2 người
  ]

  for (const room of sampleRooms) {
    await prisma.room.upsert({
      where: { number: room.number },
      update: {},
      create: room
    })
  }

  console.log('🏠 Created sample rooms')

  console.log('✅ Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
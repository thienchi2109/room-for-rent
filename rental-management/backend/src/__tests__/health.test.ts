import request from 'supertest'
import app from '../index'

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)

    expect(response.body).toHaveProperty('status', 'OK')
    expect(response.body).toHaveProperty('timestamp')
    expect(response.body).toHaveProperty('environment')
  })

  it('should return API info', async () => {
    const response = await request(app)
      .get('/api')
      .expect(200)

    expect(response.body).toHaveProperty('message', 'Rental Management API Server')
  })
})
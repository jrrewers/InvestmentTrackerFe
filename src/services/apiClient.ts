import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      throw new Error(`API Error ${status}: ${data?.message || error.message}`)
    } else if (error.request) {
      // Network error
      throw new Error('Network error: Unable to connect to server')
    } else {
      // Other error
      throw new Error(`Request error: ${error.message}`)
    }
  }
)

export default apiClient

import odooapi from './axios'
export const getAssetDepartments = () =>
  odooapi.get('/api/assets/departments')

export const getAssetProducts = (search = '', departmentId = '') =>
  odooapi.get('/api/assets/products', {
    params: {
      search,
      department_id: departmentId
    }
  })

export const createAssetRequest = (payload) =>
  odooapi.post('/api/assets/requests/create', payload)

export const getMyAssetRequests = () =>
  odooapi.get('/api/assets/requests/my')

export const getAssetRequests = (state = 'all') =>
  odooapi.get('/api/assets/requests', {
    params: { state }
  })

export const getAssetRequestDetail = (id) =>
  odooapi.get(`/api/assets/requests/${id}`)

export const validateAssetRequest = (id) =>
  odooapi.post(`/api/assets/requests/${id}/validate`)

export const cancelAssetRequest = (id) =>
  odooapi.post(`/api/assets/requests/${id}/cancel`)

export const getAssetRequestStates = () =>
  odooapi.get('/api/assets/requests/states')

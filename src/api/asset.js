
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
 

export const getAssetRequestDetail = (id) =>
  odooapi.get(`/api/assets/requests/${id}`)

export const validateAssetRequest = (id) =>
  odooapi.post(`/api/assets/requests/${id}/validate`)

// Return asset request
export const returnAssetRequest = (id) => {
  return odooapi.post(`/api/assets/requests/${id}/return`)
}
export const cancelAssetRequest = (id) =>
  odooapi.post(`/api/assets/requests/${id}/cancel`)

export const getAssetRequestStates = () =>
  odooapi.get('/api/assets/requests/states')
// =====================================================
// ADMIN: ALL ASSET REQUESTS
// =====================================================

export const getAssetRequests = (params = {}) => {
  return odooapi.get('/api/assets/requests', { params })
}


// =====================================================
// ADMIN: ALL INTERNAL TRANSFERS
// =====================================================

export const getInternalTransfers = (params = {}) => {
  return odooapi.get('/api/assets/internal-transfers', { params })
}

export const getInternalTransferDetail = id => {
  return odooapi.get(`/api/assets/internal-transfers/${id}`)
}

export const validateInternalTransfer = id => {
  return odooapi.post(`/api/assets/internal-transfers/${id}/validate`)
}

export const cancelInternalTransfer = id => {
  return odooapi.post(`/api/assets/internal-transfers/${id}/cancel`)
}


// =====================================================
// ADMIN: PRODUCT MANAGEMENT
// =====================================================

 
export const getAdminAssetProductOptions = () =>
  odooapi.get('/api/assets/admin/product-options')

export const setAdminAssetProductActive = (id, active) => {
  return odooapi.put(`/api/assets/admin/products/${id}/active`, {
    active 
  })
}

// Product management
export const getAdminAssetProducts = params =>
  odooapi.get('/api/assets/admin/products', { params })

export const createAdminAssetProduct = data =>
  odooapi.post('/api/assets/admin/products/create', data)

export const updateAdminAssetProduct = (id, data) =>
  odooapi.put(`/api/assets/admin/products/${id}`, data)

export const updateAdminAssetProductActive = (id, active) =>
  odooapi.put(`/api/assets/admin/products/${id}/active`, { active })

// Stock adjustment
export const adjustAssetStock = data =>
  odooapi.post('/api/assets/admin/stock/adjust', data)

// Internal transfer
export const getAssetEmployees = () =>
  odooapi.get('/api/assets/admin/employees')

export const getAssetLocations = () =>
  odooapi.get('/api/assets/admin/locations')

export const createAssetInternalTransfer = data =>
  odooapi.post('/api/assets/admin/internal-transfers/create', data)

export const scanAssetProduct = (code) => {
  return odooapi.get('/api/assets/products/scan', {
    params: { code }
  })
}
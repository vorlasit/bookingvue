
import odooapi from './axios'

export const getBookingReport = async (params = {}) => {
  const response = await odooapi.get('/api/booking/report', {
    params
  })

  return response.data
}

export const getBookingReportDetails = async (params = {}) => {
  const response = await odooapi.get('/api/booking/report/details', {
    params
  })

  return response.data
}
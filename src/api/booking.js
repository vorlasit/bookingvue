import api from './axios'

export const getBookings = async () => {
    const response = await api.get('/bookings')
    return response.data
}

export const getBooking = async (id) => {
    const response = await api.get(`/bookings/${id}`)
    return response.data
}

export const createBooking = async (data) => {
    const response = await api.post('/bookings', data)
    return response.data
}

export const updateBooking = async (id, data) => {
    const response = await api.put(`/bookings/${id}`, data)
    return response.data
}

export const cancelBooking = async (id) => {
    const response = await api.post(`/bookings/${id}/cancel`)
    return response.data
}

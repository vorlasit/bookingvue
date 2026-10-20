import api from './axios'

export const loginApi = async (username, password) => {

    const response = await api.post('/api/user/login1', {
        username: username,
        password: password,
    })

    return response.data
}

import axios from 'axios'

const odooapi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://160.191.178.161:8888'),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
})
 
export const loginUser = async (login, password) => {
  const response = await odooapi.post('/api/user/login1', {
    login,
    password,
  })

  return response.data.result
}


export const getUserInfo = async (token) => {
  const response = await odooapi.get('/api/user/info', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data.result
}
 
export const getLogout = async (token) => {
  const response = await odooapi.get('/api/user/logout', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data.result
}

export const getCompanyLogo = async () => {
  const response = await odooapi.get('/api/company/logo/image', {
    responseType: 'blob',
  })

  return response.data
  }
  // Add Bearer token automatically
  odooapi.interceptors.request.use(
      (config) => {
          const token = localStorage.getItem('user-token')

          if (token) {
              config.headers.Authorization = `Bearer ${token}`
          }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)


// Get current booking events
export const getEvents = async () => {

    const response = await odooapi.get('/api/booking/events/nows')

    return response.data
}
export const getBookingCounts = async () => {
    const response = await odooapi.get('/api/booking/events/count' ) 
    return response.data
}
export const getEventsByState = async (state) => {
  const response = await odooapi.get(
    "/api/booking/events/state",
    {
      params: {
        confirmed_state: state,
      },
    }
  )
 
  return response.data
}

export const getAvailableCars = async () => {
  const response = await odooapi.get('/api/booking/cars')
  return response.data
}

export const createBookingEvent = async (data) => {
  const response = await odooapi.post('/api/booking/events/create', data)
  return response.data
}
export const getEventDetail = async (id) => {
  const response = await odooapi.get(`/api/booking/events/detail/${id}`)
  return response.data
}
export const startBookingTripAPI = async (data) => {
  const response = await odooapi.post('/api/booking/events/start', data)
  return response.data
}
export const approveBooking = async (bookingId) => {
  const response = await odooapi.post("/api/booking/approve", {
    booking_id: bookingId,
  });

  return response.data;
};
export const getHistory = async () => {
  const response = await odooapi.get(`/api/booking/events/history`)
  return response.data
}
export const getActiveTrips = async () => {
  const response = await odooapi.get(`/api/booking/events/active`)
  return response.data
}
export const getActiveEvents = async (id) => {
  const response = await odooapi.get(`/api/booking/active/user`)
  return response.data
}
export const getRequests = async (id) => {
  const response = await odooapi.get(`/api/booking/requests`)
  return response.data
} 

export const getGroups = async () => {
  const response = await odooapi.get(`/api/user/groups`)
  return response.data
}
export const getBookingDashboard = async () => { 
  const response = await odooapi.get("/api/booking/dashboard"); 
  return response.data;
};


export const updateBookingCar = async (bookingId, carId) => {
  const response = await odooapi.put(
    `/api/booking/${bookingId}/car`,
    {
      booking_id: carId,
    }
  );

  return response.data;
};
 

export const reportBookingProblem = async (
  bookingId,
  problemDescription,
  attachmentFile = null
) => {
  let attachment_datas = null;
  let attachment_name = null;

  if (attachmentFile) {
    attachment_datas = await fileToBase64(attachmentFile);
    attachment_name = attachmentFile.name;
  }

  const response = await odooapi.post(
    "/api/booking/events/problem",
    {
      id: bookingId,
      problem_description: problemDescription,
      attachment_datas,
      attachment_name,
    }
  );

  return response.data;
};


export const returnBookingCar = async (
  bookingId,
  mileAfter,
  durationTime,
  imageMileAfter = null
) => {
  let image_mile_after = null;

  if (imageMileAfter) {
    image_mile_after = await fileToBase64(imageMileAfter);
  }

  const response = await odooapi.post(
    "/api/booking/events/return",
    {
      booking_id: bookingId,
      mile_after: mileAfter,
      duration_time: durationTime,
      image_mile_after,
    }
  );

  return response.data;
};


const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      // Remove "data:image/jpeg;base64," prefix
      const result = reader.result;
      resolve(result.split(",")[1]);
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
};
export const receiveBookingCar = async (bookingId) => {
  const response = await odooapi.post(
    "/api/booking/events/stop",
    {
      booking_id: bookingId,
    }
  );

  return response.data;
};

export const updateBookingToWaiting = async (bookingId) => {
  const response = await odooapi.post('/api/booking/waiting', {
    booking_id: bookingId,
  })

  return response.data
}
export const getAvailableDrivers = async () => {
  const response = await odooapi.get("/api/booking/drivers");
  return response.data;
};
export const updateBookingDriver = async (bookingId, driverId) => {
  const response = await odooapi.post(
    "/api/booking/events/driver",
    {
      booking_id: bookingId,
      driver_id: driverId,
    }
  );

  return response.data;
};

export const nonApproveBooking = async (bookingId, remark) => {
  const response = await odooapi.post(
    "/api/booking/events/non_approve",
    {
      booking_id: bookingId,
      remark:  remark,

    }
  );

  return response.data;
};


export const getCars = async () => {
  const response = await odooapi.get('/api/booking/carsall')
  return response.data
}

export const getCar = async (carId) => {
  const response = await odooapi.get(`/api/booking/cars/${carId}`)
  return response.data
}

export const createCar = async (data) => {
  const response = await odooapi.post('/api/booking/cars', data)
  return response.data
}

export const updateCar = async (carId, data) => {
  const response = await odooapi.put(
    `/api/booking/cars/${carId}`,
    data
  )
  return response.data
}

export const deleteCar = async (carId) => {
  const response = await odooapi.delete(
    `/api/booking/cars/${carId}`
  )
  return response.data
}
export const getBookingUsers = async () => {
  const response = await odooapi.get('/api/booking/users')
  return response.data
}
export const getBookingIncidents = async () => {
  try {
    const response = await odooapi.get('/api/booking/booking_id/incidents')
    return response.data
  } catch (error) {
    console.error('Error fetching booking incidents:', error)
    throw error
  }
}
export const getUserProfile = async () => {
  try {
    const response = await odooapi.get('/api/user/profile')
    return response.data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}
export const getNotifications = async (limit = 20) => {
  const response = await odooapi.get(
    `/api/booking/notifications?limit=${limit}`
  );

  return response.data;
};


export const getNotificationUnreadCount = async () => {
  const response = await odooapi.get(
    "/api/booking/notifications/unread-count"
  );

  return response.data;
};
export const getNotiDraftCount = async () => {
  const response = await odooapi.get(
          "/api/booking/events/draft_count"
  );

  return response.data;
};
export const getNotiDraft = async () => {
  const response = await odooapi.get(
          "/api/booking/events/drafts"
  );

  return response.data;
};


export const markNotificationRead = async (notificationId) => {
  const response = await odooapi.post(
    `/api/booking/notifications/${notificationId}/read`
  );

  return response.data;
};


export const markAllNotificationsRead = async () => {
  const response = await odooapi.post(
    "/api/booking/notifications/read-all"
  );

  return response.data;
};
export const getRoomTypes = async () => {
  const response = await odooapi.get(
    "/api/booking/roomtype"
  );

  return response.data;
};
export const getRoomBookings = async (bookingId) => {
  const response = await odooapi.get('/api/room/events', {
    params: {
      booking_id: bookingId,
    },
  })
  return response.data
}

export const CreateBookroom = async (payload) => {
  const response = await odooapi.post('/api/room/bookings/create', payload);
  return response.data
}


export const getRoomBookingManagement = async () => {
  const response = await odooapi.get('/api/room/events/management')
  return response.data
}

export const updateRoomBooking = async (bookingData) => {
  const response = await odooapi.put(
    '/api/room/events/update',
    bookingData,
  )
  return response.data
}

export const confirmRoomBooking = async (bookingId) => {
  const response = await odooapi.post('/api/room/events/confirm', {
    id: bookingId,
  })
  return response.data
}

export const cancelRoomBooking = async (bookingId) => {
  const response = await odooapi.post('/api/room/events/cancel', {
    id: bookingId,
  })
  return response.data
}

export const doneRoomBooking = async (bookingId) => {
  const response = await odooapi.post('/api/room/events/done', {
    id: bookingId,
  })
  return response.data
}

export const deleteRoomBooking = async (bookingId) => {
  const response = await odooapi.delete('/api/room/events/delete', {
    data: { id: bookingId },
  })
  return response.data
}

export const getRoomManagement = async () => {
  const response = await odooapi.get("/api/room/management");
  return response.data;
};

export const getRoomManagementDetail = async (id) => {
  const response = await odooapi.get("/api/room/management/detail", {
    params: { id },
  });
  return response.data;
};

export const createRoomManagement = async (payload) => {
  const response = await odooapi.post(
    "/api/room/management/create",
    payload
  );
  return response.data;
};

export const updateRoomManagement = async (payload) => {
  const response = await odooapi.put(
    "/api/room/management/update",
    payload
  );
  return response.data;
};

export const deleteRoomManagement = async (id) => {
  const response = await odooapi.delete(
    "/api/room/management/delete",
    {
      params: { id },
    }
  );
  return response.data;
};
 
export default odooapi

import axios from 'axios';

const BASE_URL = 'http://localhost:8280';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Функции для работы с Classroom
export const createClassroom = (classroom) => apiClient.post('/api/classrooms', classroom);
export const getClassroomById = (id) => apiClient.get(`/api/classrooms/${id}`);

// Функции для работы с Schedule
export const createSchedule = (schedule) => apiClient.post('/api/schedules', schedule);
export const updateSchedule = (id, schedule) => apiClient.put(`/api/schedules/${id}`, schedule);
export const deleteSchedule = (id) => apiClient.delete(`/api/schedules/${id}`);
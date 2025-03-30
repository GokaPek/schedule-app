import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

// Создаем единый экземпляр axios с настройками
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Важно для CORS и кук
  headers: {
    'Content-Type': 'application/json',
  },
});

// Функции для работы с Classroom
export const getClassroomById = (id) => apiClient.get(`/classrooms/${id}`);
export const createClassroom = (classroom) => apiClient.post('/classrooms', classroom);
export const getAllClassrooms = (page = 0, size = 10) => apiClient.get('/classrooms', { params: { page, size } });

// Функции для работы с Schedule
export const createSchedule = (schedule) => apiClient.post('/schedules', schedule);
export const updateSchedule = (id, schedule) => apiClient.put(`/schedules/${id}`, schedule);
export const deleteSchedule = (id) => apiClient.delete(`/schedules/${id}`);
export const getScheduleByGroupId = (groupId) => apiClient.get(`/schedules/group/${groupId}`);
export const getScheduleByTeacherId = (teacherId) => apiClient.get(`/schedules/teacher/${teacherId}`);
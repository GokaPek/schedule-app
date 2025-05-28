import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  console.log('Отправляем токен:', token ? `Bearer ${token}` : 'нет токена');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

/**
 * Проверяет токен и сохраняет его, если он валиден
 */
export async function checkAndStoreToken(rawToken) {
  const token = `Bearer ${rawToken}`;
  try {
    const response = await axios.get(`${BASE_URL}/auth/check`, {
      headers: {
        'Authorization': token
      }
    });
    console.log('Токен валиден');
    localStorage.setItem('token', rawToken);
    return true;
  } catch (error) {
    console.error('Неверный токен:', error.response?.data || error.message);
    return false;
  }
}



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
export const autoGenerate = () => apiClient.post(`/schedules/auto-generate`);
export const downloadSchedulePdf = (groupId) =>
  apiClient.get(`/schedules/download/${groupId}`, { responseType: 'blob' });

// Функции для работы с дисциплинами
export const getAllDisciplines = () => apiClient.get('/disciplines');

// Groups
export const createGroup = (group) => apiClient.post('/groups', group);
export const updateGroup = (id, group) => apiClient.put(`/groups/${id}`, group);
export const deleteGroup = (id) => apiClient.delete(`/groups/${id}`);
export const getAllGroups = () => apiClient.get('/groups');
// Teachers
export const createTeacher = (teacher) => apiClient.post('/teachers', teacher);
export const updateTeacher = (id, teacher) => apiClient.put(`/teachers/${id}`, teacher);
export const deleteTeacher = (id) => apiClient.delete(`/teachers/${id}`);
export const getAllTeachers = () => apiClient.get('/teachers');
// Faculties
export const createFaculty = (faculty) => apiClient.post('/faculties', faculty);
export const updateFaculty = (id, faculty) => apiClient.put(`/faculties/${id}`, faculty);
export const deleteFaculty = (id) => apiClient.delete(`/faculties/${id}`);
export const getAllFacultys = () => apiClient.get('/faculties');
// Departments
export const createDepartment = (department) => apiClient.post('/departments', department);
export const updateDepartment = (id, department) => apiClient.put(`/departments/${id}`, department);
export const deleteDepartment = (id) => apiClient.delete(`/departments/${id}`);
export const getAllDepartments = () => apiClient.get('/departments');
// Directions
export const createDirection = (direction) => apiClient.post('/directions', direction);
export const updateDirection = (id, direction) => apiClient.put(`/directions/${id}`, direction);
export const deleteDirection = (id) => apiClient.delete(`/directions/${id}`);
export const getAllDirections = () => apiClient.get('/directions');
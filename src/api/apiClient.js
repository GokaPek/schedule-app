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
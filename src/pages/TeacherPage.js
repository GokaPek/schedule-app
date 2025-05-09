import React, { useEffect, useState } from 'react';
import { getAllDepartments } from '../api/apiClient';
import { getAllTeachers, createTeacher, updateTeacher, deleteTeacher } from '../api/apiClient';

const TeacherPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ 
    id: null, 
    firstName: '', 
    lastName: '', 
    departmentId: '',
    time_limit: 0 // Добавлено поле для ограничения времени
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [teachersRes, departmentsRes] = await Promise.all([
        getAllTeachers(),
        getAllDepartments()
      ]);
      setTeachers(teachersRes.data);
      setDepartments(departmentsRes.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await updateTeacher(form.id, form);
      } else {
        await createTeacher(form);
      }
      setForm({ 
        id: null, 
        firstName: '', 
        lastName: '', 
        departmentId: '',
        time_limit: 0 
      });
      await loadData();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleEdit = (teacher) => {
    setForm({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      departmentId: teacher.departmentId,
      time_limit: teacher.time_limit || 0 // Устанавливаем текущее значение
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены?')) {
      try {
        console.log('Пытаюсь удалить элемент с ID:', id); // Логируем ID
        const response = await deleteTeacher(id);
        console.log('Ответ сервера:', response); // Логируем полный ответ
        setTeachers(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        console.error('Полная ошибка удаления:', {
          message: error.message,
          response: error.response,
          stack: error.stack
        });
      }
    }
  };
  
  const filteredTeachers = teachers.filter(teacher => {
    const fullName = `${teacher.lastName} ${teacher.firstName}`.toLowerCase();
    const department = departments.find(d => d.id === teacher.departmentId)?.name || '';
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">
            <i className="fas fa-chalkboard-teacher me-2"></i>
            Управление преподавателями
          </h2>
        </div>
        
        <div className="card-body">
          {/* Форма добавления/редактирования */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Фамилия</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Введите фамилию"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Имя</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Введите имя"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              
              <div className="col-md-3">
                <label className="form-label">Кафедра</label>
                <select
                  className="form-select"
                  value={form.departmentId}
                  onChange={e => setForm({ ...form, departmentId: e.target.value })}
                  required
                >
                  <option value="">Выберите кафедру</option>
                  {departments.map(d => 
                    <option key={d.id} value={d.id}>{d.name}</option>
                  )}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label">Лимит часов</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Часы"
                  min="0"
                  value={form.time_limit}
                  onChange={(e) => setForm({ ...form, time_limit: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div className="col-md-1 d-flex align-items-end">
                <button 
                  type="submit" 
                  className={`btn w-100 ${form.id ? 'btn-warning' : 'btn-success'}`}
                >
                  <i className={`fas ${form.id ? 'fa-sync' : 'fa-plus'}`}></i>
                </button>
              </div>
            </div>
          </form>

          {/* Поиск */}
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Поиск по имени или кафедре..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {/* Список преподавателей */}
          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th width="50">ID</th>
                    <th>Преподаватель</th>
                    <th>Кафедра</th>
                    <th>Лимит часов</th>
                    <th width="120" className="text-end">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map(teacher => {
                      const department = departments.find(d => d.id === teacher.departmentId);
                      return (
                        <tr key={teacher.id}>
                          <td className="text-muted">{teacher.id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-circle bg-primary text-white me-3">
                                {teacher.lastName.charAt(0)}{teacher.firstName.charAt(0)}
                              </div>
                              <div>
                                <strong>{teacher.lastName}</strong> {teacher.firstName}
                              </div>
                            </div>
                          </td>
                          <td>
                            {department ? (
                              <span className="badge bg-info text-dark">
                                <i className="fas fa-university me-1"></i>
                                {department.name}
                              </span>
                            ) : (
                              <span className="text-muted">Не указана</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${teacher.time_limit > 0 ? 'bg-success' : 'bg-secondary'}`}>
                              {teacher.time_limit || 'Не задан'}
                            </span>
                          </td>
                          <td className="text-end">
                            <button 
                              onClick={() => handleEdit(teacher)}
                              className="btn btn-sm btn-outline-primary me-2"
                              title="Редактировать"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              onClick={() => handleDelete(teacher.id)}
                              className="btn btn-sm btn-outline-danger"
                              title="Удалить"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        {searchTerm ? 'Ничего не найдено' : 'Список преподавателей пуст'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="card-footer bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Всего преподавателей: {teachers.length}
              {searchTerm && ` (Найдено: ${filteredTeachers.length})`}
            </small>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={loadData}
            >
              <i className="fas fa-sync me-1"></i>
              Обновить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
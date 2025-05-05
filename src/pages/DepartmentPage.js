import React, { useEffect, useState } from 'react';
import { getAllFacultys } from '../api/apiClient';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '../api/apiClient';

const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', facultyId: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [departmentsRes, facultiesRes] = await Promise.all([
        getAllDepartments(),
        getAllFacultys()
      ]);
      setDepartments(departmentsRes.data);
      setFaculties(facultiesRes.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await updateDepartment(form.id, form);
      } else {
        await createDepartment(form);
      }
      setForm({ id: null, name: '', facultyId: '' });
      await loadData();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleEdit = (department) => {
    setForm(department);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту кафедру?')) {
      try {
        await deleteDepartment(id);
        await loadData();
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  const filteredDepartments = departments.filter(department => {
    const departmentName = department.name.toLowerCase();
    const faculty = faculties.find(f => f.id === department.facultyId)?.name.toLowerCase() || '';
    return (
      departmentName.includes(searchTerm.toLowerCase()) ||
      faculty.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">
            <i className="fas fa-building me-2"></i>
            Управление кафедрами
          </h2>
        </div>
        
        <div className="card-body">
          {/* Форма добавления/редактирования */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label className="form-label">Название кафедры</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Введите название кафедры"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Факультет</label>
                <select
                  className="form-select"
                  value={form.facultyId}
                  onChange={e => setForm({ ...form, facultyId: e.target.value })}
                  required
                >
                  <option value="">Выберите факультет</option>
                  {faculties.map(f => 
                    <option key={f.id} value={f.id}>{f.name}</option>
                  )}
                </select>
              </div>
              
              <div className="col-md-2">
                <button 
                  type="submit" 
                  className={`btn w-100 ${form.id ? 'btn-warning' : 'btn-success'}`}
                >
                  <i className={`fas ${form.id ? 'fa-sync' : 'fa-plus'} me-1`}></i>
                  {form.id ? 'Обновить' : 'Добавить'}
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
                placeholder="Поиск по кафедре или факультету..."
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

          {/* Список кафедр */}
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
                    <th>Кафедра</th>
                    <th>Факультет</th>
                    <th width="120" className="text-end">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.length > 0 ? (
                    filteredDepartments.map(department => {
                      const faculty = faculties.find(f => f.id === department.facultyId);
                      return (
                        <tr key={department.id}>
                          <td className="text-muted">{department.id}</td>
                          <td>
                            <span className="badge bg-primary rounded-pill me-2">
                              <i className="fas fa-building me-1"></i>
                            </span>
                            <strong>{department.name}</strong>
                          </td>
                          <td>
                            {faculty ? (
                              <span className="badge bg-info text-dark">
                                {faculty.name}
                              </span>
                            ) : (
                              <span className="text-muted">Не указан</span>
                            )}
                          </td>
                          <td className="text-end">
                            <button 
                              onClick={() => handleEdit(department)}
                              className="btn btn-sm btn-outline-primary me-2"
                              title="Редактировать"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              onClick={() => handleDelete(department.id)}
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
                      <td colSpan="4" className="text-center py-4 text-muted">
                        {searchTerm ? 'Ничего не найдено' : 'Список кафедр пуст'}
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
              Всего кафедр: {departments.length}
              {searchTerm && ` (Найдено: ${filteredDepartments.length})`}
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

export default DepartmentPage;
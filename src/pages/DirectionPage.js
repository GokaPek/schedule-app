import React, { useEffect, useState } from 'react';
import {
  getAllDirections,
  createDirection,
  updateDirection,
  deleteDirection,
  getAllDepartments,
} from '../api/apiClient';

const DirectionPage = () => {
  const [directions, setDirections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', departmentId: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [directionsRes, departmentsRes] = await Promise.all([
        getAllDirections(),
        getAllDepartments()
      ]);
      setDirections(directionsRes.data);
      setDepartments(departmentsRes.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await updateDirection(form.id, form);
      } else {
        await createDirection(form);
      }
      setForm({ id: null, name: '', departmentId: '' });
      await loadData();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleEdit = (direction) => {
    setForm(direction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить это направление?')) {
      try {
        await deleteDirection(id);
        await loadData();
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  const filteredDirections = directions.filter(direction => {
    const directionName = direction.name.toLowerCase();
    const department = departments.find(d => d.id === direction.departmentId)?.name.toLowerCase() || '';
    return (
      directionName.includes(searchTerm.toLowerCase()) ||
      department.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">
            <i className="fas fa-graduation-cap me-2"></i>
            Управление направлениями подготовки
          </h2>
        </div>
        
        <div className="card-body">
          {/* Форма добавления/редактирования */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label className="form-label">Название направления</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Например, Информатика и вычислительная техника"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Кафедра</label>
                <select
                  className="form-select"
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  required
                >
                  <option value="">Выберите кафедру</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
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
                placeholder="Поиск по направлению или кафедре..."
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

          {/* Список направлений */}
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
                    <th>Направление</th>
                    <th>Кафедра</th>
                    <th width="120" className="text-end">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDirections.length > 0 ? (
                    filteredDirections.map(direction => {
                      const department = departments.find(d => d.id === direction.departmentId);
                      return (
                        <tr key={direction.id}>
                          <td className="text-muted">{direction.id}</td>
                          <td>
                            <span className="badge bg-primary rounded-pill me-2">
                              <i className="fas fa-graduation-cap"></i>
                            </span>
                            <strong>{direction.name}</strong>
                          </td>
                          <td>
                            {department ? (
                              <span className="badge bg-info text-dark">
                                <i className="fas fa-building me-1"></i>
                                {department.name}
                              </span>
                            ) : (
                              <span className="text-muted">Не указана</span>
                            )}
                          </td>
                          <td className="text-end">
                            <button 
                              onClick={() => handleEdit(direction)}
                              className="btn btn-sm btn-outline-primary me-2"
                              title="Редактировать"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              onClick={() => handleDelete(direction.id)}
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
                        {searchTerm ? 'Ничего не найдено' : 'Список направлений пуст'}
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
              Всего направлений: {directions.length}
              {searchTerm && ` (Найдено: ${filteredDirections.length})`}
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

export default DirectionPage;
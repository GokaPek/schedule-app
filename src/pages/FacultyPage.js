import React, { useEffect, useState } from 'react';
import { getAllFacultys, createFaculty, updateFaculty, deleteFaculty } from '../api/apiClient';

const FacultyPage = () => {
  const [faculties, setFaculties] = useState([]);
  const [form, setForm] = useState({ id: null, name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { 
    loadFaculties(); 
  }, []);

  const loadFaculties = async () => {
    setIsLoading(true);
    try {
      const { data } = await getAllFacultys();
      setFaculties(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await updateFaculty(form.id, form);
      } else {
        await createFaculty(form);
      }
      setForm({ id: null, name: '' });
      await loadFaculties();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleEdit = (faculty) => setForm(faculty);
  
  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот факультет?')) {
      try {
        await deleteFaculty(id);
        await loadFaculties();
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  const filteredFaculties = faculties.filter(faculty =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">
            <i className="fas fa-university me-2"></i>
            Управление факультетами
          </h2>
        </div>
        
        <div className="card-body">
          {/* Форма добавления/редактирования */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-8">
                <label htmlFor="facultyName" className="form-label">Название факультета</label>
                <input
                  id="facultyName"
                  type="text"
                  className="form-control"
                  placeholder="Введите название факультета"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4">
                <button 
                  type="submit" 
                  className={`btn w-100 ${form.id ? 'btn-warning' : 'btn-success'}`}
                >
                  <i className={`fas ${form.id ? 'fa-sync' : 'fa-plus'} me-2`}></i>
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
                placeholder="Поиск факультетов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Список факультетов */}
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
                    <th>Название</th>
                    <th width="120" className="text-end">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaculties.length > 0 ? (
                    filteredFaculties.map(faculty => (
                      <tr key={faculty.id}>
                        <td className="text-muted">{faculty.id}</td>
                        <td>
                          <span className="d-flex align-items-center">
                            <i className="fas fa-university text-primary me-2"></i>
                            {faculty.name}
                          </span>
                        </td>
                        <td className="text-end">
                          <button 
                            onClick={() => handleEdit(faculty)}
                            className="btn btn-sm btn-outline-primary me-2"
                            title="Редактировать"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={() => handleDelete(faculty.id)}
                            className="btn btn-sm btn-outline-danger"
                            title="Удалить"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-muted">
                        {searchTerm ? 'Ничего не найдено' : 'Список факультетов пуст'}
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
              Всего факультетов: {faculties.length}
            </small>
            {searchTerm && (
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSearchTerm('')}
              >
                <i className="fas fa-times me-1"></i>
                Сбросить поиск
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyPage;
import React, { useEffect, useState } from 'react';
import { getAllDirections } from '../api/apiClient';
import { getAllGroups, createGroup, updateGroup, deleteGroup } from '../api/apiClient';

const GroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [directions, setDirections] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', directionId: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [groupsRes, directionsRes] = await Promise.all([
        getAllGroups(),
        getAllDirections()
      ]);
      setGroups(groupsRes.data);
      setDirections(directionsRes.data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await updateGroup(form.id, form);
      } else {
        await createGroup(form);
      }
      setForm({ id: null, name: '', directionId: '' });
      await loadData();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleEdit = (group) => {
    setForm(group);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту группу?')) {
      try {
        await deleteGroup(id);
        await loadData();
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  const filteredGroups = groups.filter(group => {
    const groupName = group.name.toLowerCase();
    const direction = directions.find(d => d.id === group.directionId)?.name.toLowerCase() || '';
    return (
      groupName.includes(searchTerm.toLowerCase()) ||
      direction.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">
            <i className="fas fa-users me-2"></i>
            Управление группами
          </h2>
        </div>
        
        <div className="card-body">
          {/* Форма добавления/редактирования */}
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label">Название группы</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Например, ИВТ-41"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="col-md-5">
                <label className="form-label">Направление подготовки</label>
                <select
                  className="form-select"
                  value={form.directionId}
                  onChange={e => setForm({ ...form, directionId: e.target.value })}
                  required
                >
                  <option value="">Выберите направление</option>
                  {directions.map(d => 
                    <option key={d.id} value={d.id}>{d.name}</option>
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
                placeholder="Поиск по группе или направлению..."
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

          {/* Список групп */}
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
                    <th>Группа</th>
                    <th>Направление</th>
                    <th width="120" className="text-end">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map(group => {
                      const direction = directions.find(d => d.id === group.directionId);
                      return (
                        <tr key={group.id}>
                          <td className="text-muted">{group.id}</td>
                          <td>
                            <span className="badge bg-primary rounded-pill me-2">
                              <i className="fas fa-users me-1"></i>
                            </span>
                            <strong>{group.name}</strong>
                          </td>
                          <td>
                            {direction ? (
                              <span className="badge bg-info text-dark">
                                {direction.name}
                              </span>
                            ) : (
                              <span className="text-muted">Не указано</span>
                            )}
                          </td>
                          <td className="text-end">
                            <button 
                              onClick={() => handleEdit(group)}
                              className="btn btn-sm btn-outline-primary me-2"
                              title="Редактировать"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              onClick={() => handleDelete(group.id)}
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
                        {searchTerm ? 'Ничего не найдено' : 'Список групп пуст'}
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
              Всего групп: {groups.length}
              {searchTerm && ` (Найдено: ${filteredGroups.length})`}
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

export default GroupPage;
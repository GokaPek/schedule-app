import React, { useState, useEffect } from 'react';
import { 
  createClassroom, 
  getClassroomById, 
  getAllClassrooms,
  deleteClassroom 
} from '../api/apiClient';

const ClassroomPage = () => {
  const [classroom, setClassroom] = useState({ name: '', type: '' });
  const [classroomId, setClassroomId] = useState('');
  const [fetchedClassroom, setFetchedClassroom] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Проверяем наличие токена для отображения элементов управления
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        const response = await getAllClassrooms(page, size);
        setClassrooms(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        showError(`Ошибка при загрузке аудиторий: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchClassrooms();
  }, [page, size]);

  const handleCreateClassroom = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      await createClassroom(classroom);
      showSuccess('Аудитория успешно создана!');
      setClassroom({ name: '', type: '' });
      const response = await getAllClassrooms(page, size);
      setClassrooms(response.data.content);
    } catch (error) {
      showError(`Ошибка при создании аудитории: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetClassroom = async () => {
    try {
      setLoading(true);
      const response = await getClassroomById(classroomId);
      setFetchedClassroom(response.data);
      showSuccess('Аудитория найдена!');
    } catch (error) {
      showError(`Аудитория не найдена: ${error.response?.data?.message || error.message}`);
      setFetchedClassroom(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClassroom = async (id) => {
    if (!isAuthenticated) return;

    if (!window.confirm('Вы уверены, что хотите удалить эту аудиторию?')) {
      return;
    }
    try {
      setLoading(true);
      await deleteClassroom(id);
      showSuccess('Аудитория успешно удалена!');
      const response = await getAllClassrooms(page, size);
      setClassrooms(response.data.content);
      setTotalPages(response.data.totalPages);
      if (fetchedClassroom && fetchedClassroom.id === id) {
        setFetchedClassroom(null);
      }
    } catch (error) {
      showError(`Ошибка при удалении аудитории: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="classroom-management">
      {/* Уведомления */}
      {error && isAuthenticated && (
        <div className="alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      {success && isAuthenticated && (
        <div className="alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}

      <main className="container py-4">
        <div className="page-header mb-4">
          <h1 className="display-5 fw-bold">
            <i className="fas fa-door-open text-primary me-2"></i>
            Управление аудиториями
          </h1>
          <p className="lead">Создание и редактирование учебных аудиторий</p>
        </div>

        <div className="row g-4">
          {/* Форма создания новой аудитории */}
          {isAuthenticated && (
            <div className="col-lg-6">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h3 className="h5 mb-0">
                    <i className="fas fa-plus-circle me-2"></i>
                    Создать новую аудиторию
                  </h3>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Название аудитории</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Например, 101 или A-12"
                      value={classroom.name}
                      onChange={(e) => setClassroom({ ...classroom, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Тип аудитории</label>
                    <select
                      className="form-select"
                      value={classroom.type}
                      onChange={(e) => setClassroom({ ...classroom, type: e.target.value })}
                    >
                      <option value="">Выберите тип</option>
                      <option value="LAB">Лаборатория</option>
                      <option value="LECTURE">Лекционная</option>
                    </select>
                  </div>
                  <button 
                    className="btn btn-primary w-100"
                    onClick={handleCreateClassroom}
                    disabled={!classroom.name || !classroom.type || loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="fas fa-save me-2"></i>
                    )}
                    Создать аудиторию
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Поиск аудитории */}
          <div className={`${isAuthenticated ? 'col-lg-6' : 'col-12'}`}>
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h3 className="h5 mb-0">
                  <i className="fas fa-search me-2"></i>
                  Поиск аудитории
                </h3>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Поиск по ID аудитории</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Введите ID аудитории"
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    />
                    <button 
                      className="btn btn-primary"
                      onClick={handleGetClassroom}
                      disabled={!classroomId || loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <i className="fas fa-search"></i>
                      )}
                    </button>
                  </div>
                </div>
                {fetchedClassroom && (
                  <div className="alert alert-success mt-3">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-check-circle fa-2x me-3"></i>
                      <div>
                        <h4 className="alert-heading">Аудитория найдена!</h4>
                        <hr />
                        <p className="mb-1"><strong>ID:</strong> {fetchedClassroom.id}</p>
                        <p className="mb-1"><strong>Название:</strong> {fetchedClassroom.name}</p>
                        <p className="mb-0">
                          <strong>Тип:</strong> 
                          <span className={`badge ${fetchedClassroom.type === 'LAB' ? 'bg-info' : 'bg-warning'} ms-2`}>
                            {fetchedClassroom.type === 'LAB' ? 'Лаборатория' : 'Лекционная'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Список аудиторий */}
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h3 className="h5 mb-0">
                  <i className="fas fa-list me-2"></i>
                  Список аудиторий
                </h3>
                <span className="badge bg-light text-primary">
                  Страница {page + 1} из {totalPages}
                </span>
              </div>
              <div className="card-body p-0">
                {classrooms.length === 0 && !loading ? (
                  <div className="text-center py-4">
                    <i className="fas fa-door-closed fa-3x text-muted mb-3"></i>
                    <p className="text-muted">Нет доступных аудиторий</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th width="100">ID</th>
                          <th>Название</th>
                          <th width="200">Тип</th>
                          {isAuthenticated && <th width="120">Действия</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {classrooms.map((room) => (
                          <tr key={room.id}>
                            <td>{room.id}</td>
                            <td>{room.name}</td>
                            <td>
                              <span className={`badge ${room.type === 'LAB' ? 'bg-info' : 'bg-warning'}`}>
                                {room.type === 'LAB' ? 'Лаборатория' : 'Лекционная'}
                              </span>
                            </td>
                            {isAuthenticated && (
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  disabled={loading}
                                  onClick={() => handleDeleteClassroom(room.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <select 
                      className="form-select form-select-sm w-auto"
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      disabled={loading}
                    >
                      <option value="5">5 на странице</option>
                      <option value="10">10 на странице</option>
                      <option value="20">20 на странице</option>
                    </select>
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setPage(p => Math.max(p - 1, 0))}
                          disabled={loading}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                        <li 
                          key={i} 
                          className={`page-item ${page === i ? 'active' : ''}`}
                        >
                          <button 
                            className="page-link" 
                            onClick={() => setPage(i)}
                            disabled={loading}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
                          disabled={loading}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClassroomPage;
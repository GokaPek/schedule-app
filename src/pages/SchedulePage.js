import React, { useState, useEffect } from 'react';
import {
  autoGenerate,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getScheduleByGroupId,
  getScheduleByTeacherId,
  getAllGroups,
  getAllTeachers,
  getAllDisciplines,
  downloadSchedulePdf,
  getAllClassrooms,
} from '../api/apiClient';
import CustomDropdown from '../components/CustomDropdown';

const SchedulePage = () => {
  const dayOfWeekLabels = {
    MONDAY: 'Понедельник',
    TUESDAY: 'Вторник',
    WEDNESDAY: 'Среда',
    THURSDAY: 'Четверг',
    FRIDAY: 'Пятница',
    SATURDAY: 'Суббота',
    SUNDAY: 'Воскресенье',
  };

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const daysOfWeekRu = [
    { value: 'MONDAY', label: 'Понедельник' },
    { value: 'TUESDAY', label: 'Вторник' },
    { value: 'WEDNESDAY', label: 'Среда' },
    { value: 'THURSDAY', label: 'Четверг' },
    { value: 'FRIDAY', label: 'Пятница' },
    { value: 'SATURDAY', label: 'Суббота' },
    { value: 'SUNDAY', label: 'Воскресенье' },
  ];

  // Проверяем наличие токена для отображения элементов управления
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  const [schedule, setSchedule] = useState({
    pairNumber: null,
    weekNumber: null,
    dayOfWeek: '',
    classroomId: null,
    teacherId: null,
    groupIds: [],
    disciplineName: '',
    classroomName: '',
  });

  const [scheduleId, setScheduleId] = useState('');
  const [fetchedSchedule, setFetchedSchedule] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [activeTab, setActiveTab] = useState('group');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const pairNumbers = Array.from({ length: 8 }, (_, i) => i + 1);
  const weekNumbers = [1, 2];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const groupsResponse = await getAllGroups();
        setGroups(groupsResponse.data);
        const teachersResponse = await getAllTeachers();
        setTeachers(teachersResponse.data);
        const disciplinesResponse = await getAllDisciplines();
        setDisciplines(disciplinesResponse.data);
        fetchClassrooms(currentPage);
      } catch (error) {
        showError(`Ошибка при загрузке данных: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      fetchClassrooms(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      fetchClassrooms(currentPage + 1);
    }
  };

  const fetchClassrooms = async (page, size = 10) => {
    try {
      const response = await getAllClassrooms(page, size);
      setClassrooms(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Ошибка при загрузке аудиторий:', error);
    }
  };

  // Генерация всех возможных слотов расписания
  const generateAllScheduleSlots = () => {
    const allSlots = [];
    
    daysOfWeek.forEach(day => {
      weekNumbers.forEach(week => {
        pairNumbers.forEach(pair => {
          allSlots.push({
            dayOfWeek: day,
            weekNumber: week,
            pairNumber: pair,
            isEmpty: true // Флаг для пустого слота
          });
        });
      });
    });

    return allSlots;
  };

  // Объединение фактического расписания с пустыми слотами
  const combineScheduleWithEmptySlots = (actualSchedule) => {
    const allSlots = generateAllScheduleSlots();
    
    // Помечаем заполненные слоты
    actualSchedule.forEach(item => {
      const slotIndex = allSlots.findIndex(slot => 
        slot.dayOfWeek === item.dayOfWeek &&
        slot.weekNumber === item.weekNumber &&
        slot.pairNumber === item.pairNumber
      );
      
      if (slotIndex !== -1) {
        allSlots[slotIndex] = {
          ...item,
          isEmpty: false
        };
      }
    });
    
    return allSlots;
  };

  const handleCreateSchedule = async () => {
    if (!isAuthenticated) return;

    try {
      const selectedTeacherId = teachers.find((teacher) => teacher.lastName === schedule.teacherName)?.id;
      const selectedDisciplineId = disciplines.find((d) => d.name === schedule.disciplineName)?.id;
      const selectedClassroomId = classrooms.find((c) => c.name === schedule.classroomName)?.id;

      if (!schedule.groupIds.length || !selectedTeacherId || !selectedDisciplineId) {
        showError('Выберите хотя бы одну группу, преподавателя и дисциплину.');
        return;
      }

      const newSchedule = {
        ...schedule,
        groupIds: schedule.groupIds,
        teacherId: selectedTeacherId,
        disciplineId: selectedDisciplineId,
        classroomId: selectedClassroomId ?? null,
        pairNumber: schedule.pairNumber ?? null,
        weekNumber: schedule.weekNumber ?? null,
        dayOfWeek: schedule.dayOfWeek || null,
      };

      await createSchedule(newSchedule);
      showSuccess('Расписание успешно создано!');
      setSchedule({
        pairNumber: null,
        weekNumber: null,
        dayOfWeek: '',
        classroomId: null,
        teacherId: null,
        groupIds: [],
        disciplineName: '',
        classroomName: '',
      });
      const response = await getAllGroups(); // Обновляем список
      setGroups(response.data);
      if (selectedGroup) {
        handleGetScheduleByGroupId();
      } else if (selectedTeacher) {
        handleGetScheduleByTeacherId();
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      showError(`Ошибка при создании расписания: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!isAuthenticated) return;

    try {
      const selectedTeacherId = teachers.find((teacher) => teacher.lastName === schedule.teacherName)?.id;
      const selectedDisciplineId = disciplines.find((d) => d.name === schedule.disciplineName)?.id;
      const selectedClassroomId = classrooms.find((c) => c.name === schedule.classroomName)?.id;

      if (!schedule.groupIds.length || !selectedTeacherId || !selectedDisciplineId) {
        showError('Выберите хотя бы одну группу, преподавателя и дисциплину.');
        return;
      }

      const updatedSchedule = {
        ...schedule,
        groupIds: schedule.groupIds,
        teacherId: selectedTeacherId,
        disciplineId: selectedDisciplineId,
        classroomId: selectedClassroomId ?? null,
        pairNumber: schedule.pairNumber ?? null,
        weekNumber: schedule.weekNumber ?? null,
        dayOfWeek: schedule.dayOfWeek || null,
      };

      await updateSchedule(scheduleId, updatedSchedule);
      showSuccess('Расписание успешно обновлено!');

      if (selectedGroup) {
        handleGetScheduleByGroupId();
      } else if (selectedTeacher) {
        handleGetScheduleByTeacherId();
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      showError(`Ошибка при обновлении расписания: ${message}`);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!isAuthenticated) return;

    if (!window.confirm('Вы уверены, что хотите удалить это расписание?')) {
      return;
    }

    try {
      await deleteSchedule(id);
      showSuccess('Расписание успешно удалено!');

      if (selectedGroup) {
        handleGetScheduleByGroupId();
      } else if (selectedTeacher) {
        handleGetScheduleByTeacherId();
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      showError(`Ошибка при удалении расписания: ${message}`);
    }
  };

  const handleGetScheduleByGroupId = async () => {
    try {
      const selectedGroupId = groups.find((g) => g.name === selectedGroup)?.id;
      if (!selectedGroupId) {
        showError('Выберите группу из списка.');
        return;
      }
      const response = await getScheduleByGroupId(selectedGroupId);
      const combinedSchedule = combineScheduleWithEmptySlots(response.data);
      setFetchedSchedule(sortSchedule(combinedSchedule));
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      showError(`Ошибка при поиске по группе: ${message}`);
    }
  };

  const handleGetScheduleByTeacherId = async () => {
    try {
      const selectedTeacherId = teachers.find((t) => t.lastName === selectedTeacher)?.id;
      if (!selectedTeacherId) {
        showError('Выберите преподавателя из списка.');
        return;
      }
      const response = await getScheduleByTeacherId(selectedTeacherId);
      const combinedSchedule = combineScheduleWithEmptySlots(response.data);
      setFetchedSchedule(sortSchedule(combinedSchedule));
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      showError(`Ошибка при поиске по преподавателю: ${message}`);
    }
  };

  const handleDownloadPdf = async () => {
    if (!isAuthenticated) return;

    try {
      const selectedGroupId = groups.find((g) => g.name === selectedGroup)?.id;
      if (!selectedGroupId) {
        showError('Выберите группу из списка.');
        return;
      }
      const response = await downloadSchedulePdf(selectedGroupId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'schedule.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      showError(`Ошибка при скачивании PDF: ${message}`);
    }
  };

  const handleAutoGenerate = async () => {
    if (!isAuthenticated) return;

    try {
      await autoGenerate();
      showSuccess('Расписание успешно сгенерировано!');
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      showError(`Ошибка при автогенерации: ${message}`);
    }
  };

  const sortSchedule = (scheduleArray) => {
    return scheduleArray.sort((a, b) => {
      const dayA = daysOfWeek.indexOf(a.dayOfWeek);
      const dayB = daysOfWeek.indexOf(b.dayOfWeek);
      if (dayA !== dayB) return dayA - dayB;
      if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
      return a.pairNumber - b.pairNumber;
    });
  };

  return (
    <div className="container py-4">
      {/* Уведомления */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
        </div>
      )}

      {/* Индикатор загрузки */}
      {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      )}

      {/* Заголовок страницы */}
      <div className="page-header mb-4">
        <h1 className="display-5 fw-bold">
          <i className="fas fa-calendar-alt me-2 text-primary"></i>
          Управление расписанием
        </h1>
        <p className="lead">Создание и редактирование учебных занятий</p>
      </div>

      {/* Быстрые действия */}
      <div className="row">
        {isAuthenticated && (
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <span>Быстрые действия</span>
                <i className="fas fa-bolt text-warning"></i>
              </div>
              <div className="card-body">
                <button
                  className="btn btn-success w-100 mb-3"
                  onClick={handleAutoGenerate}
                >
                  <i className="fas fa-magic me-2"></i>
                  Сгенерировать расписание
                </button>
                <button
                  className="btn btn-primary w-100"
                  onClick={handleDownloadPdf}
                  disabled={!selectedGroup || loading}
                >
                  <i className="fas fa-file-pdf me-2"></i>
                  Скачать PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Поиск расписания */}
        <div className={`${isAuthenticated ? 'col-md-8' : 'col-12'}`}>
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <span>Поиск расписания</span>
            </div>
            <div className="card-body">
              <ul className="nav nav-tabs mb-3" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'group' ? 'active' : ''}`}
                    onClick={() => setActiveTab('group')}
                  >
                    По группе
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'teacher' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teacher')}
                  >
                    По преподавателю
                  </button>
                </li>
              </ul>

              {/* Поиск по группе */}
              {activeTab === 'group' && (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Выберите группу:</label>
                    <select
                      className="form-select"
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                      <option value="">-- Выберите группу --</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.name}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleGetScheduleByGroupId}
                    disabled={!selectedGroup || loading}
                  >
                    <i className="fas fa-search me-2"></i>
                    Найти расписание
                  </button>
                </div>
              )}

              {/* Поиск по преподавателю */}
              {activeTab === 'teacher' && (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Выберите преподавателя:</label>
                    <select
                      className="form-select"
                      value={selectedTeacher}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                    >
                      <option value="">-- Выберите преподавателя --</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.lastName}>
                          {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleGetScheduleByTeacherId}
                    disabled={!selectedTeacher || loading}
                  >
                    <i className="fas fa-search me-2"></i>
                    Найти расписание
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Форма создания/редактирования */}
      {isAuthenticated && (
        <div className="row mt-4">
          <div className="col-md-12">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <span>Создание/редактирование расписания</span>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Номер пары:</label>
                    <select
                      className="form-select"
                      value={schedule.pairNumber || ''}
                      onChange={(e) =>
                        setSchedule({ ...schedule, pairNumber: e.target.value ? parseInt(e.target.value) : null })
                      }
                    >
                      <option value="">-- Не указано --</option>
                      {pairNumbers.map((number) => (
                        <option key={number} value={number}>{number}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Номер недели:</label>
                    <select
                      className="form-select"
                      value={schedule.weekNumber || ''}
                      onChange={(e) =>
                        setSchedule({ ...schedule, weekNumber: e.target.value ? parseInt(e.target.value) : null })
                      }
                    >
                      <option value="">-- Не указано --</option>
                      {weekNumbers.map((number) => (
                        <option key={number} value={number}>{number}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">День недели:</label>
                    <select
                      className="form-select"
                      value={schedule.dayOfWeek || ''}
                      onChange={(e) =>
                        setSchedule({ ...schedule, dayOfWeek: e.target.value || '' })
                      }
                    >
                      <option value="">-- Не указано --</option>
                      {daysOfWeekRu.map((day) => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Аудитория:</label>
                    <CustomDropdown
                      items={classrooms.map(c => ({ id: c.id, name: c.name, type: c.type }))}
                      selectedItem={schedule.classroomName}
                      onItemSelect={(item) => setSchedule({
                        ...schedule,
                        classroomName: item.name,
                        classroomId: item.id,
                        classroomType: item.type
                      })}
                      totalPages={totalPages}
                      currentPage={currentPage}
                      onPageChange={(direction) => {
                        if (direction === 'prev') handlePrevPage();
                        else handleNextPage();
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Группы:</label>
                    <select
                      className="form-select"
                      multiple
                      size="3"
                      value={schedule.groupIds}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
                        setSchedule({ ...schedule, groupIds: selectedOptions });
                      }}
                    >
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">Для выбора нескольких групп удерживайте Ctrl</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Преподаватель:</label>
                    <select
                      className="form-select"
                      value={schedule.teacherName}
                      onChange={(e) =>
                        setSchedule({ ...schedule, teacherName: e.target.value })
                      }
                    >
                      <option value="">-- Выберите преподавателя --</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.lastName}>
                          {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Дисциплина:</label>
                    <select
                      className="form-select"
                      value={schedule.disciplineName}
                      onChange={(e) =>
                        setSchedule({ ...schedule, disciplineName: e.target.value })
                      }
                    >
                      <option value="">-- Выберите дисциплину --</option>
                      {disciplines.map((discipline) => (
                        <option key={discipline.id} value={discipline.name}>
                          {discipline.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 d-flex justify-content-between mt-3">
                    <button
                      className="btn btn-primary"
                      onClick={handleCreateSchedule}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Создать
                    </button>
                    <button
                      className="btn btn-warning"
                      onClick={handleUpdateSchedule}
                    >
                      <i className="fas fa-edit me-2"></i>
                      Обновить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Результаты поиска */}
      {fetchedSchedule.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <span>Результаты поиска</span>
                <span className="badge bg-light text-primary">{fetchedSchedule.length} записей</span>
              </div>
              <div className="card-body">
                <div className="schedule-grid">
                  {/* Группируем по дням недели */}
                  {daysOfWeek.map(day => (
                    <div key={day} className="mb-4">
                      <h5 className="mb-3">{dayOfWeekLabels[day]}</h5>
                      
                      {/* Группируем по неделям */}
                      {weekNumbers.map(week => (
                        <div key={`${day}-${week}`} className="mb-3">
                          <h6 className="text-muted">Неделя {week}</h6>
                          
                          {/* Выводим все пары для этого дня и недели */}
                          {pairNumbers.map(pair => {
                            const scheduleItem = fetchedSchedule.find(item => 
                              item.dayOfWeek === day && 
                              item.weekNumber === week && 
                              item.pairNumber === pair
                            );
                            
                            const isEmpty = !scheduleItem || scheduleItem.isEmpty;
                            const classroom = scheduleItem && classrooms.find(c => c.name === scheduleItem.classroomName);
                            const classroomType = classroom?.type || (scheduleItem?.classroomType || '');
                            
                            return (
                              <div key={`${day}-${week}-${pair}`} className={`card mb-2 ${isEmpty ? 'bg-light' : ''}`}>
                                <div className="card-body p-2">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                      <span className="badge bg-secondary me-2">Пара {pair}</span>
                                      {isEmpty ? (
                                        <span className="text-muted">Нет занятия</span>
                                      ) : (
                                        <>
                                          <span className={`badge ${classroomType === 'LECTURE' ? 'bg-success' : 'bg-warning'} me-2`}>
                                            {classroomType === 'LECTURE' ? 'Лекция' : 'Практика'}
                                          </span>
                                          <span className="badge bg-info me-2">{scheduleItem.classroomName}</span>
                                          <strong className="me-2">{scheduleItem.disciplineName}</strong>
                                          <span className="text-muted me-2">{scheduleItem.teacherName}</span>
                                          <small className="text-muted">Группы: {scheduleItem.groupNames}</small>
                                        </>
                                      )}
                                    </div>
                                    {isAuthenticated && !isEmpty && (
                                      <div>
                                        <button
                                          className="btn btn-sm btn-outline-primary me-2"
                                          onClick={() => {
                                            const classroomName = scheduleItem.classroomName || '';
                                            setSchedule({
                                              pairNumber: scheduleItem.pairNumber,
                                              weekNumber: scheduleItem.weekNumber,
                                              dayOfWeek: scheduleItem.dayOfWeek,
                                              groupIds: scheduleItem.groupIds,
                                              teacherName: teachers.find(t => t.id === scheduleItem.teacherId)?.lastName || '',
                                              disciplineName: disciplines.find(d => d.id === scheduleItem.disciplineId)?.name || '',
                                              classroomName: classroomName,
                                            });
                                            setScheduleId(scheduleItem.id);
                                          }}
                                        >
                                          <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                          className="btn btn-sm btn-danger"
                                          onClick={() => handleDeleteSchedule(scheduleItem.id)}
                                        >
                                          <i className="fas fa-trash"></i>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
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
  const [schedule, setSchedule] = useState({
    pairNumber: null,
    weekNumber: null,
    dayOfWeek: '',
    classroomId: null,
    teacherId: null,
    groupIds: [],
    disciplineName: '',
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
  const [activeTab, setActiveTab] = useState('create');

  const pairNumbers = Array.from({ length: 8 }, (_, i) => i + 1);
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const weekNumbers = [1, 2];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsResponse = await getAllGroups();
        setGroups(groupsResponse.data);

        const teachersResponse = await getAllTeachers();
        setTeachers(teachersResponse.data);

        const disciplinesResponse = await getAllDisciplines();
        setDisciplines(disciplinesResponse.data);

        fetchClassrooms(currentPage);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
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

  const handleCreateSchedule = async () => {
    try {
      const selectedTeacherId = teachers.find((teacher) => teacher.lastName === schedule.teacherName)?.id;
      const selectedDisciplineId = disciplines.find((discipline) => discipline.name === schedule.disciplineName)?.id;
      const selectedClassroomId = classrooms.find((classroom) => classroom.name === schedule.classroomName)?.id;

      if (!schedule.groupIds.length || !selectedTeacherId || !selectedDisciplineId) {
        alert('Выберите хотя бы одну группу, преподавателя и дисциплину, аудиторию. Убедитесь что преподаватель не перерабатывает, не занят, или же у групп в это время не стоят другие занятия.');
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
      alert('Расписание успешно создано!');
      setSchedule({
        pairNumber: null,
        weekNumber: null,
        dayOfWeek: '',
        classroomId: null,
        teacherId: null,
        groupIds: [],
        disciplineName: '',
      });
    } catch (error) {
      console.error('Ошибка при создании расписания:', error);
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      const selectedTeacherId = teachers.find((teacher) => teacher.lastName === schedule.teacherName)?.id;
      const selectedDisciplineId = disciplines.find((discipline) => discipline.name === schedule.disciplineName)?.id;
      const selectedClassroomId = classrooms.find((classroom) => classroom.name === schedule.classroomName)?.id;

      if (!schedule.groupIds.length || !selectedTeacherId || !selectedDisciplineId) {
        alert('Выберите хотя бы одну группу, преподавателя и дисциплину.');
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
      alert('Расписание успешно обновлено!');
    } catch (error) {
      console.error('Ошибка при обновлении расписания:', error);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить это расписание?')) {
      try {
        await deleteSchedule(id);
        alert('Расписание успешно удалено!');
        if (selectedGroup) {
          handleGetScheduleByGroupId();
        } else if (selectedTeacher) {
          handleGetScheduleByTeacherId();
        }
      } catch (error) {
        console.error('Ошибка при удалении расписания:', error);
      }
    }
  };

  const handleGetScheduleByGroupId = async () => {
    try {
      const selectedGroupId = groups.find((group) => group.name === selectedGroup)?.id;
      if (!selectedGroupId) {
        alert('Выберите группу из списка.');
        return;
      }
      const response = await getScheduleByGroupId(selectedGroupId);
      setFetchedSchedule(response.data);
    } catch (error) {
      console.error('Ошибка при получении расписания по группе:', error);
    }
  };

  const handleGetScheduleByTeacherId = async () => {
    try {
      const selectedTeacherId = teachers.find((teacher) => teacher.lastName === selectedTeacher)?.id;
      if (!selectedTeacherId) {
        alert('Выберите преподавателя из списка.');
        return;
      }
      const response = await getScheduleByTeacherId(selectedTeacherId);
      setFetchedSchedule(response.data);
    } catch (error) {
      console.error('Ошибка при получении расписания по преподавателю:', error);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const selectedGroupId = groups.find((group) => group.name === selectedGroup)?.id;
      if (!selectedGroupId) {
        alert('Выберите группу из списка.');
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
      console.error('Ошибка при скачивании PDF:', error);
    }
  };

  const handleAutoGenerate = async () => {
    try {
      await autoGenerate();
      alert('Расписание успешно сгенерировано!');
    } catch (error) {
      console.error('Ошибка при автогенерации расписания:', error);
      alert('Произошла ошибка при генерации расписания');
    }
  };

  return (
    <div className="container py-4">
      <div className="page-header mb-4">
        <h1 className="display-5 fw-bold">
          <i className="fas fa-calendar-alt me-2"></i>
          Управление расписанием
        </h1>
        <p className="lead">Создание и редактирование учебных аудиторий</p>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Быстрые действия</span>
              <i className="fas fa-bolt"></i>
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
                disabled={!selectedGroup}
              >
                <i className="fas fa-file-pdf me-2"></i>
                Скачать PDF
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
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
                    disabled={!selectedGroup}
                  >
                    <i className="fas fa-search me-2"></i>
                    Найти расписание
                  </button>
                </div>
              )}

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
                    disabled={!selectedTeacher}
                  >
                    <i className="fas fa-search me-2"></i>
                    Найти расписание
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <span>Создание/редактирование расписания</span>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Номер пары:</label>
                  <select
                    className="form-select"
                    value={schedule.pairNumber || ''}
                    onChange={(e) => setSchedule({ ...schedule, pairNumber: e.target.value ? parseInt(e.target.value) : null })}
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
                    onChange={(e) => setSchedule({ ...schedule, weekNumber: e.target.value ? parseInt(e.target.value) : null })}
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
                    onChange={(e) => setSchedule({ ...schedule, dayOfWeek: e.target.value || '' })}
                  >
                    <option value="">-- Не указано --</option>
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Аудитория:</label>
                  <CustomDropdown
                    items={classrooms}
                    selectedItem={schedule.classroomName}
                    onItemSelect={(name) => setSchedule({ ...schedule, classroomName: name })}
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

                <div className="col-12 d-flex justify-content-between">
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

          {fetchedSchedule.length > 0 && (
            <div className="card mt-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Результаты поиска</span>
                <span className="badge bg-primary">{fetchedSchedule.length} записей</span>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {fetchedSchedule.map((item) => (
                    <div key={item.id} className="list-group-item schedule-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="badge bg-primary me-2">Пара {item.pairNumber}</span>
                          <span className="badge bg-secondary me-2">{item.dayOfWeek}</span>
                          <span className="badge bg-info me-2">Неделя {item.weekNumber}</span>
                          <span className="badge bg-success me-2">{item.classroomName}</span>
                          <strong>{item.disciplineName}</strong>
                          <div className="mt-2">
                            <small className="text-muted">Группы: {item.groupNames}</small>
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteSchedule(item.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
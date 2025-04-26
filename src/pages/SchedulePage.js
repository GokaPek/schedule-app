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
        alert('Выберите хотя бы одну группу, преподавателя и дисциплину.');
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

  // Удаление расписания
  const handleDeleteSchedule = async () => {
    try {
      await deleteSchedule(scheduleId);
      alert('Расписание успешно удалено!');
    } catch (error) {
      console.error('Ошибка при удалении расписания:', error);
    }
  };

  // Получение расписания по ID группы
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

  // Получение расписания по ID преподавателя
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

  // Скачивание PDF
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
    <div>
      <h2>Управление расписанием</h2>
      <div style={{ marginTop: '2rem' }}>
        <h3>Генерация расписания</h3>
        <button onClick={handleAutoGenerate}>Сгенерировать недостающее расписание</button>
      </div>

      <div>
        <h3>Создать/Обновить расписание</h3>

        <label>Номер пары (опционально):</label>
        <select
          value={schedule.pairNumber || ''}
          onChange={(e) => setSchedule({ ...schedule, pairNumber: e.target.value ? parseInt(e.target.value) : null })}
        >
          <option value="">-- Не указано --</option>
          {pairNumbers.map((number) => (
            <option key={number} value={number}>{number}</option>
          ))}
        </select>

        <label>Номер недели (опционально):</label>
        <select
          value={schedule.weekNumber || ''}
          onChange={(e) => setSchedule({ ...schedule, weekNumber: e.target.value ? parseInt(e.target.value) : null })}
        >
          <option value="">-- Не указано --</option>
          {weekNumbers.map((number) => (
            <option key={number} value={number}>{number}</option>
          ))}
        </select>

        <label>День недели (опционально):</label>
        <select
          value={schedule.dayOfWeek || ''}
          onChange={(e) => setSchedule({ ...schedule, dayOfWeek: e.target.value || '' })}
        >
          <option value="">-- Не указано --</option>
          {daysOfWeek.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>

        <label>Аудитория (опционально):</label>
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

        {/* Выбор группы */}
        <label>Группы:</label>
        <select
          multiple
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

        {/* Выбор преподавателя */}
        <label>Преподаватель:</label>
        <select
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

        {/* Выбор дисциплины */}
        <label>Дисциплина:</label>
        <select
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

        <button onClick={handleCreateSchedule}>Создать</button>
        <button onClick={handleUpdateSchedule}>Обновить</button>
      </div>

      {/* Форма удаления расписания */}
      <div>
        <h3>Удалить расписание</h3>
        <input
          type="number"
          placeholder="ID расписания"
          value={scheduleId}
          onChange={(e) => setScheduleId(e.target.value)}
        />
        <button onClick={handleDeleteSchedule}>Удалить</button>
      </div>

      {/* Выбор группы или преподавателя */}
      <div>
        <h3>Получить расписание</h3>
        <div>
          <label>Выберите группу:</label>
          <select
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
          <button onClick={handleGetScheduleByGroupId}>
            Получить по группе
          </button>
        </div>
        <div>
          <label>Выберите преподавателя:</label>
          <select
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
          <button onClick={handleGetScheduleByTeacherId}>
            Получить по преподавателю
          </button>
        </div>
      </div>

      {/* Кнопка скачивания PDF */}
      <div>
        <h3>Скачать расписание в PDF</h3>
        <button onClick={handleDownloadPdf}>Скачать PDF</button>
      </div>

      {/* Отображение расписания */}
      <div>
        <h3>Расписание</h3>
        {fetchedSchedule.length > 0 ? (
          <ul>
            {fetchedSchedule.map((item) => (
              <li key={item.id}>
                Неделя {item.weekNumber}, {item.dayOfWeek}, Пара {item.pairNumber}:{' '}
                {item.courseName} - Аудитория {item.classroomName} (Преподаватель:{' '}
                {item.teacherName}, Группы: {item.groupNames}, Дисциплина: {item.disciplineName})
              </li>
            ))}
          </ul>
        ) : (
          <p>Расписание не найдено</p>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
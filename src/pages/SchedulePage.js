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
  // Состояние для формы создания/обновления расписания
  const [schedule, setSchedule] = useState({
    pairNumber: 1, // Номер пары (по умолчанию 1)
    weekNumber: 1, // Номер недели (по умолчанию 1)
    dayOfWeek: 'MONDAY', // День недели (по умолчанию MONDAY)
    classroomId: null,
    teacherId: null,
    groupIds: [],
    disciplineName: '', // Название выбранной дисциплины
  });

  // Состояние для удаления расписания
  const [scheduleId, setScheduleId] = useState('');

  // Состояние для отображения расписания
  const [fetchedSchedule, setFetchedSchedule] = useState([]);

  // Состояние для списков преподавателей, групп и дисциплин
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [disciplines, setDisciplines] = useState([]);

  // Состояние для пагинации аудиторий
  const [classrooms, setClassrooms] = useState([]); // Текущая страница аудиторий
  const [currentPage, setCurrentPage] = useState(0); // Текущая страница (начинается с 0)
  const [totalPages, setTotalPages] = useState(0); // Общее количество страниц

  // Состояние для выбранных значений
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  // Массивы для выпадающих списков
  const pairNumbers = Array.from({ length: 8 }, (_, i) => i + 1); // Номера пар (1-8)
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']; // Дни недели
  const weekNumbers = [1, 2]; // Номера недель (1 или 2)

  // Загрузка списков преподавателей, групп и дисциплин при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsResponse = await getAllGroups();
        setGroups(groupsResponse.data);

        const teachersResponse = await getAllTeachers();
        setTeachers(teachersResponse.data);

        const disciplinesResponse = await getAllDisciplines(); // Загрузка дисциплин
        setDisciplines(disciplinesResponse.data);

        //const classroomsResponse = await getAllClassrooms(); // Загрузка аудиторий
        //setClassrooms(classroomsResponse.data.content);

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

  // Переключение на следующую страницу
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      fetchClassrooms(currentPage + 1);
    }
  };

  // Загрузка аудиторий для текущей страницы
  const fetchClassrooms = async (page, size = 10) => {
    try {
      const response = await getAllClassrooms(page, size);
      setClassrooms(response.data.content); // Сохраняем текущую страницу аудиторий
      setTotalPages(response.data.totalPages); // Сохраняем общее количество страниц
    } catch (error) {
      console.error('Ошибка при загрузке аудиторий:', error);
    }
  };

  // Создание расписания
  const handleCreateSchedule = async () => {
    try {
      const selectedGroupId = groups.find((group) => group.name === schedule.groupName)?.id;
      const selectedTeacherId = teachers.find((teacher) => teacher.lastName === schedule.teacherName)?.id;
      const selectedDisciplineId = disciplines.find((discipline) => discipline.name === schedule.disciplineName)?.id;
      const selectedClassroomId = classrooms.find((classroom) => classroom.name === schedule.classroomName)?.id;


      if (!selectedGroupId || !selectedTeacherId || !selectedDisciplineId) {
        alert('Выберите группу, преподавателя и дисциплину.');
        return;
      }

      const newSchedule = {
        ...schedule,
        groupIds: [selectedGroupId],
        teacherId: selectedTeacherId,
        disciplineId: selectedDisciplineId,
        classroomId: selectedClassroomId,
      };

      await createSchedule(newSchedule);
      alert('Расписание успешно создано!');
    } catch (error) {
      console.error('Ошибка при создании расписания:', error);
    }
  };

  // Обновление расписания
  const handleUpdateSchedule = async () => {
    try {
      const selectedGroupId = groups.find((group) => group.name === schedule.groupName)?.id;
      const selectedTeacherId = teachers.find((teacher) => teacher.lastName === schedule.teacherName)?.id;
      const selectedDisciplineId = disciplines.find((discipline) => discipline.name === schedule.disciplineName)?.id;
      const selectedClassroomId = classrooms.find((classroom) => classroom.name === schedule.classroomName)?.id;


      if (!selectedGroupId || !selectedTeacherId || !selectedDisciplineId || !selectedClassroomId) {
        alert('Выберите группу, преподавателя и дисциплину.');
        return;
      }

      const updatedSchedule = {
        ...schedule,
        groupIds: [selectedGroupId],
        teacherId: selectedTeacherId,
        disciplineId: selectedDisciplineId,
        classroomId: selectedClassroomId,
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

      {/* Форма создания/обновления расписания */}
      <div>
        <h3>Создать/Обновить расписание</h3>

        {/* Выбор номера пары */}
        <label>Номер пары:</label>
        <select
          value={schedule.pairNumber}
          onChange={(e) =>
            setSchedule({ ...schedule, pairNumber: parseInt(e.target.value) })
          }
        >
          {pairNumbers.map((number) => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </select>

        {/* Выбор номера недели */}
        <label>Номер недели:</label>
        <select
          value={schedule.weekNumber}
          onChange={(e) =>
            setSchedule({ ...schedule, weekNumber: parseInt(e.target.value) })
          }
        >
          {weekNumbers.map((number) => (
            <option key={number} value={number}>
              {number}
            </option>
          ))}
        </select>

        {/* Выбор дня недели */}
        <label>День недели:</label>
        <select
          value={schedule.dayOfWeek}
          onChange={(e) =>
            setSchedule({ ...schedule, dayOfWeek: e.target.value })
          }
        >
          {daysOfWeek.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        {/* Выбор аудитории */}
        <label>Аудитория:</label>
        <CustomDropdown
          items={classrooms} // Список аудиторий
          selectedItem={schedule.classroomName} // Выбранная аудитория
          onItemSelect={(name) => setSchedule({ ...schedule, classroomName: name })} // Обработчик выбора
          totalPages={totalPages} // Общее количество страниц
          currentPage={currentPage} // Текущая страница
          onPageChange={(direction) => {
            if (direction === 'prev') handlePrevPage();
            else handleNextPage();
          }} // Обработчик переключения страниц
        />

        {/* Выбор группы */}
        <label>Группа:</label>
        <select
          value={schedule.groupName}
          onChange={(e) =>
            setSchedule({ ...schedule, groupName: e.target.value })
          }
        >
          <option value="">-- Выберите группу --</option>
          {groups.map((group) => (
            <option key={group.id} value={group.name}>
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
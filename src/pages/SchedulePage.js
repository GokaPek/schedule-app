import React, { useState, useEffect } from 'react';
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getScheduleByGroupId,
  getScheduleByTeacherId,
  getAllGroups,
  getAllTeachers,
  downloadSchedulePdf,
} from '../api/apiClient';

const SchedulePage = () => {
  // Состояние для формы создания/обновления расписания
  const [schedule, setSchedule] = useState({
    pairNumber: 1,
    weekNumber: 1,
    dayOfWeek: 'MONDAY',
    classroomId: null,
    teacherId: null,
    groupIds: [],
  });

  // Состояние для удаления расписания
  const [scheduleId, setScheduleId] = useState('');

  // Состояние для отображения расписания
  const [fetchedSchedule, setFetchedSchedule] = useState([]);

  // Состояние для списков преподавателей и групп
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Состояние для выбранных значений
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  // Загрузка списков преподавателей и групп при монтировании компонента
  useEffect(() => {
    const fetchGroupsAndTeachers = async () => {
      try {
        const groupsResponse = await getAllGroups();
        setGroups(groupsResponse.data);

        const teachersResponse = await getAllTeachers();
        setTeachers(teachersResponse.data);
      } catch (error) {
        console.error('Ошибка при загрузке групп и преподавателей:', error);
      }
    };
    fetchGroupsAndTeachers();
  }, []);

  // Создание расписания
  const handleCreateSchedule = async () => {
    try {
      const selectedGroupId = groups.find((group) => group.name === schedule.groupName)?.id;
      const selectedTeacherId = teachers.find((teacher) => teacher.lastName === schedule.teacherName)?.id;

      if (!selectedGroupId || !selectedTeacherId) {
        alert('Выберите группу и преподавателя.');
        return;
      }

      const newSchedule = {
        ...schedule,
        groupIds: [selectedGroupId],
        teacherId: selectedTeacherId,
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

      if (!selectedGroupId || !selectedTeacherId) {
        alert('Выберите группу и преподавателя.');
        return;
      }

      const updatedSchedule = {
        ...schedule,
        groupIds: [selectedGroupId],
        teacherId: selectedTeacherId,
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

  return (
    <div>
      <h2>Управление расписанием</h2>

      {/* Форма создания/обновления расписания */}
      <div>
        <h3>Создать/Обновить расписание</h3>
        <input
          type="number"
          placeholder="Номер пары"
          value={schedule.pairNumber}
          onChange={(e) =>
            setSchedule({ ...schedule, pairNumber: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Номер недели"
          value={schedule.weekNumber}
          onChange={(e) =>
            setSchedule({ ...schedule, weekNumber: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="День недели (MONDAY, TUESDAY...)"
          value={schedule.dayOfWeek}
          onChange={(e) =>
            setSchedule({ ...schedule, dayOfWeek: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="ID аудитории"
          value={schedule.classroomId}
          onChange={(e) =>
            setSchedule({ ...schedule, classroomId: e.target.value })
          }
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
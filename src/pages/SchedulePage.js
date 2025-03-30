import React, { useState } from 'react';
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getScheduleByGroupId,
  getScheduleByTeacherId,
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
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Создание расписания
  const handleCreateSchedule = async () => {
    try {
      await createSchedule(schedule);
      alert('Расписание успешно создано!');
    } catch (error) {
      console.error('Ошибка при создании расписания:', error);
    }
  };

  // Обновление расписания
  const handleUpdateSchedule = async () => {
    try {
      await updateSchedule(scheduleId, schedule);
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
      const response = await getScheduleByGroupId(selectedGroupId);
      setFetchedSchedule(response.data);
    } catch (error) {
      console.error('Ошибка при получении расписания по группе:', error);
    }
  };

  // Получение расписания по ID преподавателя
  const handleGetScheduleByTeacherId = async () => {
    try {
      const response = await getScheduleByTeacherId(selectedTeacherId);
      setFetchedSchedule(response.data);
    } catch (error) {
      console.error('Ошибка при получении расписания по преподавателю:', error);
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
        <input
          type="number"
          placeholder="ID преподавателя"
          value={schedule.teacherId}
          onChange={(e) =>
            setSchedule({ ...schedule, teacherId: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="ID групп (через запятую)"
          value={schedule.groupIds.join(',')}
          onChange={(e) =>
            setSchedule({
              ...schedule,
              groupIds: e.target.value.split(',').map(Number),
            })
          }
        />
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

      {/* Форма получения расписания */}
      <div>
        <h3>Получить расписание</h3>
        <div>
          <input
            type="number"
            placeholder="ID группы"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
          />
          <button onClick={handleGetScheduleByGroupId}>
            Получить по группе
          </button>
        </div>
        <div>
          <input
            type="number"
            placeholder="ID преподавателя"
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
          />
          <button onClick={handleGetScheduleByTeacherId}>
            Получить по преподавателю
          </button>
        </div>
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
                {item.teacherName}, Группы: {item.groupNames})
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
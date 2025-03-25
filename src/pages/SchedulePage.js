import React, { useState } from 'react';
import { createSchedule, updateSchedule, deleteSchedule } from '../api/apiClient';

const SchedulePage = () => {
  const [schedule, setSchedule] = useState({
    pairNumber: 1,
    weekNumber: 1,
    dayOfWeek: 'MONDAY',
    classroomId: null,
    teacherId: null,
    groupIds: [],
  });
  const [scheduleId, setScheduleId] = useState('');

  const handleCreateSchedule = async () => {
    try {
      await createSchedule(schedule);
      alert('Расписание успешно создано!');
    } catch (error) {
      console.error('Ошибка при создании расписания:', error);
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      await updateSchedule(scheduleId, schedule);
      alert('Расписание успешно обновлено!');
    } catch (error) {
      console.error('Ошибка при обновлении расписания:', error);
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      await deleteSchedule(scheduleId);
      alert('Расписание успешно удалено!');
    } catch (error) {
      console.error('Ошибка при удалении расписания:', error);
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
          onChange={(e) => setSchedule({ ...schedule, pairNumber: e.target.value })}
        />
        <input
          type="number"
          placeholder="Номер недели"
          value={schedule.weekNumber}
          onChange={(e) => setSchedule({ ...schedule, weekNumber: e.target.value })}
        />
        <input
          type="text"
          placeholder="День недели (MONDAY, TUESDAY...)"
          value={schedule.dayOfWeek}
          onChange={(e) => setSchedule({ ...schedule, dayOfWeek: e.target.value })}
        />
        <input
          type="number"
          placeholder="ID аудитории"
          value={schedule.classroomId}
          onChange={(e) => setSchedule({ ...schedule, classroomId: e.target.value })}
        />
        <input
          type="number"
          placeholder="ID преподавателя"
          value={schedule.teacherId}
          onChange={(e) => setSchedule({ ...schedule, teacherId: e.target.value })}
        />
        <input
          type="text"
          placeholder="ID групп (через запятую)"
          value={schedule.groupIds.join(',')}
          onChange={(e) => setSchedule({ ...schedule, groupIds: e.target.value.split(',').map(Number) })}
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
    </div>
  );
};

export default SchedulePage;
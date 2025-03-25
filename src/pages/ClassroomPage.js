import React, { useState } from 'react';
import { createClassroom, getClassroomById } from '../api/apiClient';

const ClassroomPage = () => {
  const [classroom, setClassroom] = useState({ name: '', type: '' });
  const [classroomId, setClassroomId] = useState('');
  const [fetchedClassroom, setFetchedClassroom] = useState(null);

  const handleCreateClassroom = async () => {
    try {
      await createClassroom(classroom);
      alert('Аудитория успешно создана!');
    } catch (error) {
      console.error('Ошибка при создании аудитории:', error);
    }
  };

  const handleGetClassroom = async () => {
    try {
      const response = await getClassroomById(classroomId);
      setFetchedClassroom(response.data);
    } catch (error) {
      console.error('Ошибка при получении аудитории:', error);
    }
  };

  return (
    <div>
      <h2>Управление аудиториями</h2>

      {/* Форма создания аудитории */}
      <div>
        <h3>Создать аудиторию</h3>
        <input
          type="text"
          placeholder="Название"
          value={classroom.name}
          onChange={(e) => setClassroom({ ...classroom, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Тип (LAB, LECTURE)"
          value={classroom.type}
          onChange={(e) => setClassroom({ ...classroom, type: e.target.value })}
        />
        <button onClick={handleCreateClassroom}>Создать</button>
      </div>

      {/* Форма получения аудитории */}
      <div>
        <h3>Получить аудиторию по ID</h3>
        <input
          type="number"
          placeholder="ID аудитории"
          value={classroomId}
          onChange={(e) => setClassroomId(e.target.value)}
        />
        <button onClick={handleGetClassroom}>Получить</button>
        {fetchedClassroom && (
          <div>
            <h4>Результат:</h4>
            <p>ID: {fetchedClassroom.id}</p>
            <p>Название: {fetchedClassroom.name}</p>
            <p>Тип: {fetchedClassroom.type}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomPage;
import React, { useState, useEffect } from 'react';
import { createClassroom, getClassroomById, getAllClassrooms } from '../api/apiClient';

const ClassroomPage = () => {
  // Состояние для формы создания аудитории
  const [classroom, setClassroom] = useState({ name: '', type: '' });

  // Состояние для получения аудитории по ID
  const [classroomId, setClassroomId] = useState('');
  const [fetchedClassroom, setFetchedClassroom] = useState(null);

  // Состояние для списка аудиторий
  const [classrooms, setClassrooms] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5); // Количество аудиторий на странице
  const [totalPages, setTotalPages] = useState(0);

  // Загрузка списка аудиторий
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await getAllClassrooms(page, size);
        setClassrooms(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Ошибка при получении аудиторий:', error);
      }
    };
    fetchClassrooms();
  }, [page, size]);

  // Создание новой аудитории
  const handleCreateClassroom = async () => {
    try {
      await createClassroom(classroom);
      alert('Аудитория успешно создана!');
      setClassroom({ name: '', type: '' }); // Очистка формы
    } catch (error) {
      console.error('Ошибка при создании аудитории:', error);
    }
  };

  // Получение аудитории по ID
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

      {/* Список аудиторий */}
      <div>
        <h3>Список аудиторий</h3>
        <ul>
          {classrooms.map((classroom) => (
            <li key={classroom.id}>
              {classroom.name} ({classroom.type})
            </li>
          ))}
        </ul>

        {/* Пагинация */}
        <div>
          <button onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
            Назад
          </button>
          <span>Страница {page + 1} из {totalPages}</span>
          <button onClick={() => setPage((prev) => prev + 1)} disabled={page + 1 >= totalPages}>
            Вперед
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassroomPage;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClassroomPage from './pages/ClassroomPage';
import SchedulePage from './pages/SchedulePage';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/classrooms">Аудитории</Link> | 
        <Link to="/schedules">Расписание</Link>
      </nav>
      <Routes>
        <Route path="/classrooms" element={<ClassroomPage />} />
        <Route path="/schedules" element={<SchedulePage />} />
      </Routes>
    </Router>
  );
}

export default App;
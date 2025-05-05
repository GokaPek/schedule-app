import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import SchedulePage from './pages/SchedulePage';
import ClassroomPage from './pages/ClassroomPage';
import NotFoundPage from './pages/NotFoundPage';
import DirectionPage from './pages/DirectionPage';
import FacultyPage from './pages/FacultyPage';
import TeacherPage from './pages/TeacherPage';
import GroupPage from './pages/GroupPage';
import DepartmentPage from './pages/DepartmentPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/classrooms" element={<ClassroomPage />} />
          <Route path="/directions" element={<DirectionPage />} />
          <Route path="/facultys" element={<FacultyPage />} />
          <Route path="/teachers" element={<TeacherPage />} />
          <Route path="/groups" element={<GroupPage />} />
          <Route path="/departments" element={<DepartmentPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
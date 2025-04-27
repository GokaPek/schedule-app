import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import SchedulePage from './pages/SchedulePage';
import ClassroomPage from './pages/ClassroomPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/classrooms" element={<ClassroomPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
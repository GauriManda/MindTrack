import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ParentLogin from './components/ParentLogin';
import ParentAuth from "./components/ParentAuth";
import ParentDashboard from './components/ParentDashboard';
import TeacherLogin from './components/TeacherLogin';
import DysgraphiaTest from './components/DysgraphiaTest';
import Dysgraphia from './components/Dysgraphia';
import Counselor from './components/Counselor';
import Games from './components/Games';
import Dashboard from './components/Dashboard';
import MemoryMatchGame from './components/MemoryMatchGame';
import PatternRecognitionGame from './components/PatternRecognitionGame';
import SpotDifferenceGame from './components/SpotDifferenceGame';
import WordBuilder from './components/WordBuilder';
import PatternSolverGame from './components/PatternSolverGame';
import Footer from './components/Footer';


function App() {
  return (
    
    <Router>
    
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/parent-login" element={<ParentLogin />}/>
          <Route path="/parent-login" element={<ParentAuth />}/> 
          <Route path="/parent-dashboard" element={<ParentDashboard />}/>
          <Route path="/teacher-login" element={<TeacherLogin />}/>
          <Route path="/dysgraphia" element={<Dysgraphia />} />
          <Route path="/dysgraphia-test" element={<DysgraphiaTest />} />
          <Route path="/game" element={<Games />} />
          <Route path="/counselors" element={<Counselor />} />
          <Route path="/memory-match" element={<MemoryMatchGame />} />
          <Route path="/pattern-recognition" element={<PatternRecognitionGame />} />
          <Route path="/spot-difference" element={<SpotDifferenceGame />} />
          <Route path="/word-builder" element={<WordBuilder />} />
          <Route path="/pattern-solver" element={<PatternSolverGame />} />
          <Route path="/footer" element={<Footer />} />

          
        </Routes>
      </div>
    </Router>
    
  );
}

export default App;
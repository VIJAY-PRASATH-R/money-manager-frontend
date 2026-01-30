import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

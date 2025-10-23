import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import Topbar from './components/Topbar';
import LandingPage from './components/LandingPage';

const Mymemory = React.lazy(() => import('mymemory/Module'));

export function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <React.Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mymemory" element={<Mymemory />} />
        </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;

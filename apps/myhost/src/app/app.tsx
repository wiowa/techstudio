import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Topbar from './components/Topbar';

const Mymemory = React.lazy(() => import('mymemory/Module'));

export function App() {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl text-primary">Loading...</div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mymemory" element={<Mymemory />} />
        </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;

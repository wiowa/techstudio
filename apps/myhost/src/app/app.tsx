import * as React from 'react';
import NxWelcome from './nx-welcome';
import { Link, Route, Routes } from 'react-router-dom';

const Mymemory = React.lazy(() => import('mymemory/Module'));

export function App() {
  return (
    <React.Suspense fallback={null}>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/mymemory">Mymemory</Link>
        </li>
      </ul>
      <Routes>
        <Route path="/" element={<NxWelcome title="myhost" />} />
        <Route path="/mymemory" element={<Mymemory />} />
      </Routes>
    </React.Suspense>
  );
}

export default App;

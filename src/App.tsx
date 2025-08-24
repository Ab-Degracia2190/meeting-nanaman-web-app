import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<RouterView />} />
      </Routes>
    </Router>
  );
}

const RouterView = () => {
  return null;
}

export default App;
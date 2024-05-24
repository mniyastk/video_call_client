
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/home page/Home';
import VideoCall from './pages/videoCall/VideoCall';
import Rest from './components/rest';

function App() {
  return (
    <div className=''>
     <Routes>
      <Route path="/" element={<Home />} >
        <Route index element={<Rest />} />
        <Route path="videoCall" element={<VideoCall />} />
      </Route>
    </Routes>
    </div>
   
  );
}

export default App;

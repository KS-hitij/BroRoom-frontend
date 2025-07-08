import './App.css';
import { Route,Routes } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';

function App() {

  return (
    <div className='bg-base-300 w-screen h-screen'>
      <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/room/:roomId' element={<Room/>}/>
      </Routes>
    </div>
  )
}

export default App

import { Route, Routes } from 'react-router-dom';
import Chat from './components/Chats/Chat';
import Login from './components/auth/Login/Login';

function App() {
  return (
    <>
     <Routes>
        <Route path="/user-chat" element={<Chat />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </>
    
  );
}

export default App;

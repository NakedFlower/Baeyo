import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Listings from './pages/Listings';
import CreatePost from './pages/CreatePost';
import Home from './pages/Home';
import GroupBuy from './pages/GroupBuy';
import Chat from './pages/Chat';
import My from './pages/My';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="groupbuy" element={<GroupBuy />} />
          <Route path="groupbuy/create" element={<CreatePost />} />
          <Route path="chat" element={<Chat />} />
          <Route path="my" element={<My />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot" element={<ForgotPassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

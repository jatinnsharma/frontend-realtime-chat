import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";
import { useAuth } from '../../contexts/AuthContext';
import Message from './Message';
import ScrollToBottom from 'react-scroll-to-bottom';
import { addNewMessageURL, getConversationURL, getMessagesURL } from '../../api';
import TextMessage from './TextMessage';
import { io } from 'socket.io-client';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const socket = useRef();

  useEffect(() => {
    socket.current = io('ws://localhost:8900');
    socket.current.on('getMessage', (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (user) {
      socket.current.emit('addUser', user._id);
      socket.current.on('getUsers', (users) => {
        console.log('users', users);
      });
    }
  }, [user]);

  useEffect(() => {
    arrivalMessage && currentUser?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentUser]);

  useEffect(() => {
    if (user) {
      getConversation();
    }
  }, [user]);

  useEffect(() => {
    if (currentUser) {
      getMessages(currentUser._id);
    }
  }, [currentUser]);

  

  const getConversation = async () => {
    if (user) {
      try {
        const res = await axios.get(`${getConversationURL}/${user._id}`);
        console.log('response', res.data);
        setConversations(res.data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getMessages = async (chatId) => {
    try {
      const res = await axios.get(`${getMessagesURL}/${chatId}`);
      setMessages(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleNewMessage = async (e) => {
    e.preventDefault();
    const message = {
      chatId: currentUser._id,
      senderId: user._id,
      text: newMessage,
    };

    const receiverId = currentUser.members.find((member) => member !== user._id);

    socket.current.emit('sendMessage', {
      senderId: user._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post(`${addNewMessageURL}`, message);
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNewMessage(e);
    }
  };

  return !conversations ? (
    <h1>Loading data</h1>
  ) : (
    <div className="flex justify-center items-center w-full h-screen bg-gray-100">
      <div className='flex w-5/6'>
        <div className="w-1/4 bg-gray-200 p-4">
          {conversations.map((chat, index) => {
            return (
              <div key={index} className="cursor-pointer p-2 hover:bg-gray-300" onClick={() => setCurrentUser(chat)}  >
                <Message chat={chat} currentUser={user} />
              </div>
            )
          })}
        </div>
        <div className="w-3/4 bg-gray-300 p-4">
          <ScrollToBottom className="h-[70vh] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 ">
                It looks like your conversation is empty. Why not start a new one? 😊
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="mb-4">
                  <TextMessage message={message} own={message.senderId === user._id} />
                </div>
              ))
            )}
          </ScrollToBottom>
          {/* send new Message */}
          <div className="flex justify-center items-center mt-4">
            <div className="flex-1">
              <input
                placeholder="Type your message here..."
                className="border p-2 w-full rounded-l-md"
                type="text"
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                value={newMessage}
              />
            </div>
            <button
              className="bg-green-500 text-white p-2 rounded-r-md"
              onClick={handleNewMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

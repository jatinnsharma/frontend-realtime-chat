import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import Message from "./Message";
import ScrollToBottom from "react-scroll-to-bottom";

import {
  addNewMessageURL,
  getConversationURL,
  getMessagesURL,
  sendImageURL,
} from "../../api";
import TextMessage from "./TextMessage";
import { io } from "socket.io-client";
import { CiImageOn } from "react-icons/ci";

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState("");
  const [newMessage, setNewMessage] = useState([]);

  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const socket = useRef();
  const fileInputRef = useRef(null);

  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage", (data) => {
      console.log("socketdata",data)
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        photo:data.photo,
        createdAt: Date.now(),
      });
    });
    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (user) {
      socket.current.emit("addUser", user._id);
      socket.current.on("getUsers", (users) => {
        console.log("users", users);
      });
    }
  }, [user]);

  useEffect(() => {
    arrivalMessage &&
      currentUser?.members.includes(arrivalMessage.sender) &&
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
        console.log("response", res.data);
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
    } catch (error) {
      console.log(error);
    }
  };

  const handleNewMessage = async (e) => {
    e.preventDefault();

    if (!currentUser || !currentUser.members) {
      console.log("currentUser is null or undefined");
      return;
    }

    let message;
    const receiverId = currentUser.members.find(
      (member) => member !== user._id
    );

    if (fileInputRef?.current?.files?.length > 0) {
      // If an image is sent
      const formData = new FormData();
      formData.append("photo", fileInputRef.current.files[0]);
      formData.append("chatId", currentUser._id);
      formData.append("senderId", user._id);

      try {
        const imageRes = await axios.post(
          `${sendImageURL}/send-photo`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        message = {
          chatId: currentUser._id,
          senderId: user._id,
          receiverId,
          photo: {
            cloudinaryUrl: imageRes.data.photo.cloudinaryUrl,
            fileName: imageRes.data.photo.fileName,
          },
        };
        socket.current.emit("sendMessage", message);
        setMessages((prevMessages) => [...prevMessages, message]);
      } catch (error) {
        console.error("Error sending image:", error);
        return;
      }
    } else {
      // If a text message is sent
      message = {
        chatId: currentUser._id,
        senderId: user._id,
        text: newMessage,
      };

    

      socket.current.emit("sendMessage", {
        senderId: user._id,
        receiverId,
        text: newMessage,
      });

      try {
        const res = await axios.post(`${addNewMessageURL}`, message);
        setMessages((prevMessages) => [...prevMessages, res.data]);
        setNewMessage("");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNewMessage(e);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return !conversations ? (
    <h1>Loading data</h1>
  ) : (
    <div className="flex justify-center items-center w-full h-screen ">
      <div className="flex w-4/6 shadow-md rounded-md">
        <div className="w-1/4 bg-gray-50 p-4">
          {conversations.map((chat, index) => {
            return (
              <div
                key={index}
                className="cursor-pointer rounded-md p-2 hover:bg-gray-100"
                onClick={() => setCurrentUser(chat)}
              >
                <Message chat={chat} currentUser={user} />
              </div>
            );
          })}
        </div>
        <div className="w-3/4 bg-[#eeeeee] p-4">
          <ScrollToBottom className="h-[70vh] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 ">
                It looks like your conversation is empty. Why not start a new
                one? 😊
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="mb-4">
                  <TextMessage
                    message={message}
                    own={message.senderId === user._id}
                  />
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
              className="text-gray-600 bg-gray-100 shadow-md px-2 rounded-full absolute right-[19rem]"
              onClick={() => setShowOptions(!showOptions)}
            >
              +
            </button>
            {showOptions && (
              <div className="absolute right-[22rem] top-[29rem] p-2 bg-white border rounded-md w-40 h-20">
                <label
                  htmlFor="photo"
                  className="cursor-pointer text-gray-700"
                  onClick={handleImageClick}
                >
                  <CiImageOn size={25} />
                </label>
                <input type="file" ref={fileInputRef} className="hidden" />
              </div>
            )}
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

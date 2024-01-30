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
import { CiImageOn, CiFaceSmile } from "react-icons/ci";
import { bgChatUrl, emojiList } from "../../utils/Emoji";

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
  const emojiButtonRef = useRef(null);
  const optionsButtonRef = useRef(null);

  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiList, setShowEmojiList] = useState(false);


  useEffect(() => {
    socket.current = io("ws://localhost:8900");

    socket.current.on("isTyping", ({ senderId }) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 3000);

    
    });

    socket.current.on("getMessage", (data) => {
      console.log("socketdata", data);
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        photo: data.photo,
        createdAt: Date.now(),
      });
    });

    const handleClickOutside = (event) => {
      if (
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target) &&
        showEmojiList
      ) {
        setShowEmojiList(false);
      }

      if (
        optionsButtonRef.current &&
        !optionsButtonRef.current.contains(event.target) &&
        showOptions
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      socket.current.disconnect();
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showEmojiList, showOptions]);


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

  // useEffect(() => {
  //   socket.current.on("isTyping", ({ senderId }) => {
  //     setIsTyping(true);
  //     setTimeout(() => {
  //       setIsTyping(false);
  //     }, 5000);
  //   });
  // }, []);

  // In your server-side code where you handle socket connections
  const handleTyping = () => {
    const receiverId = currentUser.members.find(
      (member) => member !== user._id
    );
    socket.current.emit("typing", { senderId: user._id, receiverId });
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiList(false);
  };

  return !conversations ? (
    <h1>Loading data</h1>
  ) : (
    <div className="flex justify-center items-center w-full h-screen ">
      <div className="flex w-4/6 shadow-md rounded-md">
        <div className="w-1/4 bg-gray-50 p-4">
         <h1 className="my-2">Conversation</h1>
          {conversations.map((chat, index) => {
              const isActive = currentUser && currentUser._id === chat._id;
            return (
              <div
                key={index}
              
                className={`cursor-pointer rounded-md p-2 hover:bg-gray-100 ${
                  isActive ? "bg-gray-200" : ""
                }`}
                onClick={() => setCurrentUser(chat)}
              >
                <Message chat={chat} currentUser={user} isActive={isActive}/>
              </div>
            );
          })}
        </div>
        <div className="w-3/4 bg-[#eeeeee] p-4 "  >
          {isTyping && <div className="text-gray-500">typing...</div>}
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
                className="border p-2 w-full rounded-l-md outline-none "
                type="text"
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={handleKeyPress}
                value={newMessage}
              />
            </div>
            <button
            ref={optionsButtonRef}
              className="text-gray-600 bg-gray-100 shadow-md px-2 rounded-full absolute right-[19rem]"
              onClick={() => setShowOptions(!showOptions)}
            >
              +
            </button>
            <div className="cursor-pointer absolute right-[21rem]"  ref={emojiButtonRef} >
                  <CiFaceSmile
                    size={25}
                    onClick={() => setShowEmojiList(!showEmojiList)}
                  />
                </div>
            {showOptions && (
              <div className="absolute right-[22rem] flex top-[29rem] p-2 bg-white border rounded-md w-40 h-20">
                <div>
                  <label
                    htmlFor="photo"
                    className="cursor-pointer text-gray-600"
                    onClick={handleImageClick}
                  >
                    <CiImageOn size={25} />
                  </label>
                  <input type="file" ref={fileInputRef} className="hidden" />
                </div>
               
               
              </div>
            )}

            {showEmojiList && (
              <div className="absolute bottom-[6.2rem] right-[3.5rem] bg-[#9e9e9e]  p-2 rounded-md w-30">
                <div className="grid grid-cols-10 gap-2">
                  {emojiList.map((emoji, index) => (
                    <span
                      key={index}
                      onClick={() => handleEmojiClick(emoji)}
                      style={{ cursor: "pointer" }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              className="bg-green-700 text-white p-2 rounded-r-md"
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

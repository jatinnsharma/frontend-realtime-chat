import React, { useState } from 'react';
import { format } from "timeago.js";

const TextMessage = ({ message, own }) => {
  const isImage = message?.photo?.cloudinaryUrl;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const renderMessageContent = () => {
    if (message?.text?.length > 100 && !isExpanded) {
      return (
        <>
          <span>{message.text.slice(0, 150)}</span>
          <span className="text-blue-500 cursor-pointer" onClick={toggleExpand}>
            Read More
          </span>
        </>
      );
    } else {
      return <span>{message.text}</span>;
    }
  };




  return (
    <div className={`flex ${own ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs p-3  rounded-lg ${
          own ? 'bg-[#28B463] text-white ' : 'bg-gray-300 text-black'
        }`}
      >
        {isImage ? (
          <img src={isImage} alt="Sent" className="w-full h-auto rounded-md mb-2" />
        ) : (
          <p className="text-sm">{renderMessageContent()}</p>
        )}
        <p className={`text-xs ${own ? ' text-gray-700':'text-gray-600'}`}>
        {format(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default TextMessage;


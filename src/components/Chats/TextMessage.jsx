import React, { useState } from "react";
import { format } from "timeago.js";

const TextMessage = ({ message, own }) => {
  const isImage = message?.photo?.cloudinaryUrl;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const renderMessageContent = () => {
    if (message?.text?.length > 100) {
      return (
        <>
          <span>{isExpanded ? message.text : message.text.slice(0, 150)}</span>
          <span
            className="text-blue-500 ml-1 text-xs cursor-pointer"
            onClick={toggleExpand}
          >
            {isExpanded ? "Read Less..." : "Read More..."}
          </span>
        </>
      );
    } else {
      return <span>{message.text}</span>;
    }
  };

  return (
    <div className={`flex ${own ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-xs p-3  rounded-lg ${
          own ? "bg-[#e7fdcc] " : "bg-[#e0e0e0] "
        }`}
      >
        {isImage ? (
          <img
            src={isImage}
            alt="Sent"
            className="w-full h-auto rounded-md mb-2"
          />
        ) : (
          <p className="text-sm">{renderMessageContent()}</p>
        )}
        <p className={`text-xs ${own ? " text-gray-700" : "text-gray-600"}`}>
          {format(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default TextMessage;

import React from 'react';
import { format } from "timeago.js";

const TextMessage = ({ message, own }) => {
  return (
    <div className={`flex ${own ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-xs p-3  rounded-lg ${
          own ? 'bg-green-500 text-white' : 'bg-gray-100 text-black'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        <p className="text-xs text-gray-600 ">
        {format(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default TextMessage;

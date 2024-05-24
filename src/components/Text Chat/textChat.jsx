import React, { useState } from 'react';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, inputValue]);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 bg-gray-200">
        {messages.map((message, index) => (
          <div key={index} className="mb-2 p-2 bg-white rounded shadow">
            {message}
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-300">
        <input
          type="text"
          className="w-full p-2 rounded mb-2"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          className="w-full p-2 bg-blue-500 text-white rounded"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;

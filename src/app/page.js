'use client'

import { useState, useEffect } from "react";
import { faker } from '@faker-js/faker';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState("");


  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080/ws");
    const randomName = faker.internet.userName();
    setName(randomName);
    newSocket.addEventListener("message", event => {
      const message = event.data;
      let jsonMsg = JSON.parse(message);
      console.log(jsonMsg);
      setMessages(prevMessages => [...prevMessages, jsonMsg]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleInputChange = event => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      let message = {
        user: name,
        body: inputValue,
        type: "message",
      }

      let jsonMessage = JSON.stringify(message);
      socket.send(jsonMessage);
      setInputValue("");
    }
  };

  const handleKeyDown = event => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  }

  return (
    <div>
      <div className="flex justify-center mt-10">
        <h1 className="text-4xl">Go Chat App</h1>
      </div>
      <div className="border-2 px-5 mx-10 mt-10">
        {messages.map((message, index) => (
          <div key={index}>
            <Message jsonMsg={message} />
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-10">
        <input
          type="text"
          className="border-2 px-5 mx-10 mt-10"
          placeholder="Type your message here..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button className="border-2 px-5 mx-10 mt-10" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}



function Message({ jsonMsg }) {
  // Calculate the maximum length of the timestamp
  const maxTimestampLength = Math.max(
    jsonMsg.timestamp.length,
    "yyyy-mm-dd hh:mm:ss".length
  );

  // Format the timestamp with padding
  const paddedTimestamp = jsonMsg.timestamp.padEnd(maxTimestampLength);

  switch (jsonMsg.type) {
    case "message":
      return (
        <p>
          {paddedTimestamp +
            " : [ " +
            jsonMsg.user +
            " ] " +
            jsonMsg.body}
        </p>
      );
    case "enter":
      return (
        <p className="text-green-700">
          {paddedTimestamp + " : " + jsonMsg.user + " joined the chat"}
        </p>
      );
    case "leave":
      return (
        <p className="text-red-700">
          {paddedTimestamp + " : " + jsonMsg.user + " left the chat"}
        </p>
      );
    default:
      return paddedTimestamp + " : " + jsonMsg.body;
  }
}
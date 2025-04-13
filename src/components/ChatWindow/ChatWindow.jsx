import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import firepadRef from "../../config/firebase"; // Import the Firebase reference

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]); // Initialize empty state for messages
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  const urlparams = new URLSearchParams(window.location.search);
  const meetingId = urlparams.get("id"); // Get the meeting ID from the URL
  const userId = urlparams.get("userId"); // Get the user ID from the URL

  // Fetch messages from Firebase Realtime Database when meetingId changes
  useEffect(() => {
    if (!meetingId) return;

    const messagesRef = firepadRef.child("messages").child(meetingId);

    const handleNewMessage = (snapshot) => {
      const message = snapshot.val();
      setMessages((prevList) => [...prevList, message]);
      scrollToBottom();
    };

    messagesRef.on("child_added", handleNewMessage); // Listen for new messages

    return () => {
      messagesRef.off("child_added", handleNewMessage); // Unsubscribe when component unmounts
    };
  }, [meetingId]);

  // Scroll to the bottom of the chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle sending a message
  const handleSend = () => {
    if (!input.trim() && !file) return;

    const newMessage = {
      id: Date.now(),
      userId,
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      file: file
        ? {
            name: file.name,
            type: file.type,
            preview: URL.createObjectURL(file),
          }
        : null,
    };

    // Push the new message to Firebase
    const messagesRef = firepadRef.child("messages").child(meetingId);
    messagesRef.push(newMessage);

    setInput("");
    setFile(null);
  };

  // Handle file change (e.g., image upload)
  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    console.log(selected);
    if (selected) {
      setFile(selected);
    }
  };

  // Render the chat window
  return (
    <div className="chat-popup">
      <div className="chat-header">
        <span>💬 Chat</span>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.userId === userId ? "own" : ""}`}
          >
            <div className="meta">
              <span className="user-id" style={{ margin: 0 }}>
                {msg.userId}
              </span>
              <span className="time">{msg.time}</span>
            </div>
            <div className="text">
              {msg.text}
              {msg.file && (
                <div className="file-preview">
                  {msg.file.preview ? (
                    <img
                      src={msg.file.preview}
                      alt={msg.file.name}
                      className="preview-img"
                    />
                  ) : (
                    <div className="file-name">📎 {msg.file.name}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        {/* <label className="file-label">
          📎
          <input type="file" onChange={handleFileChange} hidden />
        </label> */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>➤</button>
      </div>
    </div>
  );
};

export default ChatWindow;

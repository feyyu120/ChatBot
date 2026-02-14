import React, { useEffect, useRef, useState } from "react";
import { FaPaperclip, FaTimes, FaSpinner, FaUserCircle, FaHistory, FaChevronLeft, FaSun, FaMoon } from "react-icons/fa";
import "../styles/bot.css";

const API_BASE = "http://localhost:5000/api/chat";

function Bot() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const userMenuRef = useRef(null);

 
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      const isDark = savedTheme === "dark";
      setIsDarkMode(isDark);
      document.body.classList.toggle("light-mode", !isDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.body.classList.toggle("light-mode", !newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data || []);
        }
      } catch (err) {
        console.error("History load failed:", err);
      }
    };

    loadHistory();
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 160);
    el.style.height = `${newHeight}px`;
  };

  const typeWriter = async (fullText) => {
    let displayed = "";
    setMessages((prev) => [...prev, { role: "bot", content: "" }]);

    for (let char of fullText) {
      displayed += char;
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1].content = displayed;
        return copy;
      });
      await new Promise((r) => setTimeout(r, 30));
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if ((!text && !imageFile) || isLoading) return;

    const userMsg = {
      role: "user",
      content: text || "[Image uploaded]",
      image: imageFile ? URL.createObjectURL(imageFile) : null,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSelectedImage(null);
    setImageFile(null);
    adjustTextareaHeight();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token") || "";
      const formData = new FormData();
      formData.append("message", text);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(`${API_BASE}/send`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: formData,
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      const reply = data.botMessage?.content || "No reply received";

      await typeWriter(reply);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, something went wrong " },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const loadConversation = (conversationMessages) => {
    setMessages(conversationMessages || []);
    setShowHistoryPanel(false);
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="header-content">
          <button
            className="history-toggle-btn"
            onClick={() => setShowHistoryPanel(true)}
          >
            <FaHistory />
          </button>

          <div className="header-text">
            <h1>🤖 ChatBot</h1>
          </div>

          <div className="user-profile-area" ref={userMenuRef}>
            <button
              className="user-icon-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <FaUserCircle className="user-avatar-icon" />
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <button className="signout-btn" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-emoji">👋</div>
            <h2>Hey there! You can ask</h2>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message-row ${msg.role}`}>
            <div className="avatar">{msg.role === "user" ? "You" : "AI"}</div>
            <div className="bubble">
              {msg.content}
              {msg.image && <img src={msg.image} alt="Uploaded" className="chat-image" />}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-row bot">
            <div className="avatar">AI</div>
            <div className="bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <footer className="chat-input-area">
        {selectedImage && (
          <div className="image-preview">
            <img src={selectedImage} alt="Preview" />
            <button
              className="remove-image"
              onClick={() => {
                setSelectedImage(null);
                setImageFile(null);
              }}
            >
              <FaTimes />
            </button>
          </div>
        )}

        <div className="input-row">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            hidden
            onChange={handleImageChange}
          />

          <button
            className="attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || selectedImage}
          >
            <FaPaperclip />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            disabled={isLoading}
          />

          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={(!input.trim() && !imageFile) || isLoading}
          >
            {isLoading ? <FaSpinner className="spin" /> : "➤"}
          </button>
        </div>
      </footer>


      <div className={`history-sidebar ${showHistoryPanel ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3 style={{position:"absolute",marginTop:25}}>Chat History</h3>

         
          <button
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>

          <button className="close-btn" onClick={() => setShowHistoryPanel(false)}>
            <FaChevronLeft />
          </button>
        </div>

        <div className="history-list">
          {history.length === 0 ? (
            <p className="no-history">No previous chats yet</p>
          ) : (
            history
              .slice()
              .reverse()
              .map((msg, i) => {
                if (msg.role !== "user") return null;
                const date = new Date(msg.createdAt || Date.now()).toLocaleDateString();
                return (
                  <button
                    key={i}
                    className="history-item"
                    onClick={() => loadConversation(history.filter((m) => m.createdAt === msg.createdAt || true))}
                  >
                    <div className="history-preview">
                      {msg.content.slice(0, 45)}
                      {msg.content.length > 45 ? "..." : ""}
                    </div>
                    <div className="history-date">{date}</div>
                  </button>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}

export default Bot;
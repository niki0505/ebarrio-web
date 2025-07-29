import React, { useContext, useEffect, useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { InfoContext } from "../context/InfoContext";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import api from "../api";

const Chat = () => {
  const { fetchChats, chats, setChats } = useContext(InfoContext);
  // const [chats, setChats] = useState([]);
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!socket || !user?.userID) return;

    const handleConnect = () => {
      console.log("🔌 Socket connected. Registering...");
      socket.emit("register", user.userID, user.role);
    };

    socket.on("connect", handleConnect);

    // Also emit immediately if already connected
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.emit("unregister", user.userID);
    };
  }, [socket, user?.userID]);

  useEffect(() => {
    if (!socket) {
      console.log("🚫 Socket not ready");
      return;
    }

    const handleReceive = ({ from, to, message, timestamp, roomId }) => {
      console.log("📥 Message received:", { from, to, message, roomId });

      setChats((prevChats) => {
        let updated = prevChats.map((chat) => {
          if (chat._id === roomId) {
            return {
              ...chat,
              messages: [...chat.messages, { from, to, message, timestamp }],
            };
          }
          return chat;
        });

        const exists = updated.some((c) => c._id === roomId);
        if (!exists) {
          // Optionally fetch new chat details from backend
          console.log("🆕 New chat room. Consider fetching chat:", roomId);
        }

        return updated;
      });

      // Append to currently open chat if it matches
      setActiveChat((prev) => {
        if (prev?._id === roomId) {
          return {
            ...prev,
            messages: [...prev.messages, { from, to, message, timestamp }],
          };
        }
        return prev;
      });
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket]);

  useEffect(() => {
    if (!isOpen) return;
    fetchChats();
  }, [isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  const handleSend = async () => {
    // if (message.trim() && activeChat) {
    //   await sendMessage(activeChat._id, message);
    //   setMessage("");
    //   fetchChats(); // Refresh after sending
    // }
  };

  console.log(chats);

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg m-4 p-4 relative h-[500px] flex">
            <button
              onClick={toggleChat}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column - Chat List */}
            <div className="w-1/3 border-r overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2 px-2">Conversations</h3>
              {chats.map((conv) => {
                const otherParticipant = conv.participants.find(
                  (p) => p._id !== user.userID
                );
                const lastMsg = conv.messages.at(-1);
                const picture = otherParticipant?.resID?.picture;
                return (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectChat(conv)}
                    className={`p-3 cursor-pointer hover:bg-gray-100 ${
                      activeChat?._id === conv._id ? "bg-blue-100" : ""
                    }`}
                  >
                    <img
                      src={picture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <p className="font-medium">
                      {otherParticipant?.resID?.firstname}{" "}
                      {otherParticipant?.resID?.lastname}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {lastMsg?.message || "No messages yet"}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Column - Chat Messages */}
            <div className="w-2/3 flex flex-col justify-between px-4">
              {activeChat ? (
                <>
                  <div className="border-b py-2">
                    <img
                      src={activeChat.participants
                        .filter((p) => p._id !== user.userID)
                        .map((p) => `${p.resID?.picture} ${p.resID?.lastname}`)}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <h2 className="text-lg font-semibold">
                      {activeChat.participants
                        .filter((p) => p._id !== user.userID)
                        .map(
                          (p) => `${p.resID?.firstname} ${p.resID?.lastname}`
                        )
                        .join(", ")}
                    </h2>
                  </div>

                  <div className="flex-1 overflow-y-auto py-3 space-y-2">
                    {activeChat.messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`${
                          msg.from._id === user.userID
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        <div
                          className={`inline-block px-3 py-2 rounded max-w-sm ${
                            msg.from._id === user.userID
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none"
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button
                      onClick={handleSend}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Select a conversation
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;

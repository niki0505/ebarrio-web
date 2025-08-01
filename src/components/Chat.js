import React, { useContext, useEffect, useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { InfoContext } from "../context/InfoContext";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import api from "../api";

const Chat = () => {
  const { fetchChats, chats, setChats } = useContext(InfoContext);
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedResidentId, setSelectedResidentId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!socket) {
      console.log("🚫 Socket not ready");
      return;
    }

    const handleReceive = async ({ from, to, message, timestamp, roomId }) => {
      console.log("📥 Message received:", { from, to, message, roomId });
      if (user.userID === from && message !== "This chat has ended.") {
        return;
      }

      const chatIndex = chats.findIndex(
        (chat) => chat._id.toString() === roomId.toString()
      );

      if (chatIndex !== -1) {
        // Update existing chat
        setChats((prevChats) => {
          const updatedChats = [...prevChats];
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            messages: [
              ...updatedChats[chatIndex].messages,
              { from, to, message, timestamp },
            ],
          };
          return updatedChats;
        });
      } else {
        // Fetch new chat from backend
        console.log("🆕 New chat room. Fetching chat:", roomId);
        try {
          const { data } = await api.get(`/getchat/${roomId}`);
          setChats((prevChats) => [...prevChats, data]);
        } catch (err) {
          console.error("❌ Failed to fetch new chat:", err.message);
        }
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket, chats]);

  useEffect(() => {
    if (!isOpen) return;
    fetchChats();
  }, [isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSelectChat = (chat) => {
    const isUserParticipant = chat.participants.some(
      (p) => p._id === user.userID
    );
    if (!isUserParticipant) return; // 🔒 User is not part of this chat

    const otherParticipant = chat.participants.find(
      (p) => p._id !== user.userID
    );
    const residentId = otherParticipant?.resID?._id;
    if (!residentId) return;

    // ✅ Save resident ID so we can show their full chat history
    setSelectedResidentId(residentId);

    // ✅ Set the active chat ID to the chat with status "active"
    const active = chats.find((c) => {
      const hasUser = c.participants.some((p) => p._id === user.userID);
      const other = c.participants.find((p) => p._id !== user.userID);
      return (
        c.status === "active" && hasUser && other?.resID?._id === residentId
      );
    });

    if (active) {
      setActiveChatId(active._id);
    } else {
      setActiveChatId(null); // or show warning
    }
  };

  const fullChatHistory = chats
    .filter(
      (c) =>
        c.participants.some((p) => p._id === user.userID) &&
        c.participants.some((p) => p.resID?._id === selectedResidentId)
    )
    .flatMap((c) => c.messages)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const activeChat = chats.find((chat) => chat._id === activeChatId);

  const handleSend = async () => {
    if (!message.trim() || !activeChat || !socket) return;

    const newMessage = {
      from: user.userID,
      to: activeChat.participants.find((p) => p._id !== user.userID)?._id,
      message,
      timestamp: new Date(),
      roomId: activeChat._id,
    };

    // Emit the message to the server
    socket.emit("send_message", newMessage);

    setChats((prevChats) => {
      const updatedChats = [...prevChats];
      const chatIndex = updatedChats.findIndex(
        (chat) => chat._id === activeChat._id
      );
      if (chatIndex !== -1) {
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          messages: [...updatedChats[chatIndex].messages, newMessage],
        };
      }
      return updatedChats;
    });
    setMessage("");
  };

  const endChat = async (chatID) => {
    try {
      const systemMessage = {
        from: user.userID,
        to: activeChat.participants.find((p) => p._id !== user.userID)?._id,
        message: "This chat has ended.",
        timestamp: new Date(),
        roomId: activeChat._id,
      };
      socket.emit("send_message", systemMessage);
      await api.put(`/endchat/${chatID}`);
      alert("Chat has been successfully ended.");
    } catch (error) {
      console.log("Error ending the chat");
    }
  };

  const isChatEnded =
    activeChat?.messages?.[activeChat.messages.length - 1]?.message ===
    "This chat has ended.";

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
              {[
                ...chats
                  .reduce((map, chat) => {
                    const other = chat.participants.find(
                      (p) => p._id !== user.userID
                    );
                    const residentId = other?.resID?._id;
                    if (!residentId) return map;

                    // Only store the latest chat per resident
                    if (
                      !map.has(residentId) ||
                      new Date(chat.updatedAt) >
                        new Date(map.get(residentId).updatedAt)
                    ) {
                      map.set(residentId, chat);
                    }
                    return map;
                  }, new Map())
                  .values(),
              ].map((conv) => {
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
                    <label onClick={() => endChat(activeChat._id)}>
                      End the chat
                    </label>
                  </div>

                  <div className="flex-1 overflow-y-auto py-3 space-y-2">
                    {fullChatHistory.messages.map((msg, i) => {
                      const isOwnMessage =
                        msg.from === user.userID ||
                        msg.from?._id === user.userID;
                      const isSystemMessage =
                        msg.message === "This chat has ended.";

                      if (isSystemMessage) {
                        return (
                          <div
                            key={i}
                            className="text-center text-gray-500 text-sm italic"
                          >
                            {msg.message}
                          </div>
                        );
                      }
                      return (
                        <div
                          key={i}
                          className={isOwnMessage ? "text-right" : "text-left"}
                        >
                          <div
                            className={`inline-block px-3 py-2 rounded max-w-sm ${
                              isOwnMessage
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100"
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!isChatEnded && (
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
                  )}
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

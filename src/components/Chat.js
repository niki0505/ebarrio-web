import React, { useContext, useEffect, useState } from "react";
import { X, MessageCircle, Ban, Send } from "lucide-react";
import { InfoContext } from "../context/InfoContext";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import api from "../api";

const Chat = () => {
  const {
    fetchChats,
    chats,
    setChats,
    AIMessages,
    setAIMessages,
    fetchPrompts,
  } = useContext(InfoContext);
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [selectedResidentId, setSelectedResidentId] = useState(null);
  const [message, setMessage] = useState("");
  const [isChatEnded, setIsChatEnded] = useState(false);
  const [isAI, setIsAI] = useState(false);

  useEffect(() => {
    if (!socket) {
      console.log("🚫 Socket not ready");
      return;
    }

    const handleReceive = async ({ from, to, message, timestamp, roomId }) => {
      console.log("📥 Message received:", { from, to, message, roomId });

      // Ignore own message unless it's a system message
      if (user.userID === from && message !== "This chat has ended.") {
        return;
      }

      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(
          (chat) => String(chat._id) === String(roomId)
        );

        if (chatIndex !== -1) {
          const chat = prevChats[chatIndex];

          // Check for duplicate by matching message + timestamp
          const isDuplicate = chat.messages.some(
            (m) =>
              m.message === message &&
              m.timestamp === timestamp &&
              m.from === from
          );
          if (isDuplicate) {
            console.log("⚠️ Duplicate message detected — skipping append.");
            return prevChats;
          }

          // Append new message
          const updatedChats = [...prevChats];
          updatedChats[chatIndex] = {
            ...chat,
            messages: [...chat.messages, { from, to, message, timestamp }],
          };
          return updatedChats;
        }

        // Chat not found — trigger new chat fetch
        console.log("🆕 New chat room. Fetching chat:", roomId);
        setActiveChatId(roomId);
        api
          .get(`/getchat/${roomId}`)
          .then(({ data }) => {
            setChats((current) => {
              if (current.some((c) => String(c._id) === String(roomId))) {
                console.log("⚠️ Chat already added after fetch — skipping.");
                return current;
              }
              return [...current, data];
            });
          })
          .catch((err) => {
            console.error("❌ Failed to fetch new chat:", err.message);
          });

        return prevChats; // No immediate state change until fetch completes
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

  useEffect(() => {
    if (!isAI) return;
    fetchPrompts();
  }, [isAI]);

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
        c.status === "Active" && hasUser && other?.resID?._id === residentId
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
    .flatMap((c) =>
      c.messages.map((msg) => ({
        ...msg,
        chatId: c._id,
        timestamp: new Date(msg.timestamp),
      }))
    )
    .sort((a, b) => a.timestamp - b.timestamp);

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
      setActiveChatId(null);
      alert("Chat has been successfully ended.");
    } catch (error) {
      console.log("Error ending the chat");
    }
  };

  useEffect(() => {
    const last = fullChatHistory.at(-1);
    setIsChatEnded(last?.message === "This chat has ended.");
  }, [fullChatHistory]);

  const handleSendGemini = async () => {
    if (!message.trim()) return;

    setAIMessages((prev) => [
      ...prev,
      { from: "user", message, timestamp: new Date() },
    ]);
    const userMessage = message;
    setMessage("");

    try {
      const response = await api.post("/analytics", { prompt: userMessage });

      setTimeout(() => {
        setAIMessages((prev) => [
          ...prev,
          { from: "ai", message: response.data, timestamp: new Date() },
        ]);
      }, 1500);
    } catch (error) {
      console.log("Error sending the prompt:", error);
    }
  };
  let lastDate = null;

  console.log(AIMessages);

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-[#0E94D3] hover:bg-[#0A7A9D] text-white p-4 rounded-full shadow-lg z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg relative h-[500px] flex flex-col">
            {/* Close button */}
            <button
              onClick={toggleChat}
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="px-4 py-2 border-b">
              <h3
                onClick={() => setIsAI(!isAI)}
                className="text-lg font-semibold cursor-pointer"
              >
                {isAI ? "Switch to Resident Chat" : "Switch to Gemini AI"}
              </h3>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden">
              {isAI ? (
                // Gemini AI full conversation
                <div className="flex flex-col h-full justify-between bg-[#F1FBFF] rounded-b-2xl">
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {AIMessages.map((msg, i) => {
                      const msgDate = new Date(msg.timestamp).toDateString();
                      const showDateHeader = msgDate !== lastDate;
                      lastDate = msgDate;

                      return (
                        <div key={i}>
                          {showDateHeader && (
                            <div className="text-center text-gray-500 my-2">
                              {msgDate}
                            </div>
                          )}
                          <div
                            className={
                              msg.from === "ai" ? "text-left" : "text-right"
                            }
                          >
                            <div
                              className={`inline-block px-3 py-2 rounded max-w-sm ${
                                msg.from === "ai"
                                  ? "bg-gray-300"
                                  : "bg-blue-600 text-white"
                              }`}
                            >
                              {msg.message}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(msg.timestamp).toLocaleTimeString(
                                undefined,
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input */}
                  <div className="border-t pt-2 flex items-center gap-2 p-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none"
                      onKeyDown={(e) => e.key === "Enter" && handleSendGemini()}
                    />
                    <button
                      onClick={handleSendGemini}
                      className="text-white bg-blue-600 px-4 py-2 rounded flex items-center space-x-2 hover:bg-blue-700"
                    >
                      <Send size={20} />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Resident chat layout
                <div className="flex h-full">
                  {/* Left Column - Chat List */}
                  <div className="w-1/3 border-r overflow-y-auto bg-[#0E94D3] rounded-tl-2xl rounded-bl-2xl">
                    {[
                      ...chats
                        .reduce((map, chat) => {
                          const other = chat.participants.find(
                            (p) => p._id !== user.userID
                          );
                          const residentId = other?.resID?._id;
                          if (!residentId) return map;
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
                        <div key={conv._id} className="px-2 py-1">
                          <div
                            onClick={() => handleSelectChat(conv)}
                            className={`cursor-pointer hover:bg-gray-100 flex flex-row space-x-2 border-b p-2 bg-white rounded-lg ${
                              activeChat?._id === conv._id ? "bg-blue-100" : ""
                            }`}
                          >
                            <img
                              src={picture}
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                            <div>
                              <p className="text-sm font-bold font-subTitle text-navy-blue">
                                {otherParticipant?.resID?.firstname}{" "}
                                {otherParticipant?.resID?.lastname}
                              </p>
                              <p className="text-xs text-red-600 truncate max-w-[200px] break-words">
                                {lastMsg?.message || "No messages yet"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column - Chat Messages */}
                  <div className="w-2/3 flex flex-col justify-between rounded-tr-2xl">
                    {selectedResidentId ? (
                      <>
                        <div className="border-b py-2">
                          {(() => {
                            const anyChat = chats.find((chat) =>
                              chat.participants.some(
                                (p) =>
                                  p.resID?._id === selectedResidentId &&
                                  chat.participants.some(
                                    (pp) => pp._id === user.userID
                                  )
                              )
                            );

                            const resident = anyChat?.participants.find(
                              (p) => p.resID?._id === selectedResidentId
                            );

                            return resident ? (
                              <div className="flex items-center space-x-2 ml-2">
                                <img
                                  src={resident.resID.picture}
                                  alt={`${resident.resID.lastname}'s profile`}
                                  className="w-10 h-10 rounded-full object-cover border"
                                />
                                <h2 className="text-md font-semibold text-navy-blue">
                                  {resident.resID.firstname}{" "}
                                  {resident.resID.lastname}
                                </h2>
                              </div>
                            ) : null;
                          })()}
                        </div>

                        <div className="flex-1 overflow-hidden py-3 space-y-2 bg-[#F1FBFF] rounded-br-2xl">
                          <div className="px-4 overflow-y-auto h-full">
                            {fullChatHistory.map((msg, i) => {
                              const isDefaultMessage =
                                msg.message ===
                                "This conversation has been forwarded to the barangay office. An admin will get back to you shortly.";
                              if (isDefaultMessage) return null;

                              const timestamp = new Date(msg.timestamp);
                              const currentDateStr = timestamp.toDateString();
                              let prevValidIndex = i - 1;
                              while (
                                prevValidIndex >= 0 &&
                                fullChatHistory[prevValidIndex].message ===
                                  "This conversation has been forwarded to the barangay office. An admin will get back to you shortly."
                              ) {
                                prevValidIndex--;
                              }

                              const prevDateStr =
                                prevValidIndex >= 0
                                  ? new Date(
                                      fullChatHistory[prevValidIndex].timestamp
                                    ).toDateString()
                                  : null;
                              const showDateHeader =
                                currentDateStr !== prevDateStr;

                              const isSystemMessage =
                                msg.message === "This chat has ended.";

                              const chatOfMessage = chats.find((c) =>
                                c.messages.some(
                                  (m) =>
                                    m.message === msg.message &&
                                    new Date(m.timestamp).getTime() ===
                                      timestamp.getTime()
                                )
                              );

                              const sender = chatOfMessage?.participants?.find(
                                (p) =>
                                  p._id === msg.from || p._id === msg.from?._id
                              );

                              const isOwnMessage =
                                user.userID === msg.from ||
                                user.userID === msg.from?._id;

                              const senderPosition = sender?.empID?.position;
                              const isStaff =
                                senderPosition === "Secretary" ||
                                senderPosition === "Clerk";
                              const alignRight = isStaff || false;
                              const senderLabel = isOwnMessage
                                ? "You"
                                : senderPosition || "Unknown";

                              return (
                                <React.Fragment key={i}>
                                  {showDateHeader && (
                                    <div className="text-center text-xs text-gray-400 my-4">
                                      {timestamp.toDateString()}
                                    </div>
                                  )}

                                  {isSystemMessage ? (
                                    <div className="text-center text-gray-500 text-sm italic my-2">
                                      {msg.message}
                                    </div>
                                  ) : (
                                    <div
                                      className={`mb-2 ${
                                        alignRight ? "text-right" : "text-left"
                                      }`}
                                    >
                                      {isStaff && (
                                        <div className="text-sm font-semibold text-gray-500 mb-1">
                                          {senderLabel}
                                        </div>
                                      )}

                                      <div
                                        className={`inline-block px-3 py-2 rounded max-w-sm ${
                                          alignRight
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-300"
                                        }`}
                                      >
                                        {msg.message}
                                      </div>

                                      <div className="text-xs text-gray-500 mt-1">
                                        {timestamp.toLocaleTimeString(
                                          undefined,
                                          {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                          }
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>

                        {!isChatEnded && (
                          <div className="border-t pt-2 flex items-center gap-2 p-2">
                            <input
                              type="text"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Type a message..."
                              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none"
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSend()
                              }
                            />
                            <button
                              onClick={handleSend}
                              className="text-white bg-blue-600 px-4 py-2 rounded flex items-center space-x-2 hover:bg-blue-700"
                            >
                              <Send size={20} />
                              <span>Send</span>
                            </button>
                            <button
                              onClick={() => endChat(activeChat._id)}
                              className="text-white bg-red-600 px-4 py-2 rounded flex items-center space-x-2 hover:bg-red-700"
                            >
                              <Ban size={20} />
                              <span>End</span>
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
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;

import React, { useContext, useEffect, useState } from "react";
import { X, MessageCircle, Settings, Ban, Send } from "lucide-react";
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
  const [isChatEnded, setIsChatEnded] = useState(false);

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
        if (chats.some((chat) => String(chat._id) === String(roomId))) {
          console.log("⚠️ Room already exists — skipping new chat creation.");
          return;
        }
        console.log("🆕 New chat room. Fetching chat:", roomId);
        setActiveChatId(roomId);
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
  }, [socket]);

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

  console.log(fullChatHistory);
  console.log(activeChatId);

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
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg relative h-[500px] flex">
            <button
              onClick={toggleChat}
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column - Chat List */}
            <div className="w-1/3 border-r overflow-y-auto bg-[#0E94D3] rounded-tl-2xl rounded-bl-2xl">
              <h3 className="text-lg font-semibold text-white px-3 py-2">
                Chats
              </h3>

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
                  <div className="px-2 py-1">
                    <div
                      key={conv._id}
                      onClick={() => handleSelectChat(conv)}
                      className={`cursor-pointer hover:bg-gray-100 flex flex-row space-x-2 border-b p-2 bg-white rounded-lg ${
                        activeChat?._id === conv._id ? "bg-blue-100" : ""
                      }`}
                    >
                      <div>
                        <img
                          src={picture}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      </div>

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
                        <>
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
                        </>
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
                        const showDateHeader = currentDateStr !== prevDateStr;

                        const isSystemMessage =
                          msg.message === "This chat has ended.";

                        // Find sender info
                        const chatOfMessage = chats.find((c) =>
                          c.messages.some(
                            (m) =>
                              m.message === msg.message &&
                              new Date(m.timestamp).getTime() ===
                                timestamp.getTime()
                          )
                        );

                        const sender = chatOfMessage?.participants?.find(
                          (p) => p._id === msg.from || p._id === msg.from?._id
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
                                {timestamp.toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
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
                                  {timestamp.toLocaleTimeString(undefined, {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
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
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
        </div>
      )}
    </>
  );
};

export default Chat;

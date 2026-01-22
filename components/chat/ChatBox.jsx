"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import toast from "react-hot-toast";
import { MdDeleteOutline } from "react-icons/md";
import { BsEmojiSmile, BsCheckAll } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";

/* ================= HELPERS ================= */
const formatTime = (t) => {
  if (!t) return "";
  if (typeof t?.toDate === "function") {
    return t.toDate().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (t instanceof Date) {
    return t.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  return "";
};

const tempId = () => `temp_${Date.now()}_${Math.random()}`;

/* ================= COMPONENT ================= */
export default function ChatBox({ chatId }) {
  const { user } = useAuth();

  /* ---------- STATE ---------- */
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [menuMsgId, setMenuMsgId] = useState(null);
  const [reactionMsgId, setReactionMsgId] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const longPressTimer = useRef(null);
  const touchStartX = useRef(null);
  const reactionLongPressTimer = useRef(null);
  const ignoreNextClick = useRef(false);

  /* ---------- LOAD MESSAGES ---------- */
  useEffect(() => {
    if (!chatId || !user) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);

      const batch = writeBatch(db);
      let changed = false;

      msgs.forEach((m) => {
        if (
          m.senderId !== user.uid &&
          !m.readBy?.includes(user.uid)
        ) {
          batch.update(
            doc(db, "chats", chatId, "messages", m.id),
            { readBy: [...(m.readBy || []), user.uid] }
          );
          changed = true;
        }
      });

      if (changed) await batch.commit();
    });

    return () => unsub();
  }, [chatId, user]);

  /* ---------- AUTO SCROLL ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, previewFile]);

  /* ---------- CLOSE MENUS ---------- */
  useEffect(() => {
    const close = () => {
      if (ignoreNextClick.current) {
      ignoreNextClick.current = false; // consume once
      return;
    }
     setMenuMsgId(null);
      setReactionMsgId(null);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  /* ---------- DELETE ---------- */
  const deleteMessage = async (id) => {
    await updateDoc(
      doc(db, "chats", chatId, "messages", id),
      { status: "deleted" }
    );
    setMenuMsgId(null);
  };

  /* ---------- REACTION LOGIC ---------- */
  const handleReaction = async (messageId, emoji) => {
    setReactionMsgId(null);
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const reactions = { ...(msg.reactions || {}) };

    if (reactions[user.uid] === emoji) {
      delete reactions[user.uid];
    } else {
      reactions[user.uid] = emoji;
    }

    await updateDoc(
      doc(db, "chats", chatId, "messages", messageId),
      { reactions }
    );

    setReactionMsgId(null);
  };

  /* ---------- TOUCH (DELETE ONLY) ---------- */
  const handleTouchStart = (id, mine) => {
    if (!mine) return;
    longPressTimer.current = setTimeout(() => {
      setMenuMsgId(id);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleReactionLongPressStart = (id) => {
  reactionLongPressTimer.current = setTimeout(() => {
    setReactionMsgId(id);
    ignoreNextClick.current = true;   // ⭐ ADD THIS
    setMenuMsgId(null); // ensure delete menu is closed
  }, 2000); // 2 seconds
};

const handleReactionLongPressEnd = () => {
  clearTimeout(reactionLongPressTimer.current);
};

  /* ---------- SWIPE (REACTION ONLY) ---------- */
  const handleSwipeStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleSwipeEnd = (e, id) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 60) {
      setReactionMsgId(id);
      setMenuMsgId(null);
    }
  };

  /* ---------- SEND ---------- */
  const sendAll = async () => {
    if ((!text.trim() && !selectedFiles.length) || !user || !chatId) return;

    try {
      if (text.trim()) {
        await addDoc(collection(db, "chats", chatId, "messages"), {
          senderId: user.uid,
          type: "text",
          text: text.trim(),
          createdAt: serverTimestamp(),
          readBy: [user.uid],
          status: "active",
        });
      }

      for (const file of selectedFiles) {
        const fileRef = ref(
          storage,
          `chatFiles/${chatId}/${Date.now()}_${file.name}`
        );
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);

        await addDoc(collection(db, "chats", chatId, "messages"), {
          senderId: user.uid,
          type: file.type.startsWith("image/") ? "image" : "file",
          fileUrl: url,
          fileName: file.name,
          createdAt: serverTimestamp(),
          readBy: [user.uid],
          status: "active",
        });
      }

      filePreviews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });

      setText("");
      setSelectedFiles([]);
      setFilePreviews([]);
      setShowEmoji(false);
    } catch {
      toast.error("Failed to send");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="flex flex-col h-full border rounded-lg">
      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.map((m) => {
          const mine = m.senderId === user.uid;
          const deleted = m.status === "deleted";
          const seen = m.readBy?.length > 1;
          const myReaction = m.reactions?.[user.uid];
          const reactionCounts = Object.values(m.reactions || {}).reduce((acc, emo) => {
  acc[emo] = (acc[emo] || 0) + 1;
  return acc;
}, {});

          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
              onContextMenu={(e) => {
                e.preventDefault();
                if (mine) setMenuMsgId(m.id);
              }}
              onTouchStart={(e) => {
                handleTouchStart(m.id, mine);
                handleSwipeStart(e);
                handleReactionLongPressStart(m.id);  // ✅ NEW
              }}
              onTouchEnd={(e) => {
                handleTouchEnd();
                handleSwipeEnd(e, m.id);
                handleReactionLongPressEnd();         // ✅ NEW
              }}

              onMouseDown={() => handleReactionLongPressStart(m.id)}   // ✅ NEW
onMouseUp={handleReactionLongPressEnd}                  // ✅ NEW
onMouseLeave={handleReactionLongPressEnd}               // ✅ NEW
            >
              <div
                className={`relative max-w-[75%] px-3 py-2 rounded-2xl ${
                  mine ? "bg-blue-200" : "bg-gray-200"
                }`}
              >
                {deleted ? (
                  <p className="italic text-gray-500 text-xs">
                    This message was deleted
                  </p>
                ) : (
                  <>
                    {m.type === "text" && (
                      <p className="text-gray-800">{m.text}</p>
                    )}

                    {m.type === "image" && (
                      <img
                        src={m.fileUrl}
                        className="rounded-xl max-h-[360px] cursor-pointer"
                        onClick={(e) => {
  if (ignoreNextClick.current) {
    e.preventDefault();
    e.stopPropagation();
    ignoreNextClick.current = false; // consume once
    return;
  }

  setPreviewFile({
    url: m.fileUrl,
    name: m.fileName,
  });
}}
                      />
                    )}

                    {m.type === "file" && (
  <a
  href={m.fileUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm block hover:bg-gray-700 transion"
  onClick={(e) => {
    if (ignoreNextClick.current) {
      e.preventDefault();
      e.stopPropagation();
      ignoreNextClick.current = false;
    }
  }}
>
  📄 {m.fileName}
</a>
)}
                  </>
                )}

                {/* REACTION DISPLAY */}
                {Object.keys(reactionCounts).length > 0 && (
  <div className="absolute -bottom-3 left-2 bg-white rounded-full px-2 py-0.5 flex gap-1 text-sm shadow">
    {Object.entries(reactionCounts).map(([emo, count]) => (
      <span
        key={emo}
        onClick={() => handleReaction(m.id, emo)}
        className="cursor-pointer select-none hover:scale-110 active:scale-90 transition"
      >
        {emo}{count > 1 ? count : ""}
      </span>
    ))}
  </div>
)}

                {/* TIME + TICKS */}
                <div className="flex justify-end items-center gap-1 text-[10px] text-gray-600 mt-1">
                  {formatTime(m.createdAt)}
                  {mine && (
                    <BsCheckAll
                      size={14}
                      className={seen ? "text-blue-500" : "text-gray-500"}
                    />
                  )}
                </div>

                {/* DELETE MENU */}
                {menuMsgId === m.id && mine && !deleted && (
                  <div
                    className="absolute right-0 top-8 bg-white border rounded shadow z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 w-full"
                      onClick={() => deleteMessage(m.id)}
                    >
                      <MdDeleteOutline /> Delete
                    </button>
                  </div>
                )}

                {/* REACTION BAR */}
                {reactionMsgId === m.id && !deleted && (
                  <div className="absolute -top-10 left-0 bg-white shadow rounded-full px-2 py-1 flex gap-2 z-50
           animate-[reactionPop_0.18s_ease-out]">
                    {["👍", "❤️", "😂", "😮", "😢"].map((emo) => (
                      <button
                        key={emo}
                        className="text-lg hover:scale-110 transition"
                        onClick={() => handleReaction(m.id, emo)}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* CHATGPT-STYLE FILE PREVIEW */}
      {filePreviews.length > 0 && (
        <div className="flex gap-2 p-2 overflow-x-auto border-t bg-gray-100">
          {filePreviews.map((p) => (
            <div
              key={p.id}
              className="relative w-20 h-20 rounded-lg border bg-white flex items-center justify-center"
            >
              {p.url ? (
                <img
                  src={p.url}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-xs text-gray-600 px-1 text-center">
                  {p.file.name}
                </span>
              )}
              <button
                onClick={() => {
                  setFilePreviews((fp) => fp.filter((x) => x.id !== p.id));
                  setSelectedFiles((sf) =>
                    sf.filter((f) => f !== p.file)
                  );
                }}
                className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* INPUT */}
      <div className="flex items-center gap-2 p-2 border-t">
        <button onClick={() => setShowEmoji((p) => !p)}>
          <BsEmojiSmile size={22} />
        </button>

        {showEmoji && (
          <div className="absolute bottom-16 left-2 z-50">
            <EmojiPicker
              onEmojiClick={(e) => setText((t) => t + e.emoji)}
            />
          </div>
        )}

        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendAll()}
          placeholder="Type a message"
          className="flex-1 border rounded px-3 py-2"
        />

        <input
          type="file"
          hidden
          multiple
          id="file"
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (selectedFiles.length + files.length > 10) {
              toast.error(
                "You can select up to 10 files or images at a time"
              );
              return;
            }
            const previews = files.map((file) => ({
              id: tempId(),
              file,
              url: file.type.startsWith("image/")
                ? URL.createObjectURL(file)
                : null,
            }));
            setSelectedFiles((p) => [...p, ...files]);
            setFilePreviews((p) => [...p, ...previews]);
            e.target.value = "";
          }}
        />

        <label htmlFor="file" className="cursor-pointer px-2">
          📎
        </label>

        <button
          onClick={sendAll}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <img
            src={previewFile.url}
            className="max-w-[90vw] max-h-[90vh]"
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setPreviewFile(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
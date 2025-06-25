import { useState } from "react";
import { MoreVertical, Edit, Trash2, Check, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import clsx from "clsx";

export default function ChatBoxMessageList({
  messages,
  targetUser,
  editingMessage,
  editInput,
  selectedMessage,
  setEditInput,
  setEditingMessage,
  setSelectedMessage,
  onSaveEdit,
  onDeleteMessage,
}) {
  const handleMessageClick = (msg) => {
    setSelectedMessage((prev) => (prev === msg.id ? null : msg.id));
  };

  const handleEditMessage = (msg) => {
    setEditingMessage(msg.id);
    setEditInput(msg.content);
    setSelectedMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditInput("");
  };

  const handleSaveEdit = (id) => {
    if (editInput.trim() !== "") {
      onSaveEdit(id, editInput.trim());
      handleCancelEdit();
    }
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDeleteMessage = (id) => {
    onDeleteMessage(id);
    setSelectedMessage(null);
  };

  return (
    <div className="flex flex-col gap-2">
      {messages.map((msg) => {
        const isSelf = msg.sender?.id !== targetUser?.id;
        const isEditing = editingMessage === msg.id;
        const isSelected = selectedMessage === msg.id;

        return (
          <div
            key={msg.id}
            className={clsx("flex items-start gap-2 group message-container", {
              "justify-end": isSelf,
              "justify-start": !isSelf,
            })}
          >
            {!isSelf && (
              <Avatar
                src={targetUser?.profilePictureUrl}
                size="xs"
                className="flex-shrink-0 mt-1"
              />
            )}

            <div
              className={clsx("flex items-start gap-2 max-w-[60%]", {
                "flex-row-reverse": isSelf,
                "flex-row": !isSelf,
              })}
            >
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1 flex-shrink-0">
                <button
                  onClick={() => handleMessageClick(msg)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-full hover:bg-[var(--muted)] transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <div
                  className={clsx(
                    "rounded-xl px-3 py-2 text-sm inline-block",
                    isSelf
                      ? "bg-blue-500 text-white"
                      : "bg-[var(--muted)] text-[var(--foreground)]"
                  )}
                  style={{
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                    maxWidth: "100%",
                  }}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 min-w-0 w-full">
                      <input
                        type="text"
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, msg.id)}
                        className="bg-transparent border-none outline-none text-white placeholder-blue-200 flex-1 min-w-0 w-full"
                        placeholder="Nhập tin nhắn..."
                        autoFocus
                      />
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          className="text-green-300 hover:text-green-100"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-300 hover:text-red-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>

                {isSelected && !isEditing && (
                  <div
                    className={clsx(
                      "absolute top-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-10 min-w-[100px]",
                      isSelf
                        ? "left-0 -translate-x-full"
                        : "right-0 translate-x-full",
                      "-translate-y-1"
                    )}
                  >
                    {isSelf ? (
                      <>
                        <button
                          onClick={() => handleEditMessage(msg)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full text-left"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded w-full text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Xóa</span>
                        </button>
                      </>
                    ) : (
                      <p className="px-3 py-2 text-sm text-gray-400 italic">Không thể chỉnh sửa</p>
                    )}
                  </div>
                )}
              </div>

              {!isSelf && <div className="flex-shrink-0 w-6"></div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

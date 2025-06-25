<div className={clsx("flex items-start gap-1 group", {
  "flex-row-reverse justify-end": isSelf,
  "flex-row justify-start": !isSelf,
})}>
  {/* Bên trái là Avatar nếu là tin nhắn người khác */}
  {!isSelf && (
    <Avatar
      src={targetUser?.profilePictureUrl}
      size="xs"
      className="flex-shrink-0 mt-1"
    />
  )}

  {/* Nội dung và thời gian nằm ngang */}
  <div className={clsx("flex items-end gap-1 max-w-[80%]", {
    "flex-row-reverse": isSelf,
    "flex-row": !isSelf,
  })}>
    {/* Bong bóng tin nhắn */}
    <div className="relative">
      <div
        className={clsx(
          "rounded-xl px-3 py-2 text-sm inline-block",
          msg.deleted
            ? "bg-gray-200 text-gray-500 italic dark:bg-gray-700 dark:text-gray-400"
            : isSelf
            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "bg-[var(--muted)] text-[var(--foreground)]"
        )}
        style={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          maxWidth: '100%'
        }}
      >
        {msg.deleted ? (
          "Tin nhắn đã bị thu hồi"
        ) : msg.attachment ? (
          renderFileInfo(
            msg.attachment, 
            getFileTypeFromUrl(msg.attachment), 
            getFilename(msg)
          )
        ) : msg.attachedFile ? (
          renderFileInfo(
            msg.attachedFile.url, 
            msg.attachedFile.contentType, 
            msg.attachedFile.originalFilename || getFilename(msg),
            msg.attachedFile.size
          )
        ) : (
          msg.content
        )}

        {/* Edited tag */}
        {msg.edited && !msg.deleted && (
          <div className={clsx(
            "text-xs mt-1 opacity-70",
            isSelf ? "text-[var(--primary-foreground)] opacity-80" : "text-[var(--muted-foreground)]"
          )}>
            <Edit className="w-3 h-3 inline mr-1" />
            <span>đã chỉnh sửa</span>
          </div>
        )}
      </div>

      {/* Menu tin nhắn đã chọn */}
      {isSelected && isSelf && !msg.deleted && (
        <div className="absolute top-0 left-0 transform -translate-x-full -translate-y-1 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--border)] p-1 z-10 min-w-[100px]">
          {!msg.attachedFile && !msg.attachment && (
            <button
              onClick={() => onEditMessage(msg)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)] rounded w-full text-left"
            >
              <Edit className="w-4 h-4" />
              <span>Sửa</span>
            </button>
          )}
          <button
            onClick={() => onDeleteMessage(msg.id)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded w-full text-left"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa</span>
          </button>
        </div>
      )}
    </div>

    {/* Thời gian gửi (ngang hàng bong bóng) */}
    <span
      className={clsx(
        "text-xs opacity-60 mt-1 select-none",
        isSelf ? "text-[var(--primary-foreground)] mr-1" : "text-[var(--muted-foreground)] ml-1"
      )}
      title={fullTime(msg.sentAt)}
    >
      {formatTime(msg.sentAt)}
    </span>
  </div>
</div>

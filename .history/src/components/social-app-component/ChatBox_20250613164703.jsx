messages.map((msg) => {
  const isSelf = msg.sender?.id !== targetUser?.id;
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

      <div className={clsx("flex items-start gap-2 max-w-[60%]", {
        "flex-row-reverse": isSelf,
        "flex-row": !isSelf,
      })}>
        {isSelf && !msg.deleted && (
          <div className="flex items-center group-hover:opacity-100 transition-opacity duration-200 mt-1 flex-shrink-0">
            <button
              onClick={() => handleMessageClick(msg)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-full hover:bg-[var(--muted)] transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="relative">
          <div
            className={clsx(
              "rounded-xl px-3 py-2 text-sm inline-block",
              msg.deleted
                ? "bg-gray-200 text-gray-500 italic dark:bg-gray-700 dark:text-gray-400"
                : isSelf
                ? "bg-blue-500 text-white"
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
              // Handle new attachment format
              <div className="flex items-center gap-2 min-w-[200px]">
                {getFileIcon(getFileTypeFromUrl(msg.attachment))}
                <div className="flex-1">
                  <div className="font-medium">{getFilenameFromUrl(msg.attachment)}</div>
                  <div className="text-xs opacity-70">
                    File đính kèm
                  </div>
                </div>
                <div className="flex gap-1">
                  {isImageFile(msg.attachment) && (
                    <button 
                      className="p-1 rounded hover:bg-black/10"
                      onClick={() => window.open(msg.attachment, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <a 
                    href={msg.attachment} 
                    download
                    className="p-1 rounded hover:bg-black/10"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : msg.attachedFile ? (
              // Handle old attachedFile format for backward compatibility
              <div className="flex items-center gap-2 min-w-[200px]">
                {getFileIcon(msg.attachedFile.contentType)}
                <div className="flex-1">
                  <div className="font-medium">{msg.attachedFile.originalFilename}</div>
                  <div className="text-xs opacity-70">
                    {formatFileSize(msg.attachedFile.size)}
                  </div>
                </div>
                <div className="flex gap-1">
                  {msg.attachedFile.contentType.startsWith('image/') && (
                    <button 
                      className="p-1 rounded hover:bg-black/10"
                      onClick={() => window.open(msg.attachedFile.url, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <a 
                    href={msg.attachedFile.url} 
                    download
                    className="p-1 rounded hover:bg-black/10"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              // Regular text message
              msg.content
            )}
            
            {msg.edited && !msg.deleted && (
              <div className={clsx(
                "text-xs mt-1 opacity-70",
                isSelf ? "text-blue-100" : "text-[var(--muted-foreground)]"
              )}>
                <Edit className="w-3 h-3 inline mr-1" />
                <span>đã chỉnh sửa</span>
              </div>
            )}
          </div>

          {isSelected && isSelf && !msg.deleted && (
            <div className="absolute top-0 left-0 transform -translate-x-full -translate-y-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-10 min-w-[100px]">
              {!msg.attachedFile && !msg.attachment && (
                <button
                  onClick={() => handleEditMessage(msg)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full text-left"
                >
                  <Edit className="w-4 h-4" />
                  <span>Sửa</span>
                </button>
              )}
              <button
                onClick={() => handleDeleteMessage(msg.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded w-full text-left"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
})
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckIcon,
  Trash2Icon,
  RotateCwIcon,
  DownloadIcon,
  XIcon,
  ShareIcon,
} from "lucide-react";
import useTypingStatus from "../../../hooks/useTypingStatus";
import { Button } from "@/components/ui/button";
import { LinkifyText } from "./LinkifyText";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function ChatMessages({
  scrollAreaRef,
  isLoading,
  groupedMessages,
  user,
  formatMessageTime,
  selectedMessages = [],
  toggleMessageSelection,
  handleDeleteMessages,
  isSelectionMode = false,
  chatId,
  isFetchingOlderMessages,
}) {
  const { typingUsersCount, typingUsersNames } = useTypingStatus(chatId);
  const [imageRotations, setImageRotations] = useState({});
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const renderMessages = {};
  Object.entries(groupedMessages).forEach(([date, msgs]) => {
    renderMessages[date] = msgs.filter(
      (m, i, arr) => i === arr.findIndex((x) => x.id === m.id)
    );
  });

  const handleRotateImage = (messageId) => {
    setImageRotations((prev) => ({
      ...prev,
      [messageId]: ((prev[messageId] || 0) + 90) % 360,
    }));
  };

  const handleDownloadImage = (imageUrl, messageId) => {
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `image-${messageId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Error downloading image:", error);
        alert("Failed to download the image. Please try again.");
      });
  };

  const handleShareImage = (imageUrl) => {
    const subject = encodeURIComponent("Check out this image from our chat");
    const body = encodeURIComponent(`I wanted to share this image with you: ${imageUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const openFullscreenImage = (msg) => {
    setFullscreenImage({
      id: msg.id,
      url: msg.imageUrl,
      isSender: msg.sender === user.uid,
      timestamp: msg.timestamp,
    });
  };

  const closeFullscreenImage = () => setFullscreenImage(null);

  return (
    <div className="flex flex-col flex-1 h-full">
   {fullscreenImage && (
  <div className="fixed inset-0 z-50 bg-black flex flex-col">
    <div className="flex items-center justify-between p-4 bg-black bg-opacity-80">
      <button onClick={closeFullscreenImage} className="text-white">
        <XIcon className="h-6 w-6" />
      </button>
      <div className="text-white text-xs">
        {formatMessageTime(fullscreenImage.timestamp)}
      </div>
    </div>
    <div className="flex-1 flex items-center justify-center overflow-auto p-4 bg-black">
      <img
        src={fullscreenImage.url}
        alt="Full size"
        className="max-h-[80vh] max-w-[90vw] object-contain mx-auto"
        style={{ transform: `rotate(${imageRotations[fullscreenImage.id] || 0}deg)` }}
      />
    </div>
    <div className="p-4 bg-black bg-opacity-80 flex justify-around">
      <button onClick={() => handleRotateImage(fullscreenImage.id)} className="text-white flex flex-col items-center">
        <RotateCwIcon className="h-6 w-6 mb-1" />
        <span className="text-xs">Rotate</span>
      </button>
      <button onClick={() => handleDownloadImage(fullscreenImage.url, fullscreenImage.id)} className="text-white flex flex-col items-center">
        <DownloadIcon className="h-6 w-6 mb-1" />
        <span className="text-xs">Download</span>
      </button>
      <button onClick={() => handleShareImage(fullscreenImage.url)} className="text-white flex flex-col items-center">
        <ShareIcon className="h-6 w-6 mb-1" />
        <span className="text-xs">Share</span>
      </button>
      {fullscreenImage.isSender && (
        <button
          onClick={() => {
            toggleMessageSelection(fullscreenImage.id);
            closeFullscreenImage();
          }}
          className="text-red-500 flex flex-col items-center"
        >
          <Trash2Icon className="h-6 w-6 mb-1" />
          <span className="text-xs">Delete</span>
        </button>
      )}
    </div>
  </div>
)}


      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 px-2 sm:px-4 py-2 max-h-[80svh]"
      >
        <div className="space-y-4 pb-6">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <Skeleton className="h-12 w-48 sm:w-64 rounded-xl" />
              </div>
            ))
          ) : (
            Object.entries(renderMessages).map(([date, msgs]) => (
              <div key={date} className="space-y-3">
                <div className="text-center my-4 relative">
                  <span className="bg-white dark:bg-neutral-900 px-3 py-1 rounded-full text-xs font-medium text-neutral-500 uppercase tracking-wide shadow-sm">
                    {date === new Date().toDateString()
                      ? "Today"
                      : date === new Date(Date.now() - 86400000).toDateString()
                      ? "Yesterday"
                      : new Date(date).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}
                  </span>
                  <div className="absolute left-0 right-0 top-1/2 border-t border-neutral-200 dark:border-neutral-700 -z-10" />
                </div>

                {msgs.map((msg) => {
                  const isSender = msg.sender === user?.uid;
                  const rotation = imageRotations[msg.id] || 0;

                  return (
                    <div key={msg.id} className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}>
                      {isSelectionMode && isSender && (
                        <div className="self-end mr-2">
                          <input
                            type="checkbox"
                            checked={selectedMessages.includes(msg.id)}
                            onChange={() => toggleMessageSelection(msg.id)}
                            className="h-4 w-4"
                          />
                        </div>
                      )}
                      <div className="flex flex-col max-w-[75%]">
                        <div className={`p-3 rounded-2xl overflow-hidden shadow-sm ${
                          isSender
                            ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-tr-none"
                            : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-tl-none"
                        }`}>
                          {msg.type === "image" && msg.imageUrl ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <div onClick={() => openFullscreenImage(msg)} className="cursor-pointer">
                                  <img
                                    src={msg.imageUrl}
                                    alt="chat"
                                    className="rounded-lg max-h-60 w-auto object-cover"
                                    style={{ transform: `rotate(${rotation}deg)` }}
                                  />
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 h-64 flex items-center justify-center p-0">
                                <img
                                  src={msg.imageUrl}
                                  alt="preview"
                                  className="w-full h-full object-contain rounded-lg"
                                  style={{ transform: `rotate(${rotation}deg)` }}
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <div className="text-sm break-words">
                              <LinkifyText text={msg.text || ""} />
                            </div>
                          )}
                        </div>

                        <div className={`text-xs text-neutral-500 mt-1 ${isSender ? "text-right" : "text-left"}`}>
                          <span>{formatMessageTime(msg.timestamp)}</span>
                          {isSender && msg.status && (
                            <>
                              {msg.status === "read" ? (
                                <CheckIcon className="inline h-3.5 w-3.5 text-orange-200 ml-1" />
                              ) : msg.status === "delivered" ? (
                                <CheckIcon className="inline h-3.5 w-3.5 text-neutral-400 ml-1" />
                              ) : (
                                <CheckIcon className="inline h-3.5 w-3.5 text-neutral-300 ml-1" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {typingUsersCount > 0 && (
            <div className="flex justify-start mb-3">
              <div className="p-3 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {typingUsersCount === 1
                    ? `${typingUsersNames} is typing`
                    : `${typingUsersNames} are typing`}
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {selectedMessages.length > 0 && (
        <div className="sticky bottom-0 p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 shadow-md">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              <span className="inline-flex items-center justify-center mr-2 w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                {selectedMessages.length}
              </span>
              messages selected
            </span>
            <Button
              onClick={handleDeleteMessages}
              variant="destructive"
              size="sm"
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-4"
            >
              <Trash2Icon className="h-4 w-4" />
              <span className="font-medium">Unsend</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMessages;

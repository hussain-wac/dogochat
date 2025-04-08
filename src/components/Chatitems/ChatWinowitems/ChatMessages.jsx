import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import useTypingStatus from "../../../hooks/useTypingStatus";
import { Button } from "@/components/ui/button";
import MessageGroup from "./MessageGroup";
import TypingIndicator from "./TypingIndicator";
import FullscreenImage from "./FullscreenImage";
import { Trash2Icon } from "lucide-react";
import useFullscreenImage from "../../../hooks/useFullscreenImage";

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
  const {
    fullscreenImage,
    openFullscreenImage,
    closeFullscreenImage,
    imageRotations,
  } = useFullscreenImage(user);

  const renderMessages = {};
  Object.entries(groupedMessages).forEach(([date, msgs]) => {
    renderMessages[date] = msgs.filter(
      (m, i, arr) => i === arr.findIndex((x) => x.id === m.id)
    );
  });

  return (
    <div className="flex flex-col flex-1 h-full">
      <FullscreenImage
        image={fullscreenImage}
        onClose={closeFullscreenImage}
        onDelete={() => {
          toggleMessageSelection(fullscreenImage?.id);
          closeFullscreenImage();
        }}
        formatMessageTime={formatMessageTime}
      />

      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 px-2 sm:px-4 py-2 max-h-[80svh]"
      >
        <div className="space-y-4 pb-6">
          {isLoading
            ? [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`flex ${
                    i % 2 === 0 ? "justify-start" : "justify-end"
                  }`}
                >
                  <Skeleton className="h-12 w-48 sm:w-64 rounded-xl" />
                </div>
              ))
            : Object.entries(renderMessages).map(([date, msgs]) => (
                <MessageGroup
                  key={date}
                  date={date}
                  msgs={msgs}
                  user={user}
                  imageRotations={imageRotations}
                  openFullscreenImage={openFullscreenImage}
                  isSelectionMode={isSelectionMode}
                  selectedMessages={selectedMessages}
                  toggleMessageSelection={toggleMessageSelection}
                  formatMessageTime={formatMessageTime}
                />
              ))}

          <TypingIndicator
            typingUsersCount={typingUsersCount}
            typingUsersNames={typingUsersNames}
          />
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

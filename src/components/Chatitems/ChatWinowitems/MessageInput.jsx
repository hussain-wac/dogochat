// components/MessageInput.js
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SendHorizontalIcon,
  SmileIcon,
  PaperclipIcon,
  MicIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import useEmojipic from "../../../hooks/useImoji";
import useTypingStatus from "../../../hooks/useTypingStatus";

const MessageInput = ({ newMessage, setNewMessage, sendMessage, chatId }) => {
  const { showEmojiPicker, setShowEmojiPicker, handleEmojiClick } = useEmojipic(setNewMessage);
  const { handleTyping } = useTypingStatus(chatId);

  return (
    <div className="p-3 border-t dark:border-neutral-700 bg-white dark:bg-neutral-900 shrink-0">
      <div className="flex items-center space-x-2 max-w-3xl mx-auto">
        <div className="flex space-x-1">
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <SmileIcon className="h-5 w-5 text-neutral-500 hover:text-orange-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              side="bottom" 
              className="w-auto p-0 border-none shadow-lg"
              align="start"
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} height={350} />
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <PaperclipIcon className="h-5 w-5 text-neutral-500 hover:text-orange-500" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 hidden md:block"
          >
            <MicIcon className="h-5 w-5 text-neutral-500 hover:text-orange-500" />
          </Button>
        </div>

        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping(e.target.value);
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 rounded-full py-5 bg-white text-black dark:text-neutral-50 dark:bg-black border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm"
        />

        <Button
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className="
            rounded-full px-4 py-2
            bg-gradient-to-r from-orange-400 to-orange-500 
            hover:from-orange-500 hover:to-orange-600
            text-white font-medium
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-md hover:shadow-lg
            transition-all duration-200
          "
        >
          <SendHorizontalIcon className="h-4 w-4 mr-2" />
          Send
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
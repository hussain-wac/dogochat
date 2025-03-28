// MessageInput.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SendHorizontalIcon,
  SmileIcon,
  PaperclipIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({
  newMessage,
  setNewMessage,
  sendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
}) => (
  <div className="p-2 border-t dark:border-gray-700 shrink-0">
    <div className="flex space-x-2 items-center">
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2">
            <SmileIcon className="h-5 w-5 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-auto p-0 border-none">
          <EmojiPicker onEmojiClick={handleEmojiClick} height={350} />
        </PopoverContent>
      </Popover>

      <Button variant="ghost" size="icon" className="mr-2">
        <PaperclipIcon className="h-5 w-5 text-gray-500" />
      </Button>

      <Input
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        className="flex-1 border-orange-500"
      />

      <Button
        onClick={sendMessage}
        disabled={!newMessage.trim()}
        className={`
          flex items-center justify-center
          px-4 py-2
          rounded-full
          bg-orange-500 hover:bg-orange-600
          dark:bg-[#00A884] dark:hover:bg-[#008F72]
          text-white
          font-medium
          transition-colors duration-200
          disabled:bg-gray-300 disabled:text-gray-500
          disabled:dark:bg-gray-600 disabled:dark:text-gray-400
          disabled:cursor-not-allowed
          w-full sm:w-auto
          shadow-sm hover:shadow-md
        `}
      >
        <SendHorizontalIcon className="mr-2 h-4 w-4" />
        Send
      </Button>
    </div>
  </div>
);

export default MessageInput;
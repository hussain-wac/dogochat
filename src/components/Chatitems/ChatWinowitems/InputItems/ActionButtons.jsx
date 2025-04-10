import React from "react";
import { Button } from "@/components/ui/button";
import { SmileIcon, CameraIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";

const ActionButtons = ({
  fileInputRef,
  handleFileChange,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
}) => {
  return (
    <div className="flex space-x-1">
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <SmileIcon className="h-5 w-5 text-neutral-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" className="p-0 border-none">
          <EmojiPicker onEmojiClick={handleEmojiClick} height={300} />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current.click()}
        className="rounded-full"
      >
        <CameraIcon className="h-5 w-5 text-neutral-500" />
      </Button>
      <input
        type="file"
        multiple
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ActionButtons;

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";

const NewMessagesBadge = ({ newMessagesCount, isAtBottom, scrollToBottom }) => {
  if (isAtBottom) return null;

  return (
    <div className="sticky bottom-4 flex justify-center z-10 pointer-events-none">
      <Button
        variant="outline"
        className="
          rounded-full 
          bg-gradient-to-r from-orange-500 to-orange-600 
          text-white 
          flex items-center space-x-2
          px-4 py-2
          shadow-lg
          border-none
          pointer-events-auto
          hover:from-orange-600 hover:to-orange-700
          transition-all duration-200
        "
        onClick={() => scrollToBottom("smooth")}
      >
        <span className="flex items-center">
          {newMessagesCount > 0 ? "New Messages" : "Jump to Bottom"}
        </span>
        <ChevronDownIcon className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export default NewMessagesBadge;

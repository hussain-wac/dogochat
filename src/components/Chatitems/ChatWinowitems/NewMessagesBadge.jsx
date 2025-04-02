// NewMessagesBadge.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";

const NewMessagesBadge = ({ newMessagesCount, scrollToBottom }) => (
  <>
    {newMessagesCount > 0 && (
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
            New Messages 
            <span className="inline-flex items-center justify-center ml-2 w-5 h-5 bg-white text-orange-600 text-xs font-bold rounded-full">
              {newMessagesCount}
            </span>
          </span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </div>
    )}
  </>
);

export default NewMessagesBadge;
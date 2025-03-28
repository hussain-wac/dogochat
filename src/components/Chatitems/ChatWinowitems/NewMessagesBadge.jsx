import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";

const NewMessagesBadge = ({ newMessagesCount, scrollToBottom }) => (
  <>
    {newMessagesCount > 0 && (
      <div className="sticky bottom-4 flex justify-center animate-bounce">
        <Button
          variant="outline"
          className="rounded-full bg-orange-500 text-white flex items-center space-x-2"
          onClick={() => scrollToBottom("smooth")}
        >
          <span>New Messages ({newMessagesCount})</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </div>
    )}
  </>
);


export default NewMessagesBadge;
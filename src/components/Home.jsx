import React, { useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizablePanelHandle,
} from "@/components/ui/resizable";
import ChatList from "./Chatitems/Chatlist";
import SearchBar from "./Chatitems/Searchbar";
import ChatWindow from "./Chatitems/ChatWindow";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion } from "framer-motion";

function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { username } = useParams(); // Get the username from the URL

  // Animation variants for the button
  const buttonVariants = {
    hover: {
      scale: 1.1,
      rotate: 90,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
    initial: {
      scale: 1,
      rotate: 0,
    },
  };

  // Function to handle chat selection and navigation
  const handleSetActiveChat = (chatId, username) => {
    navigate(`/home/${username}`); // Navigate to the sub-route
  };

  return (
    <div className="h-full flex">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          className="border-r dark:border-gray-700 flex flex-col"
        >
          {/* Header with Animated Plus Button */}
          <div className="p-4 border-b dark:border-gray-700 flex items-center justify-end shrink-0">
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="
                      rounded-full 
                      bg-background 
                      hover:bg-primary/10 
                      border-primary/20 
                      text-primary 
                      shadow-sm
                      transition-colors
                      duration-200
                    "
                  >
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end" side="bottom">
                <SearchBar setActiveChat={handleSetActiveChat} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-hidden">
            <ChatList setActiveChat={handleSetActiveChat} />
          </div>
        </ResizablePanel>

        <ResizablePanelHandle className="dark:bg-gray-700" />

        <ResizablePanel defaultSize={70} minSize={50} className="h-full">
          {/* Render ChatWindow if username exists, otherwise show placeholder */}
          {username ? (
            <ChatWindow />
          ) : (
            <div className="flex items-center justify-center text-gray-500 h-full">
              Select a chat to start messaging
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Home;
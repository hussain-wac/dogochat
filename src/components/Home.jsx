import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizablePanelHandle,
} from "@/components/ui/resizable";
import ChatList from "./Chatitems/Chatlist";
import SearchBar from "./Chatitems/Searchbar";
import ChatWindow from "./Chatitems/ChatWindow";
import { Button } from "@/components/ui/button";
import { PlusIcon, MessageCircleIcon, Users2, Settings2, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";

function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // Show sidebar by default on mobile when no chat is selected
  const [showSidebar, setShowSidebar] = useState(true); 
  const navigate = useNavigate();
  const { username: initialUsername } = useParams();
  const [selectedUsername, setSelectedUsername] = useState(initialUsername);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setSelectedUsername(initialUsername);
    // Only hide sidebar on mobile when a chat is selected
    if (initialUsername && isMobile) {
      setShowSidebar(false);
    } else if (!initialUsername && isMobile) {
      setShowSidebar(true); // Show chat list by default on mobile
    }
  }, [initialUsername, isMobile]);

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
    initial: { scale: 1 },
    rotate: { 
      rotate: [0, 90],
      transition: { duration: 0.3 }
    }
  };

  const handleSetActiveChat = (chatId, username) => {
    setSelectedUsername(username);
    navigate(`/home/${username}`);
    if (isMobile) setShowSidebar(false);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-900">
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence initial={false}>
            {showSidebar ? (
              <motion.div 
                className="absolute inset-0 bg-white dark:bg-neutral-900 z-10"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b dark:border-neutral-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 flex items-center">
                      <MessageCircleIcon className="h-5 w-5 mr-2 text-orange-500" />
                      Messages
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                        <PopoverTrigger asChild>
                          <motion.div
                            variants={buttonVariants}
                            initial="initial"
                            whileHover="hover"
                            whileTap="tap"
                            animate={isSearchOpen ? "rotate" : "initial"}
                          >
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-full bg-orange-500 hover:bg-orange-600 text-white border-none shadow-md"
                            >
                              <PlusIcon className="h-5 w-5" />
                            </Button>
                          </motion.div>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0 border-none shadow-xl rounded-xl" align="end" side="bottom">
                          <SearchBar setActiveChat={handleSetActiveChat} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ChatList setActiveChat={handleSetActiveChat} />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          
          <div className="h-full">
            {selectedUsername && !showSidebar ? (
              <ChatWindow 
                initialUsername={selectedUsername} 
                onBackClick={toggleSidebar}
              />
            ) : null}
          </div>
          
          {selectedUsername && !showSidebar && (
            <div className="absolute right-4 bottom-4 z-20">
              <motion.div
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  onClick={toggleSidebar}
                  size="icon"
                  className="h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                >
                  <MessageCircleIcon className="h-6 w-6" />
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop view remains unchanged
  return (
    <div className="h-full flex bg-neutral-50 dark:bg-neutral-900">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          className="border-r dark:border-neutral-800 flex flex-col bg-white dark:bg-neutral-900 shadow-md"
        >
          <div className="p-4 border-b dark:border-neutral-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 flex items-center">
              <MessageCircleIcon className="h-5 w-5 mr-2 text-orange-500" />
              Messages
            </h2>
            <div className="flex space-x-2">
              <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <PopoverTrigger asChild>
                  <motion.div
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    animate={isSearchOpen ? "rotate" : "initial"}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-orange-500 hover:bg-orange-600 text-white border-none shadow-md"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 border-none shadow-xl rounded-xl" align="end" side="bottom">
                  <div className="overflow-hidden rounded-xl">
                    <SearchBar setActiveChat={handleSetActiveChat} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatList setActiveChat={handleSetActiveChat} />
          </div>
        </ResizablePanel>
        <ResizablePanelHandle className="w-1.5 bg-neutral-100 dark:bg-neutral-800 transition-colors hover:bg-orange-100 dark:hover:bg-orange-900/30" />
        <ResizablePanel defaultSize={70} minSize={50} className="h-full bg-neutral-50 dark:bg-neutral-900">
          {selectedUsername ? (
            <ChatWindow initialUsername={selectedUsername} />
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-500 h-full space-y-4 p-8">
              {/* <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center animate-pulse"> */}
              <img
              src="/meme2.png"
              alt="Dogochat Logo"
              className="w-60 h-60 filter drop-shadow-md"
            />
                {/* <MessageCircleIcon className="h-12 w-12 text-orange-500" /> */}
              {/* </div> */}
              <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 text-center">
                Welcome to Kabosu
              </h2>
              <p className="text-center max-w-md text-neutral-500 dark:text-neutral-400"> 
                Select a conversation from the sidebar or start a new chat to begin messaging
              </p>
              <Button 
                onClick={() => setIsSearchOpen(true)}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-2 shadow-md"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Conversation
              </Button>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Home;
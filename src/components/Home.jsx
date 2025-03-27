import React, { useState } from "react";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizablePanelHandle 
} from "@/components/ui/resizable";
import ChatList from "./Chatitems/Chatlist";
import ChatWindow from "./Chatitems/ChatWindow";
import SearchBar from "./Chatitems/Searchbar";

function Home() {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="h-full flex">
      <ResizablePanelGroup 
        direction="horizontal" 
        className="flex-1"
      >
        <ResizablePanel 
          defaultSize={30} 
          minSize={20} 
          className="border-r dark:border-gray-700 flex flex-col"
        >
          <SearchBar setActiveChat={setActiveChat} />
          <div className="flex-1 overflow-hidden">
            <ChatList setActiveChat={setActiveChat} />
          </div>
        </ResizablePanel>

        <ResizablePanelHandle className="dark:bg-gray-700" />
        
        <ResizablePanel 
          defaultSize={70} 
          minSize={50} 
          className="h-full"
        >
          <ChatWindow activeChat={activeChat} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Home;
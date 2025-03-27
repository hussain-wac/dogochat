import React, { useState } from "react";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizablePanelHandle 
} from "@/components/ui/resizable";
import ChatList from "./Chatitems/Chatlist";
import ChatWindow from "./Chatitems/ChatWindow";

function Home() {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="dark:bg-gray-900 dark:text-white  flex">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel 
          defaultSize={30} 
          minSize={20} 
          className="border-r dark:border-gray-700"
        >
          <div className="h-full flex flex-col">
            <ChatList setActiveChat={setActiveChat} />
          </div>
        </ResizablePanel>

        <ResizablePanelHandle className="dark:bg-gray-700" />

        <ResizablePanel defaultSize={70} minSize={50}>
          <ChatWindow activeChat={activeChat} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Home;
import React, { useEffect, useState, useRef } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAtomValue } from "jotai";
import { globalState } from "../../jotai/globalState";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  SendHorizontalIcon, 
  UserIcon, 
  MessageCircleIcon 
} from "lucide-react";

function ChatWindow({ activeChat }) {
  const user = useAtomValue(globalState);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (!activeChat) return;
    
    const messagesRef = collection(db, "chats", activeChat, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeChat]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ 
        top: scrollAreaRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    try {
      await addDoc(collection(db, "chats", activeChat, "messages"), {
        sender: user.uid,
        text: newMessage,
        timestamp: new Date(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center  text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <MessageCircleIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="h-6/7 rounded-none border-none shadow-none flex flex-col">
      <CardHeader className="border-b dark:border-gray-700 flex flex-row items-center space-x-3">
        <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
          <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </div>
        <CardTitle>Chat Name</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea 
          ref={scrollAreaRef} 
          className="flex-1 p-4 space-y-3 overflow-y-auto"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${
                msg.sender === user.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              <div 
                className={`
                  p-3 rounded-xl max-w-[70%] 
                  ${msg.sender === user.uid 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}
                `}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex space-x-2">
            <Input 
              placeholder="Type a message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim()}
            >
              <SendHorizontalIcon className="mr-2 h-4 w-4" /> 
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChatWindow;
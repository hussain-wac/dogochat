// chatUtils.js
export const setupMessagesListener = ({
    db, chatId, user, scrollAreaRef, state, updateState,
    prevMessagesLengthRef, prevSenderRef, readTimeoutRef
  }) => {
    return fetchMessages(db, chatId, (msgs) => {
      const prevLength = prevMessagesLengthRef.current;
      const hasNewMessages = msgs.length > prevLength;
      const lastMsg = msgs[msgs.length - 1];
      const isFromCurrentUser = lastMsg?.sender === user.uid;
  
      prevMessagesLengthRef.current = msgs.length;
      prevSenderRef.current = lastMsg?.sender || null;
      updateState({ messages: msgs });
  
      const scrollEl = getScrollElement(scrollAreaRef);
      if (!scrollEl) return;
  
      if (hasNewMessages) {
        if (isFromCurrentUser) {
          setTimeout(() => scrollToBottom(scrollAreaRef, null, null, "smooth"), 50);
        } else if (!state.isAtBottom) {
          const unreadCount = msgs.filter(
            msg => !msg.readBy?.includes(user.uid) && msg.sender !== user.uid
          ).length;
          updateState({ newMessagesCount: unreadCount });
        }
      }
  
      if (prevLength === 0 && msgs.length > 0) {
        setTimeout(() => scrollToBottom(scrollAreaRef, null, null, "auto"), 50);
      }
  
      clearTimeout(readTimeoutRef.current);
      readTimeoutRef.current = setTimeout(() => {
        const messageEls = scrollEl.querySelectorAll("[data-message-id]");
        messageEls.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom >= 0) {
            const msgId = el.getAttribute("data-message-id");
            const msg = msgs.find(m => m.id === msgId);
            if (msg?.sender !== user.uid && !msg.readBy?.includes(user.uid)) {
              markMessageAsRead(db, chatId, msgId, user.uid);
            }
          }
        });
      }, 300);
    });
  };
  
  export const setupPresenceListener = ({ realtimeDb, initialUsername, updateState }) => {
    const presenceRef = ref(realtimeDb, `presence/${initialUsername.toLowerCase()}`);
    return onValue(presenceRef, (snapshot) => {
      const data = snapshot.val() || {};
      updateState({
        isOpponentOnline: data.online || false,
        lastOnline: data.lastOnline || null
      });
    });
  };
  
  export const setupScrollListener = ({ scrollAreaRef, state, updateState, chatId, user, db }) => {
    const scrollEl = getScrollElement(scrollAreaRef);
    if (!scrollEl) return () => {};
  
    const handleScroll = () => {
      const isBottom = checkIsAtBottom(scrollAreaRef);
      updateState({ isAtBottom: isBottom });
  
      if (isBottom && state.newMessagesCount > 0) {
        updateState({ newMessagesCount: 0 });
        state.messages.forEach(msg => {
          if (msg.sender !== user.uid && !msg.readBy?.includes(user.uid)) {
            markMessageAsRead(db, chatId, msg.id, user.uid);
          }
        });
      }
    };
  
    scrollEl.addEventListener("scroll", handleScroll);
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  };
  
  export const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = msg.timestamp.toDateString();
      groups[date] = groups[date] || [];
      groups[date].push(msg);
    });
    return groups;
  };
export const formatMessageTime = (timestamp) => {
    const date =
      timestamp instanceof Date
        ? timestamp
        : typeof timestamp === "string"
        ? new Date(timestamp)
        : timestamp.toDate();
  
    const now = new Date();
    const diffSeconds = (now.getTime() - date.getTime()) / 1000;
  
    if (diffSeconds < 30) return "Just now";
    if (diffSeconds < 60) return "1 min ago";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
  
    const hours = Math.floor(diffSeconds / 3600);
    if (hours < 24) return `${hours} hr ago`;
  
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };
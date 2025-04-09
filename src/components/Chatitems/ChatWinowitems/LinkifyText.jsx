
import React from 'react';
// Helper function to detect and make links clickable with proper wrapping
export const  LinkifyText = ({ text, maxLength = 200 }) => {
  const [expanded, setExpanded] = React.useState(false);
  const isLong = text.length > maxLength;
  const displayText = !expanded && isLong ? `${text.substring(0, maxLength)}...` : text;

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const parts = displayText.split(urlRegex);

  return (
    <div className="break-words overflow-hidden text-wrap" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
      {parts.map((part, index) =>
        urlRegex.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 dark:text-blue-400 underline break-all text-wrap overflow-hidden max-w-full inline-block"
            style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
          >
            {part}
          </a>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-1 text-xs font-medium text-white-500 dark:text-white-400 hover:underline"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
};

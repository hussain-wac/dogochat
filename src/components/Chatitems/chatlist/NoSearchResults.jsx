import React from 'react';
import { Search } from 'lucide-react';

const NoSearchResults = ({ query }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Search className="h-12 w-12 text-neutral-400 mb-4" />
      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
        No results found
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
        We couldn't find any chats matching "{query}"
      </p>
    </div>
  );

  export default NoSearchResults;
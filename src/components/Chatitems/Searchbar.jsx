import React from "react";
import { SearchInput } from "./Search/SearchInput";
import { UserList } from "./Search/UserList";
import { LoadingSpinner } from "./Search/LoadingSpinner";
import useSearchlogic from "../../hooks/useSearchlogic";

export const SearchBar = ({ setActiveChat }) => {
  const {
    users,
    isLoading,
    setSearch,
    startChat,
    search,
    handleKeyDown,
  } = useSearchlogic({ setActiveChat });

  return (
    <div className="p-6 border-b dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
      <SearchInput
        search={search}
        setSearch={setSearch}
        handleKeyDown={handleKeyDown}
      />
      {isLoading && <LoadingSpinner />}
      <UserList users={users} startChat={startChat} search={search} />
    </div>
  );
};

export default SearchBar;
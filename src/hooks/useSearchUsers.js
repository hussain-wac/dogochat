import useSWR from "swr";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const fetchUsers = async (search) => {
  if (!search.trim()) return [];
  
  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    where("username", ">=", search.toLowerCase()),
    where("username", "<=", search.toLowerCase() + "\uf8ff")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty
    ? []
    : querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const useSearchUsers = (search) => {
  const { data, error, isLoading } = useSWR(
    search ? `search-users-${search}` : null,
    () => fetchUsers(search),
    { dedupingInterval: 500 }
  );

  return {
    users: data || [],
    isLoading,
    error
  };
};

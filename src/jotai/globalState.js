import { atomWithStorage } from "jotai/utils";

export const notificationsAtom = atomWithStorage("notifications", []);
export const unreadCountAtom = atomWithStorage("unreadCount", 0);
export const globalState = atomWithStorage("user", null, undefined, {
  getOnInit: true,
});

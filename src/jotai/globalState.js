import { atomWithStorage } from "jotai/utils";

export const chatdetails = atomWithStorage("chatdet" , {})
export const globalState = atomWithStorage("user", null, undefined, {
  getOnInit: true,
});

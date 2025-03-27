import { atomWithStorage } from "jotai/utils";

export const chatname = atomWithStorage("activechatname", "");
export const globalState = atomWithStorage("user", null, undefined, {
  getOnInit: true,
});

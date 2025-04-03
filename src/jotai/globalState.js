import { atomWithStorage } from "jotai/utils";

export const globalState = atomWithStorage("user", null, undefined, {
  getOnInit: true,
});

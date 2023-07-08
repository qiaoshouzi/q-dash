import { defineStore } from "pinia";

interface State {
  pageSize: "pc" | "phone";
  pinDynamicID: string | undefined;
  latestUpdateBiliBiliLoginTS: number | undefined;
}

export const useCounterStore = defineStore("counter", {
  state: (): State => ({
    pageSize: "pc",
    pinDynamicID: undefined,
    latestUpdateBiliBiliLoginTS: undefined,
  }),
  actions: {},
});

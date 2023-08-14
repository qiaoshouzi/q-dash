import { defineStore } from "pinia";

import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";

interface State {
  pageSize: "pc" | "phone";
  catchDynamicStatus: boolean | undefined;
  pinDynamicID: string | undefined;
  latestUpdateBiliBiliLoginTS: number | undefined;
  latestUpdateWeiboLoginTS: number | undefined;
  apiToken: string;
}

export const useCounterStore = defineStore("counter", {
  state: (): State => ({
    pageSize: "pc",
    catchDynamicStatus: undefined,
    pinDynamicID: undefined,
    latestUpdateBiliBiliLoginTS: undefined,
    latestUpdateWeiboLoginTS: undefined,
    apiToken: "",
  }),
  actions: {
    updateCatchDynamicStatus() {
      NaiveUIDiscreteAPI.dialog.warning({
        title: "警告",
        content: `确定要${this.catchDynamicStatus ? "停止" : "继续"}抓取?`,
        positiveText: "确定",
        negativeText: "不确定",
        onPositiveClick: async () => {
          try {
            const resp = await fetch(
              `https://${import.meta.env.Q_API_HostName}/api/setUpdateSwitch?token=${
                import.meta.env.Q_TOKEN
              }`,
              {
                method: "POST",
                body: JSON.stringify({
                  status: !this.catchDynamicStatus,
                }),
              }
            );
            if (resp.status !== 200) {
              throw `Status Error: ${resp.status}`;
            } else {
              const resp_json = await resp.json();
              if (resp_json.code !== 200) {
                throw `resp code Error(${resp_json.code}): ${resp_json.code}`;
              } else {
                NaiveUIDiscreteAPI.message.success("修改成功");
                this.catchDynamicStatus = !this.catchDynamicStatus;
              }
            }
          } catch (e) {
            console.error(e);
            NaiveUIDiscreteAPI.message.error(`修改失败, ${e}`);
          }
        },
      });
    },
  },
});

import { useCounterStore } from "@/stores/counter";
import NaiveUIDiscreteAPI from "./NaiveUIDiscreteAPI";

export default async <T = any>(
  name: string,
  path: string,
  method: "GET" | "POST" | "DELETE",
  opts: {
    body?: { [key: string]: any } | FormData;
    param?: { [key: string]: any };
  } = {}
): Promise<
  | {
      code: number;
      message: string;
      data: T;
    }
  | undefined
> => {
  const counter = useCounterStore();
  NaiveUIDiscreteAPI.loadingBar.start();
  try {
    const url = new URL(`https://${import.meta.env.Q_API_HostName}`);
    url.pathname = path;
    url.searchParams.append("token", counter.apiToken);
    if (opts.param) {
      for (const i in opts.param) {
        url.searchParams.append(i, opts.param[i]);
      }
    }

    const resp = await fetch(String(url), {
      method,
      credentials: "include",
      body:
        opts.body !== undefined
          ? opts.body instanceof FormData
            ? opts.body
            : JSON.stringify(opts.body)
          : undefined,
    });
    if (resp.status !== 200) throw `status error: ${resp.status}`;

    const resp_json = (await resp.json()) as {
      code: number;
      message: string;
      data: any;
    };
    if (resp_json.code === 403) {
      NaiveUIDiscreteAPI.loadingBar.error();
      NaiveUIDiscreteAPI.dialog.warning({
        title: resp_json.message,
        content: "是否跳转到登录界面",
        positiveText: "确定",
        negativeText: "关闭",
        onPositiveClick: () => {
          location.pathname = "/login";
        },
      });
    }
    if (resp_json.code !== 200) throw `${resp_json.code}: ${resp_json.message}`;

    if (resp_json.message !== "") NaiveUIDiscreteAPI.message.success(resp_json.message);
    NaiveUIDiscreteAPI.loadingBar.finish();
    return resp_json;
  } catch (e) {
    console.error(e);
    NaiveUIDiscreteAPI.notification.error({
      title: name,
      content: String(e),
      duration: 3500,
      keepAliveOnHover: true,
    });
    NaiveUIDiscreteAPI.loadingBar.error();
  }
};

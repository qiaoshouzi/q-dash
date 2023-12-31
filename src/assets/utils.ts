import { useCounterStore } from "@/stores/counter";

const counter = useCounterStore();

export const getAssetsUrl = (url: string): string => {
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("http://")) url = url.replace("http://", "https://");
  const rUrl = new URL(url);
  if (rUrl.hostname === import.meta.env.Q_Old_Assets_HostName) {
    rUrl.hostname = import.meta.env.Q_Assets_HostName;
  }
  if (
    rUrl.hostname === import.meta.env.Q_Assets_HostName &&
    rUrl.searchParams.get("token") !== counter.apiToken
  ) {
    rUrl.searchParams.set("token", counter.apiToken);
  }
  return rUrl.toString();
};

export const moveArrValue = (arr: any[], index: number, positions: number) => {
  const value = arr[index];
  const newIndex = index + positions;

  arr.splice(index, 1);
  arr.splice(newIndex, 0, value);

  return arr;
};

export const loadScript = (url: string) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    script.async = true;
    document.body.appendChild(script);
  });
};

export type AnimeData = {
  id: number; // 管理 ID
  cover: string; // cover url
  title: string; // 标题
  type: "follow" | "repair" | "want"; // 追番 补番 想看
  startTime: string | null; // 2023.01.01
  updateTime: string | null; // 五
  ep: number; // 总集数
};

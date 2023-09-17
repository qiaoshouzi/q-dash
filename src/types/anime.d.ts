export type AnimeData = {
  id: number; // 管理 ID
  cover: string; // cover url
  title: string; // 标题
  type: "follow" | "repair" | "want" | "end"; // 追番 补番 想看 完结
  startTime: string | null; // 2023.01.01
  updateTime: {
    week: string | null;
    time: string | null;
  }; // 五
  ep: number | null; // 总集数
};

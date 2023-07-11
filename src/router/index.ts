import NaiveUIDiscreteAPI from "@/assets/NaiveUIDiscreteAPI";
import { createRouter, createWebHistory } from "vue-router";

import HomeView from "@/views/HomeView.vue";
const DynamicView = () => import("@/views/DynamicView.vue");
const AnimeView = () => import("@/views/AnimeView.vue");

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/dynamic",
    name: "Dynamic",
    component: DynamicView,
  },
  {
    path: "/anime",
    name: "Anime",
    component: AnimeView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  // 中文路径
  const decodedPath = decodeURIComponent(to.path);
  if (decodedPath !== to.path) {
    return { path: decodedPath };
  }
});

// 加载进度条
router.beforeEach((to, from, next) => {
  if (to.name !== "Home") NaiveUIDiscreteAPI.loadingBar.start();
  next();
});
router.afterEach((to) => {
  if (to.name !== "Home") NaiveUIDiscreteAPI.loadingBar.finish();
});

export default router;

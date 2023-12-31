/* eslint-disable no-undef */
console.log("Successful registered service worker.");
importScripts("https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js");

workbox.routing.registerRoute(
  /^https:\/\/challenges\.cloudflare\.com\/.+$/,
  new workbox.strategies.NetworkFirst(),
);

workbox.routing.registerRoute(
  /^https:\/\/dash\.cfm\.moe\/assets\/.+\.(js|css)$/,
  new workbox.strategies.CacheFirst(),
);

// assets-dash.cfm.moe/(assets|animeCover)/* 图片等资源
workbox.routing.registerRoute(
  /^https:\/\/assets-dash\.cfm\.moe\/(assets|animeCover)\/.+$/,
  new workbox.strategies.CacheFirst(),
);
// assets-dash.cfm.moe/dynamic/* 动态信息
workbox.routing.registerRoute(
  /^https:\/\/assets-dash\.cfm\.moe\/dynamic\/.+$/,
  new workbox.strategies.StaleWhileRevalidate(),
);
// *.hdslb.com BiliBili图片资源
workbox.routing.registerRoute(
  /^https:\/\/.+\.hdslb\.com\/.+\.(png|jpg|jpeg|svg|gif|webp)$/,
  new workbox.strategies.CacheFirst(),
);

// api-dash.cfm.moe/api/(getAllDynamicData|getConfig|anime) 获取动态信息|获取配置信息|Anime
workbox.routing.registerRoute(
  /^https:\/\/api-dash\.cfm\.moe\/api\/.+\/?.+token=.+$/,
  new workbox.strategies.NetworkFirst({
    networkTimeoutSeconds: 3,
  }),
);

workbox.routing.registerRoute(
  new RegExp(".*.(?:png|jpg|jpeg|svg|gif|webp)"),
  new workbox.strategies.StaleWhileRevalidate(),
);
workbox.routing.registerRoute(
  new RegExp(".*.(css|js)"),
  new workbox.strategies.StaleWhileRevalidate(),
);
workbox.routing.setDefaultHandler(
  new workbox.strategies.NetworkFirst({
    networkTimeoutSeconds: 3,
  }),
);

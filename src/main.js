import Vue from "vue";
import App from "./App.vue";
import store from "./store";

import "@style/alan.css";
import "@style/paper.css";
import "@style/modern.scss";

import FUNCTION from "./utils/test.js";
import directive from "./utils/directive.js";

for (const I in FUNCTION) {
  Vue.prototype[I] = FUNCTION[I];
}
for (const I in directive) {
  Vue.directive(I, directive[I]);
}

function supportsFlexGap() {
  const flex = document.createElement("div");
  flex.style.position = "absolute";
  flex.style.visibility = "hidden";
  flex.style.display = "flex";
  flex.style.flexDirection = "column";
  flex.style.rowGap = "1px";
  flex.appendChild(document.createElement("div"));
  flex.appendChild(document.createElement("div"));
  document.body.appendChild(flex);
  const supported = flex.scrollHeight === 1;
  flex.parentNode.removeChild(flex);
  return supported;
}

if (supportsFlexGap()) {
  document.documentElement.classList.add("supports-flex-gap");
}

function applyWindowInfo(info) {
  if (!info) return;
  const safeArea = info.safeArea || {};
  const menuButtons = info.menuButtons || {};
  const tops = [Number(safeArea.top) || 0, Number(info.statusBarHeight) || 0];
  ["back", "me", "share"].forEach(key => {
    const rect = menuButtons[key];
    if (rect && typeof rect.bottom === "number") tops.push(rect.bottom);
  });
  const topInset = Math.max.apply(null, tops);
  if (topInset > 0) {
    document.documentElement.style.setProperty("--container-top-inset", `${Math.ceil(topInset + 8)}px`);
  }
  if (typeof info.windowHeight === "number" && typeof safeArea.bottom === "number") {
    const bottomInset = Math.max(0, Math.ceil(info.windowHeight - safeArea.bottom));
    document.documentElement.style.setProperty("--container-bottom-inset", `${bottomInset}px`);
  }
  window.dispatchEvent(new Event("xhs-window-info"));
}

function applyFallbackTopInset() {
  if (!window.xhs) return;
  const safeTop =
    parseFloat(getComputedStyle(document.body).getPropertyValue("--safe-area-inset-top")) || 0;
  const fallback = Math.max(88, Math.ceil(safeTop + 48));
  document.documentElement.style.setProperty("--container-top-inset", `${fallback}px`);
  window.dispatchEvent(new Event("xhs-window-info"));
}

function readWindowInfo() {
  const xhs = window.xhs;
  const miniTool = xhs && xhs.miniTool;
  if (!miniTool || typeof miniTool.getWindowInfo !== "function") {
    applyFallbackTopInset();
    return;
  }
  let result;
  try {
    result = miniTool.getWindowInfo();
  } catch (error) {
    applyFallbackTopInset();
    return;
  }
  if (!result || typeof result.then !== "function") {
    applyFallbackTopInset();
    return;
  }
  result.then(applyWindowInfo).catch(applyFallbackTopInset);
}

let windowInfoTimer = null;
function scheduleWindowInfo() {
  if (windowInfoTimer) clearTimeout(windowInfoTimer);
  windowInfoTimer = setTimeout(() => {
    windowInfoTimer = null;
    readWindowInfo();
  }, 150);
}

window.addEventListener("resize", scheduleWindowInfo);
window.addEventListener("orientationchange", scheduleWindowInfo);
window.addEventListener("load", scheduleWindowInfo);
window.addEventListener("pageshow", scheduleWindowInfo);
readWindowInfo();

new Vue({
  el: "#app",
  store,
  render: h => h(App),
});

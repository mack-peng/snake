/**
 * v-first指令的混入方法
 * wowjs dist 为浏览器全局 IIFE（内部依赖 this.WeakMap 等），
 * 不能作为 ES 模块导入 —— 走 ?url 资源 + <script> 注入
 */
import wowJsUrl from "wowjs/dist/wow.js?url";

let loadPromise = null;
function loadWowJs() {
  if (window.WOW) return Promise.resolve();
  if (!loadPromise) {
    loadPromise = new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = wowJsUrl;
      s.onload = resolve;
      document.head.appendChild(s);
    });
  }
  return loadPromise;
}

export default {
  data() {
    return {};
  },
  created() {
    this.$nextTick(() => {
      this.alan_timoutAnimate();
    });
  },
  methods: {
    /**
     * 延迟加载动画
     */
    alan_timoutAnimate() {
      loadWowJs().then(() => {
        const WOW = window.WOW;
        if (WOW) {
          new WOW({
            boxClass: "wow",
            animateClass: "animated",
            mobile: true,
            live: true,
          }).init();
        }
      });
    },
  },
};

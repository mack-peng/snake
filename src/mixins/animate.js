/**
 * v-first指令的混入方法
 * wowjs dist 为全局 IIFE（this.WOW），需副作用导入后取 window.WOW
 */
import "wowjs/dist/wow.js";

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
      const options = {
        boxClass: "wow",
        animateClass: "animated",
        mobile: true,
        live: true,
      };
      const WOW = window.WOW;
      if (WOW) {
        new WOW(options).init();
      }
    },
  },
};

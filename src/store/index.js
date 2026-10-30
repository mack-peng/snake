import Vue from "vue";
import Vuex from "vuex";

import { GET_SESSION, DEL_SESSION } from "../utils/index.js";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    alertQueue: [],
    alertId: 0,
    alertClearTimer: null,
    cartoon: {},
  },
  mutations: {
    /**
     * 新增alert队列
     */
    handleAlert(state, data) {
      state.alertId += 1;
      if (data.clear) {
        clearTimeout(state.alertClearTimer);
        state.alertQueue = [];
        state.alertQueue.push({
          ...data,
          alertId: state.alertId,
        });
        state.alertClearTimer = setTimeout(() => {
          state.alertQueue.shift(1);
        }, 2000);
      } else {
        state.alertQueue.push({
          ...data,
          alertId: state.alertId,
        });
        setTimeout(() => {
          state.alertQueue.shift(1);
        }, 2000);
      }
    },

    /**
     * 显示暴漫图片
     */
    showCartoon(state, data) {
      state.cartoon = data;
    },

    /**
     * 公共方法设置state参数
     */
    submit(state, item) {
      for (const i in item) {
        state[i] = item[i];
      }
    },
  },
  actions: {
    /**
     * 初始化store（sessionStorage 快照恢复）
     */
    initStore(state, _this) {
      if (GET_SESSION("store")) {
        _this.$store.replaceState(
          Object.assign({}, state, JSON.parse(GET_SESSION("store")))
        );
        DEL_SESSION("store");
      }
    },
  },
});
export default store;

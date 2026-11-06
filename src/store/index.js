import Vue from "vue";
import Vuex from "vuex";

import { GET_SESSION, DEL_SESSION } from "../utils/index.js";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    alertQueue: [],
    alertId: 0,
    alertTimers: {},
    cartoon: {},
  },
  mutations: {
    /**
     * 新增alert队列（最多同时 3 条，3s 自动消失；定时器登记可取消）
     */
    handleAlert(state, data) {
      state.alertId += 1;
      const { alertId } = state;
      if (data.clear) {
        for (const id of Object.keys(state.alertTimers)) {
          clearTimeout(state.alertTimers[id]);
        }
        state.alertTimers = {};
        state.alertQueue = [];
      }
      state.alertQueue.push({
        ...data,
        alertId,
      });
      while (state.alertQueue.length > 3) {
        const removed = state.alertQueue.shift();
        clearTimeout(state.alertTimers[removed.alertId]);
        delete state.alertTimers[removed.alertId];
      }
      state.alertTimers[alertId] = setTimeout(() => {
        const idx = state.alertQueue.findIndex(a => a.alertId === alertId);
        if (idx !== -1) state.alertQueue.splice(idx, 1);
        delete state.alertTimers[alertId];
      }, 3000);
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
    initStore(context, _this) {
      const snapshot = GET_SESSION("store");
      if (snapshot) {
        try {
          _this.$store.replaceState(
            Object.assign({}, _this.$store.state, JSON.parse(snapshot))
          );
        } catch (error) {}
        DEL_SESSION("store");
      }
    },
  },
});
export default store;

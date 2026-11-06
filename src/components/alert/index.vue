<template>
  <div
    class="alert_box"
    role="status"
    aria-live="polite"
    :style="{ top: top + 'px' }"
  >
    <transition-group name="alanAlert">
      <div class="alert_style" v-for="item in alertQueue" :key="item.alertId">
        <div :class="`alert alert-${item.type}`">{{ item.content }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return { top: 64 };
  },
  computed: {
    ...mapState(["alertQueue"]),
    alertCount() {
      return this.alertQueue.length;
    },
  },
  watch: {
    alertCount() {
      this.$nextTick(this.syncTop);
    },
  },
  mounted() {
    this.syncTop();
    window.addEventListener("resize", this.syncTop);
    window.addEventListener("orientationchange", this.syncTop);
    window.addEventListener("xhs-window-info", this.syncTop);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.syncTop);
    window.removeEventListener("orientationchange", this.syncTop);
    window.removeEventListener("xhs-window-info", this.syncTop);
  },
  methods: {
    syncTop() {
      const hud = document.querySelector(".hud");
      const title = document.querySelector(".hud_title");
      const alertHeight = this.$el ? this.$el.offsetHeight : 0;
      const titleTop = title ? title.getBoundingClientRect().top : 0;
      if (titleTop > alertHeight + 16) {
        this.top = Math.max(8, Math.round(titleTop - alertHeight - 8));
      } else {
        this.top = (hud ? hud.offsetHeight : 56) + 12;
      }
    },
  },
};
</script>

<style scoped>
.alert_box {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}
.alert_style + .alert_style {
  margin-top: 8px;
}
.supports-flex-gap .alert_box {
  gap: 8px;
}
.supports-flex-gap .alert_style + .alert_style {
  margin-top: 0;
}
.alert_style {
  width: 360px;
  max-width: 78vw;
  pointer-events: auto;
}
.alert {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 52px;
  padding: 8px 16px 8px 19px;
  border: 1px solid var(--ui-line);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.94);
  color: var(--ui-text);
  font-size: 13px;
  font-family: inherit;
  box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.5);
}
.alert::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  width: 3px;
  height: 32px;
  border-radius: 2px;
  background: var(--toast-bar, var(--accent));
}
.alert-primary {
  --toast-bar: #38bdf8;
}
.alert-success {
  --toast-bar: var(--accent);
}
.alert-warning {
  --toast-bar: #fbbf24;
}
.alert-danger {
  --toast-bar: var(--food);
}
.alert-secondary {
  --toast-bar: var(--ui-dim);
}
</style>

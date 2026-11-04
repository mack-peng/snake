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
  },
  mounted() {
    this.syncTop();
    window.addEventListener("resize", this.syncTop);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.syncTop);
  },
  methods: {
    syncTop() {
      const hud = document.querySelector(".hud");
      this.top = (hud ? hud.offsetHeight : 56) + 12;
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
  gap: 8px;
  pointer-events: none;
}
.alert_style {
  width: 360px;
  max-width: 92vw;
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

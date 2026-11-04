<template>
  <div class="alert_box" :style="{ top: top + 'px' }">
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
  width: 500px;
  max-width: 92vw;
  pointer-events: auto;
}
</style>

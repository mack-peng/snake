<template>
  <div class="alert_box">
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
  computed: {
    ...mapState(["alertQueue"]),
  },
};
</script>

<style scoped>
.alert_style {
  width: 500px;
  max-width: 92vw;
  position: fixed;
  top: 10vh;
  left: 0;
  right: 0;
  margin: auto;
  z-index: 30;
}
</style>

<template>
  <div>
    <div class="rain"></div>
    <span
      class="rain--item"
      v-for="(item, idx) in rains"
      :key="idx"
      :style="{ top: `${item.top}px`, left: item.left }"
    ></span>
  </div>
</template>

<script>
// 生成雨滴速度
const CREAT_RAIN_SPACE_TIME = 50;
// 雨滴下落速度
const RAIN_RACE_TIME = 20;

export default {
  data() {
    return {
      rains: [],
      rainTimer: null,
      raceTimer: null,
    };
  },
  created() {
    this.initialRains();
    this.initialRace();
  },
  methods: {
    initialRains() {
      this.rainTimer = setInterval(() => {
        // push 走 Vue 2 数组补丁，避免每次 O(n) 整组复制
        this.rains.push({
          top: -50,
          left: `${~~(Math.random() * 100)}%`,
          speed: 0,
        });
      }, CREAT_RAIN_SPACE_TIME);
    },
    initialRace() {
      this.raceTimer = setInterval(() => {
        const rains = this.rains;
        const bound = window.innerHeight;
        const kept = [];
        for (let i = 0; i < rains.length; i++) {
          const r = rains[i];
          if (r.top >= bound) continue;
          // 原地更新，复用对象；单趟 O(n) 替代 reduce + spread 的 O(n²)
          r.top += r.speed;
          r.speed += 1;
          kept.push(r);
        }
        this.rains = kept;
      }, RAIN_RACE_TIME);
    },
  },
  destroyed() {
    clearInterval(this.rainTimer);
    clearInterval(this.raceTimer);
    this.rainTimer = null;
    this.raceTimer = null;
  },
};
</script>

<style lang="scss" scoped>
.rain {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  background: url("./img/rain-bg.jpg") no-repeat center;
  background-size: cover;

  &--item {
    // position: absolute;
    position: fixed;
    display: inline-block;
    width: 2px;
    height: 60px;
    background: linear-gradient(
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0.6)
    );
    z-index: 0;
  }
}
</style>
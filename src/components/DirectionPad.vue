<template>
  <div class="dpad">
    <button class="pad up" @pointerdown.prevent="tap('up')">▲</button>
    <button class="pad left" @pointerdown.prevent="tap('left')">◀</button>
    <button class="pad right" @pointerdown.prevent="tap('right')">▶</button>
    <button class="pad down" @pointerdown.prevent="tap('down')">▼</button>
  </div>
</template>

<script>
export default {
  name: "DirectionPad",
  methods: {
    tap(dir) {
      this.$emit("dir", dir);
    },
  },
};
</script>

<style scoped lang="scss">
.dpad {
  display: none;
  grid-template-columns: repeat(3, 56px);
  grid-template-rows: repeat(2, 52px);
  gap: 8px;
  justify-content: center;
  user-select: none;
  touch-action: manipulation;
}

/* 按指针能力显示（设计稿规则），不按视口宽度 */
@media (pointer: coarse) {
  .dpad {
    display: grid;
  }
}
.pad {
  border: 1px solid var(--ui-line, rgba(148, 163, 184, 0.25));
  border-radius: 14px;
  background: rgba(148, 163, 184, 0.14);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--ui-text, #e2e8f0);
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.15s ease-out, background 0.15s ease-out;
}
.pad:active {
  transform: scale(0.92);
  background: var(--accent, #4ade80);
  color: #0b1220;
}
.up { grid-column: 2; grid-row: 1; }
.left { grid-column: 1; grid-row: 2; }
.right { grid-column: 3; grid-row: 2; }
.down { grid-column: 2; grid-row: 2; }
</style>

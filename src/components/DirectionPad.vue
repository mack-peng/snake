<template>
  <div class="dpad">
    <button type="button" class="pad up" aria-label="上" @pointerdown.prevent="tap('up')">
      <span class="pad_arrow pad_arrow--up"></span>
    </button>
    <button type="button" class="pad left" aria-label="左" @pointerdown.prevent="tap('left')">
      <span class="pad_arrow pad_arrow--left"></span>
    </button>
    <button type="button" class="pad right" aria-label="右" @pointerdown.prevent="tap('right')">
      <span class="pad_arrow pad_arrow--right"></span>
    </button>
    <button type="button" class="pad down" aria-label="下" @pointerdown.prevent="tap('down')">
      <span class="pad_arrow pad_arrow--down"></span>
    </button>
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
  display: grid;
  grid-template-columns: repeat(3, 92px);
  grid-template-rows: repeat(2, 84px);
  grid-gap: 10px;
  justify-content: center;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

@media (min-width: 1024px) {
  .dpad {
    display: none;
  }
}

.pad {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  margin: 0;
  padding: 14px;
  border: 1px solid var(--ui-line, rgba(148, 163, 184, 0.25));
  border-radius: 18px;
  background: rgba(148, 163, 184, 0.22);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--ui-text, #e2e8f0);
  cursor: pointer;
  transition: transform 0.15s ease-out, background 0.15s ease-out;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}
.pad:active {
  transform: scale(0.92);
  background: var(--accent, #4ade80);
  color: #0b1220;
}
.pad_arrow {
  display: block;
  width: 0;
  height: 0;
  border-style: solid;
}
.pad_arrow--up {
  border-width: 0 12px 18px;
  border-color: transparent transparent currentColor;
}
.pad_arrow--down {
  border-width: 18px 12px 0;
  border-color: currentColor transparent transparent;
}
.pad_arrow--left {
  border-width: 12px 18px 12px 0;
  border-color: transparent currentColor transparent transparent;
}
.pad_arrow--right {
  border-width: 12px 0 12px 18px;
  border-color: transparent transparent transparent currentColor;
}
.up { grid-column: 2; grid-row: 1; }
.left { grid-column: 1; grid-row: 2; }
.right { grid-column: 3; grid-row: 2; }
.down { grid-column: 2; grid-row: 2; }
</style>

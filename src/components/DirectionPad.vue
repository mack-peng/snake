<template>
  <div class="dpad">
    <button class="pad up" @touchstart.prevent="tap('up')">▲</button>
    <button class="pad left" @touchstart.prevent="tap('left')">◀</button>
    <button class="pad right" @touchstart.prevent="tap('right')">▶</button>
    <button class="pad down" @touchstart.prevent="tap('down')">▼</button>
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
  grid-template-columns: repeat(3, 64px);
  grid-template-rows: repeat(2, 56px);
  gap: 8px;
  justify-content: center;
  user-select: none;
  touch-action: manipulation;
}
.pad {
  border: 2px solid #41403e;
  border-radius: 5px;
  box-shadow: 2px 2px 0 #41403e;
  background: #fafafa;
  color: #41403e;
  font-size: 20px;
  cursor: pointer;
}
.pad:active {
  box-shadow: inset 2px 2px 0 #41403e;
  background: #d0dbc2;
}
.up { grid-column: 2; grid-row: 1; }
.left { grid-column: 1; grid-row: 2; }
.right { grid-column: 3; grid-row: 2; }
.down { grid-column: 2; grid-row: 2; }
@media (min-width: 1024px) {
  .dpad { display: none; }
}
</style>

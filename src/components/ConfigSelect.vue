<template>
  <label class="config-select">
    <span class="config-select_title" v-if="title">{{ title }}</span>
    <select class="select" :value="value" @change="apply($event)">
      <option disabled value="">-- {{ title }} --</option>
      <option v-for="o in options" :key="o.label" :value="o">{{ o.label }}</option>
    </select>
  </label>
</template>

<script>
export default {
  name: "ConfigSelect",
  props: {
    title: { type: String, default: "选项" },
    options: { type: Array, required: true },
  },
  data() {
    return { value: "" };
  },
  methods: {
    apply(e) {
      const item = this.options[e.target.selectedIndex - 1];
      if (item) {
        this.value = item;
        this.$emit("apply", item);
      }
    },
  },
};
</script>

<style scoped>
.config-select {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.config-select_title {
  font-size: 14px;
  color: var(--ui-dim, #94a3b8);
}

/* 手机/平板 HUD：隐藏外置标签，下拉自适应 */
@media (max-width: 1023.98px) {
  .config-select {
    display: flex;
    min-width: 0;
  }
  .config-select_title {
    display: none;
  }
  .config-select .select {
    min-width: 0;
  }
}

/* 手机：下拉占满所在行 */
@media (max-width: 767.98px) {
  .config-select {
    width: 100%;
  }
  .config-select .select {
    width: 100%;
    padding: 0 8px;
  }
}
</style>

<template>
  <label class="config-select">
    <span class="config-select_title" v-if="title">{{ title }}</span>
    <select class="select" :value="value" @change="apply($event)">
      <option disabled value="">-- {{ title }} --</option>
      <option v-for="o in options" :key="o.label" :value="o.label">
        {{ o.label }}
      </option>
    </select>
  </label>
</template>

<script>
export default {
  name: "ConfigSelect",
  props: {
    title: { type: String, default: "选项" },
    options: { type: Array, required: true },
    initial: { type: String, default: "" },
  },
  data() {
    return { value: "" };
  },
  created() {
    this.syncValue(this.initial);
  },
  watch: {
    initial(v) {
      this.syncValue(v);
    },
  },
  methods: {
    syncValue(label) {
      const hit =
        (label && this.options.find(o => o.label === label)) || this.options[0];
      this.value = hit ? hit.label : "";
    },
    apply(e) {
      const item = this.options.find(o => o.label === e.target.value);
      if (item) {
        this.value = item.label;
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
}
.config-select > * + * {
  margin-left: 6px;
}
.supports-flex-gap .config-select {
  gap: 6px;
}
.supports-flex-gap .config-select > * + * {
  margin-left: 0;
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
    padding: 0 26px 0 8px;
  }
}
</style>

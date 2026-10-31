<template>
  <label class="config-select">
    <span class="config-select_title" v-if="title">{{ title }}</span>
    <select class="select" :value="value" @change="apply($event.target)">
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
    apply(target) {
      const item = this.options.find(o => o.label === target.value);
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
</style>

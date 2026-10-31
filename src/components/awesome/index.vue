<template>
  <transition name="alanAlert">
    <div class="awe_back" v-if="cartoon.isShow" @click="hideThere">
      <img class="awe_img" :src="imgUrl" alt />
    </div>
  </transition>
</template>

<script>
import { mapState } from "vuex";
const imgs = import.meta.glob("../../assets/img/winOrFail/*.jpg", {
  eager: true,
  import: "default",
});

export default {
  computed: {
    imgUrl() {
      const { type } = this.cartoon;
      if (!type) return;
      const pool = Object.keys(imgs).filter(k =>
        k.endsWith(`/${type}_`)
      );
      const picked = pool[Math.floor(Math.random() * pool.length)];
      return imgs[picked];
    },
    ...mapState(["cartoon"]),
  },
  methods: {
    hideThere() {
      this.HiImg({ isShow: "hide" });
    },
  },
};
</script>

<style scoped>
.awe_back {
  width: 100vw;
  height: 100vh;
  z-index: 20;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.7);
  user-select: none;
}
.awe_img {
  width: 300px;
  max-width: 80vw;
  position: absolute;
  top: 17vh;
  left: 0;
  right: 0;
  margin: auto;
  user-select: none;
}
</style>

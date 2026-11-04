<template>
  <div id="app">
    <Rain />
    <GamePage />
    <Alert />
    <Awesome />
  </div>
</template>

<script>
import Rain from "./components/rain/index.vue";
import Alert from "./components/alert/index.vue";
import Awesome from "./components/awesome/index.vue";
import GamePage from "./page/snake/index.vue";
import { DISPATCH, SET_SESSION, COMMIT } from "./utils";

export default {
  name: "App",
  components: {
    Rain,
    Alert,
    Awesome,
    GamePage,
  },
  beforeCreate() {
    DISPATCH("initStore", this);
  },
  created() {
    this.listenRefresh();
  },
  methods: {
    listenRefresh() {
      window.addEventListener("beforeunload", () => {
        COMMIT({
          submit: {
            alertQueue: [],
            alertTimers: {},
            cartoon: {},
          },
        });
        SET_SESSION("store", JSON.stringify(this.$store.state));
      });
    },
  },
};
</script>

<style></style>

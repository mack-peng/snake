import Vue from "vue";
import App from "./App.vue";
import store from "./store";

import "@style/alan.css";
import "@style/paper.css";
import "wowjs/css/libs/animate.css";
import "@style/responsive.scss";

import FUNCTION from "./utils/test.js";
import directive from "./utils/directive.js";

for (const I in FUNCTION) {
  Vue.prototype[I] = FUNCTION[I];
}
for (const I in directive) {
  Vue.directive(I, directive[I]);
}

new Vue({
  el: "#app",
  store,
  render: h => h(App),
});

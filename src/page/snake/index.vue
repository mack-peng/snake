<template>
  <div class="snake_bg page-shell">
    <header class="hud">
      <div class="hud_title">贪恰蛇 Gluttonous Snake</div>
      <span class="chip">得分 {{ score }}</span>
      <div class="hud_spacer"></div>
      <ConfigSelect title="模式" :options="modeOptions" @apply="sideBarMethod" />
      <ConfigSelect title="棋盘" :options="boardOptions" @apply="sideBarMethod" />
      <ConfigSelect title="难度" :options="difficultyOptions" @apply="sideBarMethod" />
      <button class="btn" @click="switchEvent({ type: 'restart' })">重新开始</button>
      <button class="btn btn--accent" @click="switchEvent({ type: 'stop' })">
        {{ isStop ? "开始" : "暂停" }}
      </button>
    </header>
    <main class="stage-panel game_layout">
      <div class="layout" ref="layout">
        <ul
          class="check_ul cl"
          v-for="(col, cIdx) in formattCheck"
          :key="cIdx"
        >
          <li
            v-for="(row, rIdx) in col"
            :key="rIdx"
            :style="handleLiStyle"
            :ref="`li_${cIdx}`"
          ></li>
        </ul>
      </div>
      <transition name="fade">
        <div class="pause-overlay" v-show="isStop" @click="switchEvent({ type: 'stop' })">
          <img src="../../assets/img/snake/stop.png" alt />
          <p class="pause-hint">点击此处 / 空格键 开始</p>
        </div>
      </transition>
    </main>
    <div class="dpad_wrap">
      <DirectionPad @dir="setDirection" />
    </div>
  </div>
</template>
</template>

<script>
import { SNAKE } from "@constants";
import { DEVICE_PHONE, DEVICE_TABLET, deviceClass, onDeviceClassChange } from "../../utils/device.js";
import { COMMIT } from "../../utils/index.js";
import { $animate } from "../../mixins/index.js";
import ConfigSelect from "../../components/ConfigSelect.vue";
import DirectionPad from "../../components/DirectionPad.vue";
export default {
  name: "SnakeGame",
  components: { ConfigSelect, DirectionPad },
  mixins: [$animate],
  data() {
    return {
      checkerArea: [50, 50],
      currentMode: "classicMode",
      buttonList: SNAKE.buttonList,
      modeOptions: SNAKE.sidebar[0].children,
      boardOptions: SNAKE.sidebar[1].children,
      difficultyOptions: SNAKE.sidebar[2].children,
      liStyle: {},
      snakeLength: 4,
      boardBorder: false,
      snake: [],
      food: [],
      direction: undefined,
      moveTimer: undefined,
      isStop: true,
      wait: true,
      speed: 200,
      score: 0,
      observer: null,
    };
  },
  computed: {
    formattCheck() {
      const [a, b] = this.checkerArea;
      const res = [];
      for (let i = 0; i < a; i++) {
        const arr = [];
        for (let n = 0; n < b; n++) {
          arr[n] = n;
        }
        res[i] = arr;
      }
      return res;
    },

    handleLiStyle() {
      let { liStyle, boardBorder } = this;
      const border = "1px solid #aaa";
      if (boardBorder) {
        liStyle = { ...liStyle, border };
      }
      return liStyle;
    },
  },
  created() {
    this.boardByDevice = true;
    this.checkerArea = this.deviceBoardArea();
    this.createSnake();
    this.$nextTick(() => {
      this.initStyle();
      this.drawSnake();
      this.createFood();
    });
  },
  mounted() {
    this.bindKeycode();
    this.$nextTick(() => {
      this.observer = new ResizeObserver(() => this.initStyle());
      this.observer.observe(this.$refs.layout);
    });
    // 设备档位变化（旋转/跨档拖窗）：未被手动覆盖时自动切棋盘档位
    this.offDevice = onDeviceClassChange(() => {
      if (!this.boardByDevice) return;
      const area = this.deviceBoardArea();
      if (area[0] === this.checkerArea[0]) return;
      this.checkerArea = area;
      this.initStyle();
      this.restartGame();
      this.HiAlert({
        type: "secondary",
        content: `已按屏幕调整为 ${area[0]} x ${area[1]} 棋盘`,
        clear: true,
      });
    });
  },
  unmounted() {
    document.onkeydown = null;
    clearInterval(this.moveTimer);
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.offDevice) {
      this.offDevice();
      this.offDevice = null;
    }
  },
  methods: {
    /**
     * 设备档位对应的默认棋盘
     */
    deviceBoardArea() {
      const cls = deviceClass();
      if (cls === DEVICE_PHONE) return [20, 20];
      if (cls === DEVICE_TABLET) return [30, 30];
      return [50, 50];
    },

    /**
     * 侧边栏事件
     */
    sideBarMethod(item) {
      const { type } = item;
      switch (type) {
        case "board":
          this.chooseBoard(item);
          break;
        case "difficulty":
          this.chooseDifficulty(item);
          break;
        case "mode":
          this.chooseMode(item);
          break;
      }
    },

    /**
     * 选择模式
     */
    chooseMode({ type, mode, label }) {
      let tip = `已切换为${label}`;
      let alertType = "success";
      switch (mode) {
        case "classicMode":
          this.currentMode = mode;
          break;
        case "freeMode":
          this.currentMode = mode;
          break;
        case "adventureMode":
          tip = `暂未开放`;
          alertType = "warning";
          break;
      }
      this.restartGame();
      this.HiAlert({
        type: alertType,
        content: tip,
      });
    },

    /**
     * 选择难度
     */
    chooseDifficulty({ speed, label }) {
      let type = "";
      switch (speed) {
        case "normal":
          this.speed = 80;
          type = "primary";
          break;
        case "hard":
          this.speed = 60;
          type = "warning";
          break;
        case "crazy":
          this.speed = 30;
          type = "danger";
          break;
      }
      this.isStop = true;
      clearInterval(this.moveTimer);
      this.HiAlert({
        type,
        content: `难度已切换为${label}`,
      });
    },

    /**
     * 选择棋盘size
     */
    chooseBoard({ size, label }) {
      this.boardByDevice = false;
      switch (size) {
        case "twenty":
          this.checkerArea = [20, 20];
          break;
        case "fifty":
          this.checkerArea = [50, 50];
          break;
        case "seventy":
          this.checkerArea = [70, 70];
          break;
        case "hundred":
          this.checkerArea = [100, 100];
          break;
        case "border":
          this.boardBorder = !this.boardBorder;
          return;
      }
      this.HiAlert({
        type: "success",
        content: `棋盘已设置为${label}`,
      });
      this.initStyle();
      this.restartGame();
    },

    /**
     * 按钮事件
     */
    switchEvent({ type }) {
      switch (type) {
        case "restart":
          this.restartGame();
          this.HiAlert({
            type: "success",
            content: "游戏已重置！",
          });
          break;
        case "stop":
          this.stopGame();
          break;
      }
    },

    /**
     * 暂停游戏
     */
    stopGame() {
      const { isStop } = this;
      if (!isStop) {
        clearInterval(this.moveTimer);
        this.HiAlert({
          type: "secondary",
          content: "游戏已暂停！",
          clear: true,
        });
      } else {
        this.HiImg({ isShow: "hide" });
        this.HiAlert({
          type: "success",
          content: "游戏已开始！",
          clear: true,
        });
        this.gameStart();
      }
      this.isStop = !isStop;
    },

    /**
     * 重新开始游戏
     */
    restartGame() {
      this.score = 0;
      this.isStop = true;
      clearInterval(this.moveTimer);
      const { layout } = this.$refs;
      const liArr = layout.querySelectorAll("li");
      for (let i = 0, l = liArr.length; i < l; i++) {
        const li = liArr[i];
        li.className = "";
      }
      this.createSnake();
      this.drawSnake();
      this.createFood();
    },

    /**
     * 游戏开始
     */
    gameStart() {
      const { speed } = this;
      clearInterval(this.moveTimer);
      this.moveTimer = setInterval(() => {
        this.snakeMove();
        this.wait = true;
      }, speed);
    },

    /**
     * 按键/虚拟方向键统一入口
     */
    setDirection(dir) {
      const { direction, wait } = this;
      const opposite = { left: "right", right: "left", up: "down", down: "up" };
      if (direction != opposite[dir] && wait) {
        this.direction = dir;
        this.wait = false;
      }
    },

    /**
     * 按键改变方向
     */
    bindKeycode() {
      document.onkeydown = ({ keyCode }) => {
        switch (keyCode) {
          case 37:
            this.setDirection("left");
            break;
          case 38:
            this.setDirection("up");
            break;
          case 39:
            this.setDirection("right");
            break;
          case 40:
            this.setDirection("down");
            break;
          case 32:
            this.stopGame();
            break;
        }
      };
    },

    /**
     * 移动一条蛇
     */
    snakeMove() {
      const { direction, snake, currentMode } = this;
      let [r, c] = snake[0];
      let headAfter = [];
      switch (direction) {
        case "up":
          headAfter = [r - 1, c];
          break;
        case "down":
          headAfter = [r + 1, c];
          break;
        case "left":
          headAfter = [r, c - 1];
          break;
        case "right":
          headAfter = [r, c + 1];
          break;
      }
      if (this.judgeHeadInSelfBody()) {
        this.gameOver();
        return;
      }
      const res = this[currentMode](headAfter);
      switch (currentMode) {
        case "classicMode":
          if (!res) {
            this.gameOver();
            return;
          }
          break;
        case "freeMode":
          headAfter = res;
          break;
      }
      if (this.isAteFood()) {
        this.createFood();
      } else {
        const [row, col] = snake.pop();
        const li = this.$refs[`li_${row}`][col];
        li.className = "";
      }
      snake.unshift(headAfter);
      this.drawSnake();
    },

    /**
     * 经典模式
     */
    classicMode([row, col]) {
      const [R, C] = this.checkerArea;
      if (row < 0 || col < 0 || row == R || col == C) {
        return false;
      } else {
        return true;
      }
    },

    /**
     * 自由模式
     */
    freeMode([row, col]) {
      let [R, C] = this.checkerArea;
      R -= 1;
      C -= 1;
      let snakeHead = [row, col];
      if (row < 0) {
        snakeHead = [R, col];
      }
      if (col < 0) {
        snakeHead = [row, C];
      }
      if (row > R) {
        snakeHead = [0, col];
      }
      if (col > C) {
        snakeHead = [row, 0];
      }
      return snakeHead;
    },

    /**
     * 游戏结束
     */
    gameOver() {
      clearInterval(this.moveTimer);
      this.score = 0;
      this.restartGame();
      this.HiAlert({
        type: "danger",
        content: "游戏结束！",
      });
      this.HiImg({ type: "fail" });
    },

    /**
     * 判断是否吃到了食物
     */
    isAteFood() {
      const [foodRow, foodCol] = this.food;
      const [headRow, headCol] = this.snake[0];
      if (foodRow == headRow && foodCol == headCol) {
        this.score++;
        return true;
      } else {
        return false;
      }
    },

    /**
     * 创建一条蛇
     */
    createSnake() {
      const {
        snakeLength: l,
        checkerArea: [r, c],
      } = this;
      const row = ~~(Math.random() * (r - l - 1) + 1);
      const col = ~~(Math.random() * (c - l - 1) + 1);
      const head = [row, col];
      const body = [];
      const ran = Math.random();
      if (ran > 0.5) {
        for (let i = row + 1; i < row + l; i++) {
          body.push([i, col]);
          this.direction = "up";
        }
      } else {
        for (let i = col + 1; i < col + l; i++) {
          body.push([row, i]);
          this.direction = "left";
        }
      }
      this.snake = [head, ...body];
    },

    /**
     * 画一条蛇
     */
    drawSnake() {
      const { snake } = this;
      snake.map(([a, b], idx) => {
        const li = this.$refs[`li_${a}`][b] || undefined;
        if (!li) {
          return;
        }
        if (idx == 0) {
          li.className = "snake_head";
        } else {
          li.className = "snake_body";
        }
      });
    },

    /**
     * 创建一个食物
     */
    createFood() {
      const {
        checkerArea: [x, y],
        snake,
      } = this;
      while (true) {
        const row = Math.floor(Math.random() * x);
        const col = Math.floor(Math.random() * y);
        for (let i = 0; i < snake.length; i++) {
          const [a, b] = snake[i];
          if (row != a && col != b) {
            this.food = [row, col];
            const food = this.$refs[`li_${row}`][col];
            food.className = "food";
            return;
          }
        }
      }
    },

    /**
     * 判断蛇头是否在自己身上
     */
    judgeHeadInSelfBody() {
      const body = JSON.parse(JSON.stringify(this.snake));
      const [x, y] = body.shift(1);
      for (let i = 0; i < body.length; i++) {
        const [a, b] = body[i];
        if (a == x && b == y) {
          return true;
        }
      }
    },

    /**
     * 初始化棋盘样式
     */
    initStyle() {
      const { layout } = this.$refs;
      if (!layout) return;
      const { offsetWidth, offsetHeight } = layout,
        [a, b] = this.checkerArea,
        w = parseInt(offsetWidth / b) + "px",
        h = parseInt(offsetHeight / a) + "px";
      this.liStyle = { width: w, height: h };
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@style/snake.scss";
</style>

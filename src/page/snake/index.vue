<template>
  <div class="snake_bg page-shell">
    <header class="hud">
      <div class="hud_title">贪恰蛇 Gluttonous Snake</div>
      <span class="chip" aria-live="polite">得分 {{ score }}</span>
      <div class="hud_spacer"></div>
      <div class="hud_config">
        <ConfigSelect
          title="模式"
          :options="modeOptions"
          initial="经典"
          @apply="sideBarMethod"
        />
        <ConfigSelect
          title="棋盘"
          :options="boardOptions"
          :initial="boardInitial"
          @apply="sideBarMethod"
        />
        <ConfigSelect
          title="难度"
          :options="difficultyOptions"
          initial="普通"
          @apply="sideBarMethod"
        />
      </div>
      <button class="btn" @click="switchEvent({ type: 'restart' })">重新开始</button>
      <button class="btn btn--accent" @click="switchEvent({ type: 'stop' })">
        {{ isStop ? "开始" : "暂停" }}
      </button>
    </header>
    <div class="stage">
      <main class="stage-panel game_layout">
        <div class="layout" ref="layout" :class="{ bordered: boardBorder }">
          <ul class="check_ul cl" v-for="r in boardRows" :key="r">
            <li
              v-for="c in boardCols"
              :key="c"
              :ref="`li_${r - 1}`"
            ></li>
          </ul>
        </div>
        <transition name="fade">
          <div
            class="game-overlay game-overlay--start"
            v-if="showStart"
            @click="switchEvent({ type: 'stop' })"
          >
            <div class="overlay_circle overlay_circle--play">
              <span class="overlay_play"></span>
            </div>
            <p class="overlay_title">准备开始</p>
            <p class="overlay_hint">点击开始 / 空格键</p>
            <p class="overlay_meta">{{ modeLabel }} · {{ boardInitial }}<span class="overlay_diff"> · {{ difficultyLabel }}</span></p>
            <p class="overlay_sub">
              {{ currentMode === "freeMode" ? "方向键移动 · 自由模式边缘穿越" : "方向键移动 · 经典模式撞墙结束" }}
            </p>
          </div>
        </transition>
        <transition name="fade">
          <div
            class="game-overlay game-overlay--pause"
            v-if="showPaused"
            @click="switchEvent({ type: 'stop' })"
          >
            <div class="overlay_circle overlay_circle--pause">
              <span class="overlay_bar"></span>
              <span class="overlay_bar"></span>
            </div>
            <p class="overlay_title">已暂停</p>
            <p class="overlay_hint">点击继续 / 空格键</p>
            <p class="overlay_score">得分 {{ score }}</p>
          </div>
        </transition>
        <transition name="fade">
          <div class="result-veil" v-if="showResult" @click.self="closeResult">
            <div class="result-card" role="dialog" aria-label="游戏结束">
              <p class="result_title">游戏结束</p>
              <p class="result_score">{{ finalScore }}</p>
              <p class="result_label">本次得分</p>
              <p class="result_meta">{{ resultMeta }}</p>
              <div class="result_actions">
                <button class="btn btn--accent result_primary" @click="replay">
                  再来一局
                </button>
                <button class="btn result_secondary" @click="closeResult">关闭</button>
              </div>
              <p class="result_close_hint">点击空白处关闭</p>
            </div>
          </div>
        </transition>
      </main>
      <p class="stage_hint">
        方向键控制<span class="hint_extra"> · 空格暂停 · {{ checkerArea[0] }} × {{ checkerArea[1] }}</span>
      </p>
    </div>
    <div class="dpad_wrap">
      <DirectionPad @dir="setDirection" />
    </div>
  </div>
</template>

<script>
import { SNAKE } from "@constants";
import { DEVICE_PHONE, DEVICE_TABLET, deviceClass, onDeviceClassChange } from "../../utils/device.js";
import { COMMIT } from "../../utils/index.js";
import ConfigSelect from "../../components/ConfigSelect.vue";
import DirectionPad from "../../components/DirectionPad.vue";
export default {
  name: "SnakeGame",
  components: { ConfigSelect, DirectionPad },
  data() {
    return {
      checkerArea: [50, 50],
      currentMode: "classicMode",
      buttonList: SNAKE.buttonList,
      modeOptions: SNAKE.sidebar[0].children,
      boardOptions: SNAKE.sidebar[1].children,
      difficultyOptions: SNAKE.sidebar[2].children,
      snakeLength: 4,
      boardBorder: false,
      snake: [],
      food: [],
      direction: undefined,
      moveTimer: undefined,
      isStop: true,
      wait: true,
      speed: 80,
      score: 0,
      hasStarted: false,
      resultOpen: false,
      finalScore: 0,
      observer: null,
    };
  },
  computed: {
    showStart() {
      return !this.resultOpen && !this.hasStarted;
    },
    showPaused() {
      return !this.resultOpen && this.hasStarted && this.isStop;
    },
    showResult() {
      return this.resultOpen;
    },
    boardInitial() {
      const [r, c] = this.checkerArea;
      return `${r} × ${c}`;
    },
    modeLabel() {
      return this.currentMode === "freeMode" ? "自由" : "经典";
    },
    difficultyLabel() {
      if (this.speed <= 30) return "疯狂";
      if (this.speed <= 60) return "困难";
      return "普通";
    },
    resultMeta() {
      return `${this.modeLabel} · ${this.boardInitial} · ${this.difficultyLabel}`;
    },
    boardRows() {
      return this.checkerArea[0];
    },
    boardCols() {
      return this.checkerArea[1];
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
      // rAF 合并 HUD→棋盘的级联 resize，每帧最多重算一次格距
      this.observer = new ResizeObserver(() => {
        if (this.layoutRaf) cancelAnimationFrame(this.layoutRaf);
        this.layoutRaf = requestAnimationFrame(() => {
          this.layoutRaf = null;
          this.initStyle();
        });
      });
      this.observer.observe(this.$refs.layout);
      this.syncHudHeight();
      this.hudObserver = new ResizeObserver(() => this.syncHudHeight());
      this.hudObserver.observe(this.$el.querySelector(".hud"));
    });
    // 设备档位变化（旋转/跨档拖窗）：未被手动覆盖时自动切棋盘档位
    this.offDevice = onDeviceClassChange(() => {
      if (!this.boardByDevice) return;
      const area = this.deviceBoardArea();
      if (area[0] === this.checkerArea[0]) return;
      this.checkerArea = area;
      this.$nextTick(() => {
        this.initStyle();
        this.restartGame();
      });
      this.HiAlert({
        type: "secondary",
        content: `已按屏幕调整为 ${area[0]} x ${area[1]} 棋盘`,
        clear: true,
      });
    });
  },
  unmounted() {
    if (this.onKeydown) {
      document.removeEventListener("keydown", this.onKeydown);
      this.onKeydown = null;
    }
    clearInterval(this.moveTimer);
    if (this.layoutRaf) {
      cancelAnimationFrame(this.layoutRaf);
      this.layoutRaf = null;
    }
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.hudObserver) {
      this.hudObserver.disconnect();
      this.hudObserver = null;
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
     * HUD 实际高度写入 CSS 变量，供棋盘尺寸计算
     */
    syncHudHeight() {
      const hud = this.$el.querySelector(".hud");
      if (hud) {
        document.documentElement.style.setProperty("--hud-h", `${hud.offsetHeight}px`);
      }
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
    chooseMode({ mode, label }) {
      this.currentMode = mode;
      this.restartGame();
      this.HiAlert({
        type: "success",
        content: `已切换为${label}`,
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
      switch (size) {
        case "border":
          this.boardBorder = !this.boardBorder;
          return;
        case "twenty":
          this.checkerArea = [20, 20];
          break;
        case "thirty":
          this.checkerArea = [30, 30];
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
        default:
          return;
      }
      this.boardByDevice = false;
      this.HiAlert({
        type: "success",
        content: `棋盘已设置为${label}`,
      });
      this.$nextTick(() => {
        this.initStyle();
        this.restartGame();
      });
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
      if (this.resultOpen) return;
      const { isStop } = this;
      if (!isStop) {
        clearInterval(this.moveTimer);
        this.HiAlert({
          type: "secondary",
          content: "游戏已暂停！",
          clear: true,
        });
      } else {
        this.HiAlert({
          type: "success",
          content: this.hasStarted ? "继续游戏！" : "游戏已开始！",
          clear: true,
        });
        this.hasStarted = true;
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
      this.hasStarted = false;
      this.resultOpen = false;
      clearInterval(this.moveTimer);
      // 只清理上一帧有类名的格子（蛇身 + 食物），避免 O(cells) 全量扫 DOM
      for (const [row, col] of [...this.snake, this.food]) {
        this.setCell(row, col, "");
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
     * 按键改变方向（仅游戏页语境：不劫持输入控件与可交互元素）
     */
    bindKeycode() {
      this.onKeydown = event => {
        const { target } = event;
        if (
          target &&
          target.closest &&
          target.closest("input, textarea, select, button, a, [contenteditable]")
        ) {
          return;
        }
        switch (event.keyCode) {
          case 37:
            event.preventDefault();
            this.setDirection("left");
            break;
          case 38:
            event.preventDefault();
            this.setDirection("up");
            break;
          case 39:
            event.preventDefault();
            this.setDirection("right");
            break;
          case 40:
            event.preventDefault();
            this.setDirection("down");
            break;
          case 32:
            event.preventDefault();
            this.stopGame();
            break;
        }
      };
      document.addEventListener("keydown", this.onKeydown);
    },

    /**
     * 移动一条蛇
     */
    snakeMove() {
      const { direction, snake, currentMode } = this;
      if (!direction) return;
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
      if (this.hitsSelf(headAfter)) {
        this.gameOver();
        return;
      }
      const ate = this.isAteFood();
      if (!ate) {
        const [row, col] = snake.pop();
        this.setCell(row, col, "");
      }
      snake.unshift(headAfter);
      if (ate) {
        this.createFood();
      }
      // 增量绘制：每 tick 只有新头 + 旧头（降级为身体）两格变化
      this.setCell(headAfter[0], headAfter[1], "snake_head");
      const prevHead = snake[1];
      this.setCell(prevHead[0], prevHead[1], "snake_body");
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
     * 游戏结束：保留终局面，弹结果卡
     */
    gameOver() {
      clearInterval(this.moveTimer);
      this.finalScore = this.score;
      this.isStop = true;
      this.hasStarted = false;
      this.resultOpen = true;
    },

    /**
     * 再来一局：重置棋盘并直接开局
     */
    replay() {
      this.restartGame();
      this.hasStarted = true;
      this.isStop = false;
      this.gameStart();
      this.HiAlert({
        type: "success",
        content: "游戏已开始！",
        clear: true,
      });
    },

    /**
     * 关闭结果卡：回到准备开始态
     */
    closeResult() {
      this.restartGame();
    },

    /**
     * 判断是否吃到了食物
     */
    isAteFood() {
      if (!this.food.length) return false;
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
     * 写单格类名（refs 直取，越界/换盘竞态时静默跳过）
     */
    setCell(row, col, cls) {
      const rowRef = this.$refs[`li_${row}`];
      const li = rowRef && rowRef[col];
      if (li) li.className = cls;
    },

    /**
     * 画一条蛇（整幅重绘：开局 / 换盘后使用）
     */
    drawSnake() {
      const { snake } = this;
      snake.forEach(([a, b], idx) => {
        this.setCell(a, b, idx == 0 ? "snake_head" : "snake_body");
      });
    },

    /**
     * 创建一个食物：稀疏时拒绝采样（期望 O(1)），过半占用改为有界线性扫描
     */
    createFood() {
      const {
        checkerArea: [x, y],
        snake,
      } = this;
      const total = x * y;
      if (snake.length >= total) {
        this.food = [];
        return;
      }
      const taken = new Set(snake.map(([a, b]) => `${a},${b}`));
      let row;
      let col;
      if (taken.size < total / 2) {
        do {
          row = Math.floor(Math.random() * x);
          col = Math.floor(Math.random() * y);
        } while (taken.has(`${row},${col}`));
      } else {
        const start = Math.floor(Math.random() * total);
        for (let i = 0; i < total; i++) {
          const idx = (start + i) % total;
          row = Math.floor(idx / y);
          col = idx % y;
          if (!taken.has(`${row},${col}`)) break;
        }
      }
      this.food = [row, col];
      this.setCell(row, col, "food");
    },

    /**
     * 判断将要到达的位置是否撞到自己（尾巴即将让位，不计入）
     */
    hitsSelf([row, col]) {
      const body = this.snake;
      const last = body.length - 1;
      for (let i = 0; i < last; i++) {
        if (body[i][0] == row && body[i][1] == col) return true;
      }
      return false;
    },

    /**
     * 初始化棋盘样式：只写 CSS 变量，格子尺寸由样式表读取，不再触发 10k 次响应式 patch
     */
    initStyle() {
      const { layout } = this.$refs;
      if (!layout) return;
      const { offsetWidth, offsetHeight } = layout;
      const [a, b] = this.checkerArea;
      layout.style.setProperty("--cell-w", `${offsetWidth / b}px`);
      layout.style.setProperty("--cell-h", `${offsetHeight / a}px`);
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@style/snake.scss";
</style>

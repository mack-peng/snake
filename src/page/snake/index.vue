<template>
  <div class="snake_bg page-shell" :class="{ 'is-playing': isPlaying }">
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
                <button
                  class="btn btn--accent result_share"
                  :disabled="sharing"
                  @click="shareResult"
                >
                  {{ sharing ? "分享中" : "分享战绩" }}
                </button>
                <button class="btn result_primary" @click="replay">
                  再来一局
                </button>
                <button class="btn result_secondary" @click="closeResult">关闭</button>
              </div>
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
      speed: 130,
      difficulty: "普通",
      score: 0,
      hasStarted: false,
      resultOpen: false,
      finalScore: 0,
      sharing: false,
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
      return this.difficulty;
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
    isPlaying() {
      return this.hasStarted && !this.isStop && !this.resultOpen;
    },
  },
  watch: {
    isPlaying() {
      this.$nextTick(() => {
        this.syncHudHeight();
        this.initStyle();
      });
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
    this.onSyncLayout = () => this.syncHudHeight();
    window.addEventListener("resize", this.onSyncLayout);
    window.addEventListener("orientationchange", this.onSyncLayout);
    window.addEventListener("xhs-window-info", this.onSyncLayout);
    this.$nextTick(() => {
      this.syncHudHeight();
      if (typeof ResizeObserver === "function") {
        // rAF 合并 HUD→棋盘的级联 resize，每帧最多重算一次格距
        this.observer = new ResizeObserver(() => {
          this.scheduleLayoutUpdate();
        });
        this.observer.observe(this.$refs.layout);
        this.hudObserver = new ResizeObserver(() => this.syncHudHeight());
        this.hudObserver.observe(this.$el.querySelector(".hud"));
      } else {
        this.onWindowResize = () => {
          this.scheduleLayoutUpdate();
          this.syncHudHeight();
        };
        window.addEventListener("resize", this.onWindowResize);
        window.addEventListener("orientationchange", this.onWindowResize);
      }
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
    if (this.onWindowResize) {
      window.removeEventListener("resize", this.onWindowResize);
      window.removeEventListener("orientationchange", this.onWindowResize);
      this.onWindowResize = null;
    }
    if (this.onSyncLayout) {
      window.removeEventListener("resize", this.onSyncLayout);
      window.removeEventListener("orientationchange", this.onSyncLayout);
      window.removeEventListener("xhs-window-info", this.onSyncLayout);
      this.onSyncLayout = null;
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
     * rAF 合并 resize 回调，每帧最多重算一次格距
     */
    scheduleLayoutUpdate() {
      if (this.layoutRaf) cancelAnimationFrame(this.layoutRaf);
      this.layoutRaf = requestAnimationFrame(() => {
        this.layoutRaf = null;
        this.initStyle();
      });
    },

    /**
     * HUD 实际高度写入 CSS 变量，供棋盘尺寸计算
     */
    syncHudHeight() {
      const hud = this.$el.querySelector(".hud");
      if (!hud) return;
      const hudHeight = hud.offsetHeight;
      document.documentElement.style.setProperty("--hud-h", `${hudHeight}px`);

      const stage = this.$el.querySelector(".stage");
      const hint = this.$el.querySelector(".stage_hint");
      const dpad = this.$el.querySelector(".dpad");
      const dpadWrap = this.$el.querySelector(".dpad_wrap");
      const landscape = window.innerWidth > window.innerHeight;
      const compact = window.innerWidth < 1024;
      const marginTop = stage ? parseFloat(getComputedStyle(stage).marginTop) || 12 : 12;
      const hintSpace = hint
        ? hint.offsetHeight + (parseFloat(getComputedStyle(hint).marginTop) || 0)
        : 0;

      const rootStyle = getComputedStyle(this.$el);
      const readInset = name => parseFloat(rootStyle.getPropertyValue(name)) || 0;
      let bottomReserve =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--board-reserve")
        ) || 76;
      let extraBottomInset = 0;
      if (compact && landscape) {
        bottomReserve = 0;
        extraBottomInset =
          readInset("--container-bottom-inset") || readInset("--safe-area-inset-bottom");
      } else if (
        compact &&
        dpad &&
        dpadWrap &&
        getComputedStyle(dpad).display !== "none"
      ) {
        bottomReserve =
          dpad.offsetHeight + (parseFloat(getComputedStyle(dpadWrap).bottom) || 0) + 16;
      } else {
        extraBottomInset =
          readInset("--container-bottom-inset") || readInset("--safe-area-inset-bottom");
      }

      const widthLimit = compact && landscape ? window.innerWidth - 200 : window.innerWidth - 28;
      const heightLimit =
        window.innerHeight - hudHeight - bottomReserve - marginTop - hintSpace - extraBottomInset;
      const stageSize = Math.max(120, Math.floor(Math.min(700, widthLimit, heightLimit)));
      document.documentElement.style.setProperty("--stage-size", `${stageSize}px`);
      this.$el.classList.toggle("board-compact", stageSize < 300);
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
    chooseMode({ mode }) {
      this.currentMode = mode;
      this.restartGame();
    },

    /**
     * 选择难度
     */
    chooseDifficulty({ speed, label }) {
      this.difficulty = label;
      switch (speed) {
        case "normal":
          this.speed = 130;
          break;
        case "hard":
          this.speed = 90;
          break;
        case "crazy":
          this.speed = 60;
          break;
      }
      this.isStop = true;
      clearInterval(this.moveTimer);
    },

    /**
     * 选择棋盘size
     */
    chooseBoard({ size }) {
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
        if (this.snake.length) {
          const [row, col] = this.snake[0];
          this.setCell(row, col, this.headClass());
        }
      }
    },

    headClass() {
      return `snake_head snake_head--${this.direction || "up"}`;
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
      this.setCell(headAfter[0], headAfter[1], this.headClass());
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

    roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + width, y, x + width, y + height, radius);
      ctx.arcTo(x + width, y + height, x, y + height, radius);
      ctx.arcTo(x, y + height, x, y, radius);
      ctx.arcTo(x, y, x + width, y, radius);
      ctx.closePath();
    },

    buildResultImage() {
      const canvas = document.createElement("canvas");
      canvas.width = 750;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas unavailable");
      const fontFamily =
        "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif";

      const background = ctx.createLinearGradient(0, 0, 750, 1000);
      background.addColorStop(0, "#0b1220");
      background.addColorStop(0.55, "#0f1b2f");
      background.addColorStop(1, "#13233b");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, 750, 1000);

      const glow = ctx.createRadialGradient(375, 360, 30, 375, 360, 380);
      glow.addColorStop(0, "rgba(74, 222, 128, 0.2)");
      glow.addColorStop(1, "rgba(74, 222, 128, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 750, 1000);

      ctx.strokeStyle = "rgba(148, 163, 184, 0.28)";
      ctx.lineWidth = 2;
      this.roundRect(ctx, 36, 36, 678, 928, 40);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#94a3b8";
      ctx.font = `600 24px ${fontFamily}`;
      ctx.fillText("GLUTTONOUS SNAKE", 375, 118);

      ctx.fillStyle = "#e2e8f0";
      ctx.font = `700 60px ${fontFamily}`;
      ctx.fillText("贪恰蛇", 375, 196);

      ctx.fillStyle = "#94a3b8";
      ctx.font = `400 28px ${fontFamily}`;
      ctx.fillText("本次得分", 375, 330);

      ctx.fillStyle = "#4ade80";
      ctx.font = `700 170px ${fontFamily}`;
      ctx.fillText(String(this.finalScore), 375, 470);

      ctx.fillStyle = "#cbd5e1";
      ctx.font = `400 30px ${fontFamily}`;
      ctx.fillText(this.resultMeta, 375, 610);

      ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(130, 680);
      ctx.lineTo(620, 680);
      ctx.stroke();

      const segment = 56;
      const gap = 10;
      const totalWidth = segment * 5 + gap * 4 + 56;
      const startX = (750 - totalWidth) / 2;
      const snakeY = 748;
      for (let index = 0; index < 5; index++) {
        this.roundRect(ctx, startX + index * (segment + gap), snakeY, segment, segment, 14);
        ctx.fillStyle = index === 4 ? "#4ade80" : "#22c55f";
        ctx.fill();
      }
      const headX = startX + 4 * (segment + gap);
      ctx.fillStyle = "#0b1220";
      ctx.beginPath();
      ctx.arc(headX + 38, snakeY + 20, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(headX + 38, snakeY + 36, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f87171";
      ctx.beginPath();
      ctx.arc(startX + 5 * (segment + gap) + 20, snakeY + segment / 2, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#94a3b8";
      ctx.font = `400 24px ${fontFamily}`;
      ctx.fillText("小红书小工具 · 来挑战我的记录", 375, 910);

      return canvas.toDataURL("image/jpeg", 0.92);
    },

    getShareCopy() {
      const score = this.finalScore;
      let title;
      let line;
      if (score <= 0) {
        title = "贪恰蛇 0 分，谁来救救我";
        line = "开局就迷路，这条蛇比想象中难带。来试试你能拿多少分？";
      } else if (score < 10) {
        title = `贪恰蛇 ${score} 分，刚热完身`;
        line = "刚找到一点手感，感觉还能再往上冲。来试试你能不能超过我？";
      } else if (score < 20) {
        title = `贪恰蛇 ${score} 分，有点上头`;
        line = "越玩越上头，这个分数还没到我的极限。来试试你能不能超过我？";
      } else if (score < 40) {
        title = `贪恰蛇 ${score} 分，等你来破`;
        line = "这个分数应该还算能打，看看你能不能超过我？";
      } else {
        title = `贪恰蛇 ${score} 分，记录等你破`;
        line = "手感和运气都在线，这个记录先放在这里。来试试你能不能超过我？";
      }
      return {
        title,
        content: `我在小红书小工具「贪恰蛇」里拿到了 ${score} 分（${this.resultMeta}）。\n${line}`,
      };
    },

    async shareResult() {
      if (this.sharing) return;
      this.sharing = true;
      try {
        const dataUrl = this.buildResultImage();
        const miniTool = window.xhs && window.xhs.miniTool;
        if (!miniTool) {
          this.HiAlert({ type: "warning", content: "请在小红书 App 内分享", clear: true });
          return;
        }

        let imageUrl = dataUrl;
        if (typeof miniTool.writeTempFile === "function") {
          try {
            const result = await miniTool.writeTempFile({ data: dataUrl });
            if (result && result.filePath) imageUrl = result.filePath;
          } catch (error) {}
        }

        if (typeof miniTool.postNote === "function") {
          const copy = this.getShareCopy();
          await miniTool.postNote({
            title: copy.title,
            content: copy.content,
            pageType: "photo_publish",
            mediaInfo: { image_resources: [{ url: imageUrl }] },
          });
          return;
        }

        if (typeof miniTool.saveImageToPhotosAlbum === "function") {
          await miniTool.saveImageToPhotosAlbum({ filePath: imageUrl });
          this.HiAlert({ type: "success", content: "结算图已保存到相册", clear: true });
          return;
        }

        this.HiAlert({ type: "warning", content: "当前版本暂不支持分享", clear: true });
      } catch (error) {
        this.HiAlert({ type: "danger", content: "分享失败，请稍后重试", clear: true });
      } finally {
        this.sharing = false;
      }
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
      const margin = Math.max(6, Math.floor(Math.min(r, c) * 0.2));
      const directions = ["up", "down", "left", "right"];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const pick = (min, max) => {
        if (max <= min) return min;
        return min + Math.floor(Math.random() * (max - min + 1));
      };
      const body = [];
      let head;

      if (direction === "up" || direction === "down") {
        const minRow = direction === "up" ? margin : margin + l - 1;
        const maxRow = direction === "up" ? r - l - margin : r - 1 - margin;
        const row = pick(minRow, maxRow);
        const col = pick(margin, c - margin - 1);
        head = [row, col];
        for (let i = 1; i < l; i++) {
          body.push(direction === "up" ? [row + i, col] : [row - i, col]);
        }
      } else {
        const minCol = direction === "left" ? margin : margin + l - 1;
        const maxCol = direction === "left" ? c - l - margin : c - 1 - margin;
        const col = pick(minCol, maxCol);
        const row = pick(margin, r - margin - 1);
        head = [row, col];
        for (let i = 1; i < l; i++) {
          body.push(direction === "left" ? [row, col + i] : [row, col - i]);
        }
      }

      this.direction = direction;
      this.wait = true;
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
        this.setCell(a, b, idx == 0 ? this.headClass() : "snake_body");
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

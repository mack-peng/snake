# Gluttonous Snake（贪恰蛇）

从 [Awesome-Game](https://github.com/ordinaryA/Awesome-Game) 拆分的独立小游戏，Vue 2.7 + Vite 重构，全端响应式（桌面 / 平板 / 手机可玩）。

## 玩法

- 方向键控制（桌面）；移动端棋盘下方虚拟十字键
- 空格键 / 暂停按钮暂停游戏；经典（撞墙结束）/ 自由（穿墙）两种模式
- 棋盘 20×20 ~ 100×100 可调

## 开发

```bash
npm install
npm run dev      # 开发（Vite dev server）
npm run build    # 构建 → dist/
npm run preview  # 本地预览构建产物
```

## 结构

```
src/
├── main.js               # 入口
├── App.vue               # Rain 特效 + 游戏页 + Alert + Awesome 漫画
├── page/snake/index.vue  # 游戏本体（网格蛇 + 模式）
├── components/           # alert / awesome / rain / ConfigSelect / DirectionPad
├── constants/snake.js    # 模式 / 棋盘 / 难度配置
├── assets/{css,img}      # papercss + 素材
├── store/                # Vuex（alert/cartoon）
└── utils/  mixins/
```

## 来源与说明

- 游戏逻辑来自 Awesome-Game（Vue 2.5 + webpack 3），迁移到 Vue 2.7 + Vite
- 响应式：棋盘 `min(700px, 92vw)` + `ResizeObserver` 重算格子；`<768px` 隐藏侧栏、启用下拉；`≥1024px` 隐藏虚拟方向键

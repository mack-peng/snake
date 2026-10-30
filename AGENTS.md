# Gluttonous Snake agent

## 项目

- Vue 2.7 + Vite 5 + Vuex 3 + sass(dart-sass) + wowjs
- 由 ~/Projects/Awesome-Game 拆分迁移而来（该仓只读参考）
- GitHub: https://github.com/mack-peng/snake

## 命令

| 命令 | 作用 |
|------|------|
| npm run dev | Vite dev server |
| npm run build | 构建到 dist/ |
| npm run preview | 预览构建产物 |

## 约定

- commit 全英文 `<type>(<scope>): <desc>`；禁止 force push
- 方向输入统一走 setDirection(dir)（键盘 37-40 与 DirectionPad @dir 同源）
- 棋盘格子尺寸由 initStyle() 按 offsetWidth/N 计算，ResizeObserver 触发重算（勿改回一次性计算）
- 全局方法 HiAlert/HiImg 挂 Vue.prototype（src/utils/test.js）
- 响应式断点：<768px 隐藏侧栏用 ConfigSelect 下拉；≥1024px 隐藏 DirectionPad

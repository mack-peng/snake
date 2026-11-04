const sidebar = [{
  title: '游戏模式 (Game Modes)',
  children: [{
    label: '经典',
    type: 'mode',
    mode: 'classicMode'
  },
  {
    label: '自由',
    type: 'mode',
    mode: 'freeMode'
  }
  ]
},
{
  title: '棋盘 (Checkerboard)',
  children: [{
    label: '边框',
    type: 'board',
    size: 'border'
  },
  {
    label: '20 × 20',
    type: 'board',
    size: 'twenty'
  },
  {
    label: '30 × 30',
    type: 'board',
    size: 'thirty'
  },
  {
    label: '50 × 50',
    type: 'board',
    size: 'fifty'
  },
  {
    label: '70 × 70',
    type: 'board',
    size: 'seventy'
  },
  {
    label: '100 × 100',
    type: 'board',
    size: 'hundred'
  }
  ]
},
{
  title: '难度 (Difficulty)',
  children: [{
    type: 'difficulty',
    speed: 'normal',
    label: '普通'
  },
  {
    type: 'difficulty',
    speed: 'hard',
    label: '困难'
  },
  {
    type: 'difficulty',
    speed: 'crazy',
    label: '疯狂'
  }
  ]
}
];

const buttonList = [{
  label: '重新开始 (RESTART)',
  type: 'restart'
},
{
  label: '暂停游戏 (空格键 SPACE)',
  type: 'stop'
}
];

export {
  sidebar,
  buttonList
};

export default {};

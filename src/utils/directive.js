/**
 * 初次加载动画指令
 * duration:动画持续时间 delay:动画延迟时间 offset:距离底部距离开始动画
 * @param {object}
 * @return {void}
 */
const first = {
  bind(el, binding) {
    const attr = binding.value;
    el.className += ' wow';
    for (const key in attr) {
      if (key == 'name') {
        el.className += ` ${attr[key]}`;
      } else {
        el.setAttribute(`data-wow-${key}`, attr[key]);
      }
    }
  }
};

const directive = {
  first,
};

export default directive;

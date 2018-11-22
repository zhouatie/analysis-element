import { once, on } from 'element-ui/src/utils/dom';
/**
 * 主要作用：快速点击事件，鼠标按下的时候，每隔100ms执行一次绑定的函数，
 * 给document绑定一次性的mouseup事件，当鼠标按住事件小于100ms时，
 * 抬起的时候触发一次绑定的事件，当超过100ms后抬起，每隔100ms触发一次
 *  */
export default {
  bind(el, binding, vnode) {
    let interval = null;
    let startTime;
    const handler = () => vnode.context[binding.expression].apply();
    const clear = () => {
      if (new Date() - startTime < 100) {
        handler();
      }
      clearInterval(interval);
      interval = null;
    };

    on(el, 'mousedown', (e) => {
      // 限制只有左键点击触发
      if (e.button !== 0) return;
      startTime = new Date();
      once(document, 'mouseup', clear);
      clearInterval(interval);
      interval = setInterval(handler, 100);
    });
  }
};

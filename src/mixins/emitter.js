/**
 * 广播递归遍历所有子组件的指定事件触发
 *  */
function broadcast(componentName, eventName, params) {
  this.$children.forEach(child => {
    var name = child.$options.componentName;

    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}
export default {
  methods: {
    dispatch(componentName, eventName, params) {
      // 如果该组件的$parent不存在，那么parent赋值为根组件
      var parent = this.$parent || this.$root;
      // 获取该父组件的组件名
      var name = parent.$options.componentName;
      /**
       * 通过传递的组件名，递归遍历父组件知道找到匹配的父组件为止
       *  */
      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.componentName;
        }
      }
      if (parent) {
        // 触发父组件上挂载的eventName事件
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    broadcast(componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params);
    }
  }
};

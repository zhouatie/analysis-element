export default {
  name: 'ElCol',

  props: {
    // 默认占满全部，即24
    span: {
      type: Number,
      default: 24
    },
    // col渲染成的标签，默认div
    tag: {
      type: String,
      default: 'div'
    },
    offset: Number,
    pull: Number,
    push: Number,
    xs: [Number, Object],
    sm: [Number, Object],
    md: [Number, Object],
    lg: [Number, Object],
    xl: [Number, Object]
  },

  computed: {
    gutter() {
      let parent = this.$parent;
      // 找到当前组件的上一层el-row组件为止
      while (parent && parent.$options.componentName !== 'ElRow') {
        parent = parent.$parent;
      }
      return parent ? parent.gutter : 0;
    }
  },
  render(h) {
    let classList = [];
    let style = {};
    /**
     * 配合el-row组件的gutter进行设置
     * 比如el-row的gutter设置为20px
     * 那么row左右有个margin10px
     * col的左右也会有个padding10px
    */
    if (this.gutter) {
      style.paddingLeft = this.gutter / 2 + 'px';
      style.paddingRight = style.paddingLeft;
    }

    /**
     * 通过添加class来设置元素的样式，先将class存进数组中
     * push:栅格向右移动格数
     * pull:栅格向左移动格数
     *  */
    ['span', 'offset', 'pull', 'push'].forEach(prop => {
      if (this[prop] || this[prop] === 0) {
        classList.push(
          prop !== 'span'
            ? `el-col-${prop}-${this[prop]}`
            : `el-col-${this[prop]}`
        );
      }
    });

    // 设置响应式布局的class
    ['xs', 'sm', 'md', 'lg', 'xl'].forEach(size => {
      if (typeof this[size] === 'number') {
        classList.push(`el-col-${size}-${this[size]}`);
      } else if (typeof this[size] === 'object') {
        let props = this[size];
        Object.keys(props).forEach(prop => {
          classList.push(
            prop !== 'span'
              ? `el-col-${size}-${prop}-${props[prop]}`
              : `el-col-${size}-${props[prop]}`
          );
        });
      }
    });

    return h(this.tag, {
      class: ['el-col', classList],
      style
    }, this.$slots.default);
  }
};

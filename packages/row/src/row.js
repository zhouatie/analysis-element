export default {
  name: 'ElRow',

  componentName: 'ElRow', // 组件名

  props: {
    // render函数调用的时候用到，创建的时候可根据用户传入的标签名创建，默认采用div
    tag: {
      type: String,
      default: 'div'
    },
    // row里面的col之间的距离
    gutter: Number,
    // 将 `type` 属性赋值为 'flex'，可以启用 flex 布局
    type: String,
    // 可通过 `justify` 属性来指定 start, center, end, space-between, space-around 其中的值来定义子元素的排版方式。
    justify: {
      type: String,
      default: 'start'
    },
    // align 表示row中元素垂直方向上的对齐方式,通过设置align-items
    align: {
      type: String,
      default: 'top'
    }
  },

  computed: {
    style() {
      const ret = {};
      /**
       * 如果设置了栅格距离，通过设置左右的margin值来实现宽度扩张，
       * 因为col是左右设置padding的，row左右需要增加宽度
       * 需要与el-col联系联系起来看，因为col组件里也会获取父组件的gutter
       *  */
      if (this.gutter) {
        ret.marginLeft = `-${this.gutter / 2}px`;
        ret.marginRight = ret.marginLeft;
      }

      return ret;
    }
  },

  render(h) {
    return h(this.tag, {
      class: [
        'el-row',
        this.justify !== 'start' ? `is-justify-${this.justify}` : '',
        this.align !== 'top' ? `is-align-${this.align}` : '',
        { 'el-row--flex': this.type === 'flex' }
      ],
      style: this.style
    }, this.$slots.default);
  }
};

<template>
  <div
    class="el-radio-group"
    role="radiogroup"
    @keydown="handleKeydown"
  >
    <slot></slot>
  </div>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';

  const keyCode = Object.freeze({
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  });
  export default {
    name: 'ElRadioGroup',

    componentName: 'ElRadioGroup',
    // 注入父组件elFormItem
    inject: {
      elFormItem: {
        default: ''
      }
    },
    // 混入emitter事件（该事件中有broadcast广播、dispatch通知父组件）
    mixins: [Emitter],

    props: {
      value: {}, // group组件上绑定的v-model相当于:value与@input事件的组合体
      size: String, // group组件的size尺寸
      fill: String, // 用于子组件按钮显示的radio-button激活时的填充色和边框色
      textColor: String, // 按钮形式的 Radio 激活时的文本颜色
      disabled: Boolean // 是否禁止
    },

    computed: {
      // 获取父组件elFormItem的size
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      // 获取父组件radioGroup的size
      radioGroupSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      }
    },

    created() {
      // TODO:了解下$on的原理
      /**
       * 监听当前实例上的自定义事件
       * 事件可以由vm.$emit触发。回调函数会接收所有传入事件触发函数的额外参数。
       *  */
      this.$on('handleChange', value => {
        this.$emit('change', value);
      });
    },
    mounted() {
      // 当radioGroup没有默认选项时，第一个可以选中Tab导航
      const radios = this.$el.querySelectorAll('[type=radio]');
      const firstLabel = this.$el.querySelectorAll('[role=radio]')[0];
      // TODO: 触发第一个表单tabIndex？？？
      if (![].some.call(radios, radio => radio.checked) && firstLabel) {
        firstLabel.tabIndex = 0;
      }
    },
    methods: {
      /**
       * 获取当前选中目标的在radio数组中的序列号
       * 通过序列号的增减来获取下一个radio触发他的click跟focus事件
       *  */
      handleKeydown(e) { // 左右上下按键 可以在radio组内切换不同选项
        const target = e.target;
        const className = target.nodeName === 'INPUT' ? '[type=radio]' : '[role=radio]';
        const radios = this.$el.querySelectorAll(className);
        const length = radios.length;
        const index = [].indexOf.call(radios, target);
        const roleRadios = this.$el.querySelectorAll('[role=radio]');
        switch (e.keyCode) {
          case keyCode.LEFT:
          case keyCode.UP:
            e.stopPropagation();
            e.preventDefault();
            if (index === 0) {
              roleRadios[length - 1].click();
              roleRadios[length - 1].focus();
            } else {
              roleRadios[index - 1].click();
              roleRadios[index - 1].focus();
            }
            break;
          case keyCode.RIGHT:
          case keyCode.DOWN:
            if (index === (length - 1)) {
              e.stopPropagation();
              e.preventDefault();
              roleRadios[0].click();
              roleRadios[0].focus();
            } else {
              roleRadios[index + 1].click();
              roleRadios[index + 1].focus();
            }
            break;
          default:
            break;
        }
      }
    },
    watch: {
      value(value) {
        // TODO: 'el.form.change'看下源码，这个写法
        this.dispatch('ElFormItem', 'el.form.change', [this.value]);
      }
    }
  };
</script>


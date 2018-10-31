<script>
  import Emitter from 'element-ui/src/mixins/emitter';

  export default {
    name: 'ElCheckboxGroup',

    componentName: 'ElCheckboxGroup',
    // 混入dispatch和broadcast方法
    mixins: [Emitter],
    // 注入elFormItem组件provide出来的数据，这里的elFormItem是elFormItem组件的实例this
    inject: {
      elFormItem: {
        default: ''
      }
    },

    props: {
      value: {}, // checkbox-group组的值,v-model可以拆解为:value 与 @input
      disabled: Boolean, // 表单禁止变量
      min: Number, // 可被勾选的 checkbox 的最小数量,子组件checkbox会获取该变量
      max: Number, // 可被勾选的 checkbox 的最大数量,子组件checkbox会获取该变量
      size: String, // 尺寸按钮
      fill: String, // checkbox-button会用到这个fill
      textColor: String
    },

    computed: {
      // elFormItem尺寸
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      // checkboxGroup尺寸
      checkboxGroupSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      }
    },

    watch: {
      value(value) {
        // 监听value值变化，触发该组件绑定的change事件
        this.dispatch('ElFormItem', 'el.form.change', [value]);
      }
    }
  };
</script>

<template>
  <div class="el-checkbox-group" role="group" aria-label="checkbox-group">
    <slot></slot>
  </div>
</template>

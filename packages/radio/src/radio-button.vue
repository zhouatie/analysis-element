<template>
  <label
    class="el-radio-button"
    :class="[
      size ? 'el-radio-button--' + size : '',
      { 'is-active': value === label },
      { 'is-disabled': isDisabled },
      { 'is-focus': focus }
    ]"
    role="radio"
    :aria-checked="value === label"
    :aria-disabled="isDisabled"
    :tabindex="tabIndex"
    @keydown.space.stop.prevent="value = isDisabled ? value : label"
  >
    <input
      class="el-radio-button__orig-radio"
      :value="label"
      type="radio"
      v-model="value"
      :name="name"
      @change="handleChange"
      :disabled="isDisabled"
      tabindex="-1"
      @focus="focus = true"
      @blur="focus = false"
    >
    <span
      class="el-radio-button__inner"
      :style="value === label ? activeStyle : null"
      @keydown.stop>
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';

  export default {
    name: 'ElRadioButton',

    mixins: [Emitter],
    /**
     * 注入由父组件provide下去的对象，
     * 这里elForm值是elForm组件传递的this对象，
     * 这里elFormItem值是elFormItem组件传递的this对象
     */
    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    props: {
      label: {}, // 当slot没有传递时，默认展示label字段作为按钮文本
      disabled: Boolean, // 控制表单禁用
      name: String
    },
    data() {
      return {
        focus: false // 这里只用于控制is-focus的显示与隐藏
      };
    },
    computed: {
      /**
       * radio-button都是以group显示存在
       * 所以get的时候直接返回父组件ElRadioGroup的value值，
       * 如果要修改值，也是$meit父组件ElRadioGroup的input事件
       *  */
      value: {
        get() {
          return this._radioGroup.value;
        },
        set(value) {
          this._radioGroup.$emit('input', value);
        }
      },
      /**
       * 递归返回父组件ElRadioGroup
       *  */
      _radioGroup() {
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElRadioGroup') {
            parent = parent.$parent;
          } else {
            return parent;
          }
        }
        return false;
      },
      activeStyle() {
        return {
          backgroundColor: this._radioGroup.fill || '',
          borderColor: this._radioGroup.fill || '',
          boxShadow: this._radioGroup.fill ? `-1px 0 0 0 ${this._radioGroup.fill}` : '',
          color: this._radioGroup.textColor || ''
        };
      },
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      size() {
        return this._radioGroup.radioGroupSize || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      // 先判断自己的disabled属性，再层层往上找，只要找到一个true，则为true
      isDisabled() {
        return this.disabled || this._radioGroup.disabled || (this.elForm || {}).disabled;
      },
      tabIndex() {
        return !this.isDisabled ? (this._radioGroup ? (this.value === this.label ? 0 : -1) : 0) : -1;
      }
    },

    methods: {
      handleChange() {
        this.$nextTick(() => {
          // 触发父组件ElRadioGroup的handleChange事件
          this.dispatch('ElRadioGroup', 'handleChange', this.value);
        });
      }
    }
  };
</script>

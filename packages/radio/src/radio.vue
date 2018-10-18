<template>
  <label
    class="el-radio"
    :class="[
      border && radioSize ? 'el-radio--' + radioSize : '',
      { 'is-disabled': isDisabled },
      { 'is-focus': focus },
      { 'is-bordered': border },
      { 'is-checked': model === label }
    ]"
    role="radio"
    :aria-checked="model === label"
    :aria-disabled="isDisabled"
    :tabindex="tabIndex"
    @keydown.space.stop.prevent="model = isDisabled ? model : label"
  >
    <span class="el-radio__input"
      :class="{
        'is-disabled': isDisabled,
        'is-checked': model === label
      }"
    >
      <span class="el-radio__inner"></span>
      <input
        class="el-radio__original"
        :value="label"
        type="radio"
        aria-hidden="true"
        v-model="model"
        @focus="focus = true"
        @blur="focus = false"
        @change="handleChange"
        :name="name"
        :disabled="isDisabled"
        tabindex="-1"
      >
    </span>
    <span class="el-radio__label" @keydown.stop>
      <slot></slot>
      <!-- 如果el-radio没有传入值，即slot为空，显示label值 -->
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';

  export default {
    name: 'ElRadio',

    mixins: [Emitter],
    /**
     * 将上层的el-form和el-form-item实例对象this传递到radio组件中
     *  */
    inject: {
      elForm: {
        default: ''
      },

      elFormItem: {
        default: ''
      }
    },
    // 组件名
    componentName: 'ElRadio',

    props: {
      value: {}, // 组件绑定的v-model可拆分为:value和@input组合 这里value是v-model绑定的值
      label: {}, // 选中时，将该选项对应的label赋值给value
      disabled: Boolean, // 禁止控件
      name: String, // 表单input的原生name属性
      border: Boolean, // 用于判断是否显示边框
      size: String // 表单尺寸，且必须border为true
    },

    data() {
      return {
        focus: false // 获得焦点的变量，该变量用于控制is-focus来显示触发焦点时的样式
      };
    },
    computed: {
      // 递归调用，一直找到radioGroup时，返回true，否则false
      isGroup() {
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElRadioGroup') {
            parent = parent.$parent;
          } else {
            this._radioGroup = parent;
            return true;
          }
        }
        return false;
      },
      /**
       * 这个值就是表单的值，用于传递给父组件
       * 之所以封装这个是因为存在radiogroup
       *  */
      model: {
        get() {
          return this.isGroup ? this._radioGroup.value : this.value;
        },
        set(val) {
          if (this.isGroup) {
            // 触发父组件的input事件，v-model 实际上是:value 和 @input的结合体
            this.dispatch('ElRadioGroup', 'input', [val]);
          } else {
            // 如果只是单一的el-radio表单，直接通知挂载在el-radio上的input事件
            this.$emit('input', val);
          }
        }
      },
      // 如果elFormItem存在，获取它的elFormItemSize
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      // radio的size
      radioSize() {
        /**
         * 先后顺序取size、_elFormItemSize、$ELEMENT、{}的size
         *  */
        const temRadioSize = this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
        // 如果当前的radioGroup的radioGroupSize不存在再取temRadioSize
        return this.isGroup
          ? this._radioGroup.radioGroupSize || temRadioSize
          : temRadioSize;
      },
      // 用于控制表单禁止
      isDisabled() {
        return this.isGroup
          ? this._radioGroup.disabled || this.disabled || (this.elForm || {}).disabled
          : this.disabled || (this.elForm || {}).disabled;
      },
      // TODO:没理解
      tabIndex() {
        return !this.isDisabled ? (this.isGroup ? (this.model === this.label ? 0 : -1) : 0) : -1;
      }
    },

    methods: {
      handleChange() {
        this.$nextTick(() => {
          // 触发表单上绑定的change事件
          this.$emit('change', this.model);
          // 如果表单组也绑定了事件，还会再触发下表单组上绑定的change事件
          this.isGroup && this.dispatch('ElRadioGroup', 'handleChange', this.model);
        });
      }
    }
  };
</script>

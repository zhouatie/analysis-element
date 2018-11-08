<template>
  <!-- 
    type: el-input 可以为input 也可以为 textarea
  -->
  <div :class="[
    type === 'textarea' ? 'el-textarea' : 'el-input',
    inputSize ? 'el-input--' + inputSize : '',
    {
      'is-disabled': inputDisabled,
      'el-input-group': $slots.prepend || $slots.append,
      'el-input-group--append': $slots.append,
      'el-input-group--prepend': $slots.prepend,
      'el-input--prefix': $slots.prefix || prefixIcon,
      'el-input--suffix': $slots.suffix || suffixIcon || clearable
    }
    ]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
  <!-- 当type为input的时候 -->
    <template v-if="type !== 'textarea'">
      <!-- 前置元素 -->
      <div class="el-input-group__prepend" v-if="$slots.prepend">
        <slot name="prepend"></slot>
      </div>
      <!-- 
        v-bind="$attrs" ：包含了父作用域中不被认为 (且不预期为) props 的特性绑定 (class 和 style 除外)。
        当一个组件没有声明任何 props 时，这里会包含所有父作用域的绑定 (class 和 style 除外)，
        并且可以通过 v-bind=”$attrs” 传入内部组件——在创建更高层次的组件时非常有用。 
      -->
      <input
        :tabindex="tabindex"
        v-if="type !== 'textarea'"
        class="el-input__inner"
        v-bind="$attrs"
        :type="type"
        :disabled="inputDisabled"
        :readonly="readonly"
        :autocomplete="autoComplete || autocomplete"
        :value="currentValue"
        ref="input"
        @compositionstart="handleComposition"
        @compositionupdate="handleComposition"
        @compositionend="handleComposition"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        :aria-label="label"
      >
      <!-- 前置内容 -->
      <span class="el-input__prefix" v-if="$slots.prefix || prefixIcon">
        <slot name="prefix"></slot>
        <i class="el-input__icon"
           v-if="prefixIcon"
           :class="prefixIcon">
        </i>
      </span>
      <!-- 后置内容 -->
      <span
        class="el-input__suffix"
        v-if="$slots.suffix || suffixIcon || showClear || validateState && needStatusIcon">
        <span class="el-input__suffix-inner">
          <template v-if="!showClear">
            <slot name="suffix"></slot>
            <i class="el-input__icon"
              v-if="suffixIcon"
              :class="suffixIcon">
            </i>
          </template>
          <i v-else
            class="el-input__icon el-icon-circle-close el-input__clear"
            @click="clear"
          ></i>
        </span>
        <i class="el-input__icon"
          v-if="validateState"
          :class="['el-input__validateIcon', validateIcon]">
        </i>
      </span>
      <!-- 后置元素 -->
      <div class="el-input-group__append" v-if="$slots.append">
        <slot name="append"></slot>
      </div>
    </template>
    <textarea
      v-else
      :tabindex="tabindex"
      class="el-textarea__inner"
      :value="currentValue"
      @compositionstart="handleComposition"
      @compositionupdate="handleComposition"
      @compositionend="handleComposition"
      @input="handleInput"
      ref="textarea"
      v-bind="$attrs"
      :disabled="inputDisabled"
      :readonly="readonly"
      :autocomplete="autoComplete || autocomplete"
      :style="textareaStyle"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
      :aria-label="label"
    >
    </textarea>
  </div>
</template>
<script>
  import emitter from 'element-ui/src/mixins/emitter';
  import Migrating from 'element-ui/src/mixins/migrating';
  import calcTextareaHeight from './calcTextareaHeight';
  import merge from 'element-ui/src/utils/merge';
  import { isKorean } from 'element-ui/src/utils/shared';

  export default {
    name: 'ElInput',

    componentName: 'ElInput',
    // 混入emitter，Migrating对象
    mixins: [emitter, Migrating],
    /**
     * TODO:（https://www.jianshu.com/p/ce8ca875c337）
     * inheritAttrs：false，组件将不会把未被注册的props呈现为普通的HTML属性。
     * 但是在组件里我们可以通过其$attrs可以获取到没有使用的注册属性
     *  */
    inheritAttrs: false,
    // 父组件elForm，elFormItem传递到该组件的父组件实例对象
    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    data() {
      return {
        currentValue: this.value === undefined || this.value === null
          ? ''
          : this.value,
        textareaCalcStyle: {},
        hovering: false, // 判断表单是否hover
        focused: false, // 判断焦点是否触发
        isOnComposition: false,
        valueBeforeComposition: null
      };
    },

    props: {
      value: [String, Number], // v-model相当于 :value 和 @input
      size: String, // input尺寸
      resize: String, // textarea是否可resize
      form: String, // 原生表单属性
      disabled: Boolean, // 控制表单是否禁止属性
      readonly: Boolean, // 控制表单是否只读属性
      type: { // input的原生type类型
        type: String,
        default: 'text'
      },
      autosize: {
        type: [Boolean, Object],
        default: false
      },
      autocomplete: { // 原生表单的autocomplete属性
        type: String,
        default: 'off'
      },
      /** @Deprecated in next major version */
      autoComplete: {
        type: String,
        validator(val) {
          process.env.NODE_ENV !== 'production' &&
            console.warn('[Element Warn][Input]\'auto-complete\' property will be deprecated in next major version. please use \'autocomplete\' instead.');
          return true;
        }
      },
      // TODO: 校验怎么传递下去的？？
      validateEvent: {
        type: Boolean,
        default: true
      },
      suffixIcon: String, // 输入框尾部图标
      prefixIcon: String, // 输入框头部图标
      label: String, // 输入框关联的label文字 TODO: 不知道具体什么用
      clearable: { // 是否显示清除按钮
        type: Boolean,
        default: false
      },
      tabindex: String
    },

    computed: {
      // 父组件elFormItem的size
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      // 返回该form-item的校验结果
      validateState() {
        return this.elFormItem ? this.elFormItem.validateState : '';
      },
      // 挂载在el-form上的status-icon，input右边会有个状态图标
      needStatusIcon() {
        return this.elForm ? this.elForm.statusIcon : false;
      },
      // 验证状态的图标显示
      validateIcon() {
        return {
          validating: 'el-icon-loading',
          success: 'el-icon-circle-check',
          error: 'el-icon-circle-close'
        }[this.validateState];
      },
      // 返回textarea的style对象
      textareaStyle() {
        return merge({}, this.textareaCalcStyle, { resize: this.resize });
      },
      // 返回inputSize
      inputSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      // 返回控制表单禁止的对象
      inputDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      },
      /**
       * 返回是否显示清除按钮的boolean
       * 用户传入的clearable为true，且不是禁止、只读、当前值不为空、获得焦点或hover的时候显示
       *  */
      showClear() {
        return this.clearable &&
          !this.disabled &&
          !this.readonly &&
          this.currentValue !== '' &&
          (this.focused || this.hovering);
      }
    },

    watch: {
      // 监听v-model绑定的值变化，来设置input元素的value值
      value(val, oldValue) {
        this.setCurrentValue(val);
      }
    },

    methods: {
      // 触发元素获得焦点
      focus() {
        (this.$refs.input || this.$refs.textarea).focus();
      },
      // 触发元素失去焦点
      blur() {
        (this.$refs.input || this.$refs.textarea).blur();
      },
      /**
       * 主要用途：告诉用户挂载的props或者events已经被移除
       * mixins挂载中的Migrating对象中mounted
       * 会获取getMigratingConfig中的props和events
       * 遍历$vnode中的definedProps与definedEvents
       *  */
      getMigratingConfig() {
        return {
          props: {
            'icon': 'icon is removed, use suffix-icon / prefix-icon instead.',
            'on-icon-click': 'on-icon-click is removed.'
          },
          events: {
            'click': 'click is removed.'
          }
        };
      },
      handleBlur(event) {
        this.focused = false;
        this.$emit('blur', event);
        if (this.validateEvent) { // 如果需要校验的话，通知ElFormItem触发他的blur事件
          this.dispatch('ElFormItem', 'el.form.blur', [this.currentValue]);
        }
      },
      // TODO: 这是干啥？
      select() {
        (this.$refs.input || this.$refs.textarea).select();
      },
      // 重新计算下textarea的高度
      resizeTextarea() {
        if (this.$isServer) return;
        const { autosize, type } = this;
        if (type !== 'textarea') return;
        if (!autosize) {
          this.textareaCalcStyle = {
            minHeight: calcTextareaHeight(this.$refs.textarea).minHeight
          };
          return;
        }
        const minRows = autosize.minRows;
        const maxRows = autosize.maxRows;

        this.textareaCalcStyle = calcTextareaHeight(this.$refs.textarea, minRows, maxRows);
      },
      // 触发绑定在该组件的focus方法
      handleFocus(event) {
        // 内部用于判断焦点的私有变量
        this.focused = true;
        this.$emit('focus', event);
      },
      handleComposition(event) {
        if (event.type === 'compositionend') {
          this.isOnComposition = false;
          this.currentValue = this.valueBeforeComposition;
          this.valueBeforeComposition = null;
          this.handleInput(event);
        } else {
          const text = event.target.value;
          const lastCharacter = text[text.length - 1] || '';
          this.isOnComposition = !isKorean(lastCharacter);
          if (this.isOnComposition && event.type === 'compositionstart') {
            this.valueBeforeComposition = text;
          }
        }
      },
      handleInput(event) {
        const value = event.target.value;
        this.setCurrentValue(value);
        if (this.isOnComposition) return;
        this.$emit('input', value);
      },
      handleChange(event) {
        this.$emit('change', event.target.value);
      },
      setCurrentValue(value) {
        if (this.isOnComposition && value === this.valueBeforeComposition) return;
        this.currentValue = value;
        if (this.isOnComposition) return;
        this.$nextTick(this.resizeTextarea);
        if (this.validateEvent && this.currentValue === this.value) {
          this.dispatch('ElFormItem', 'el.form.change', [value]);
        }
      },
      calcIconOffset(place) {
        let elList = [].slice.call(this.$el.querySelectorAll(`.el-input__${place}`) || []);
        if (!elList.length) return;
        let el = null;
        for (let i = 0; i < elList.length; i++) {
          if (elList[i].parentNode === this.$el) {
            el = elList[i];
            break;
          }
        }
        if (!el) return;
        const pendantMap = {
          suffix: 'append',
          prefix: 'prepend'
        };

        const pendant = pendantMap[place];
        if (this.$slots[pendant]) {
          el.style.transform = `translateX(${place === 'suffix' ? '-' : ''}${this.$el.querySelector(`.el-input-group__${pendant}`).offsetWidth}px)`;
        } else {
          el.removeAttribute('style');
        }
      },
      updateIconOffset() {
        this.calcIconOffset('prefix');
        this.calcIconOffset('suffix');
      },
      clear() {
        this.$emit('input', '');
        this.$emit('change', '');
        this.$emit('clear');
        this.setCurrentValue('');
        // 值清空后，触发input表单焦点
        this.focus();
      }
    },

    created() {
      // created钩子触发之后，挂载inputSelect事件
      this.$on('inputSelect', this.select);
    },

    mounted() {
      this.resizeTextarea();
      this.updateIconOffset();
    },

    updated() {
      this.$nextTick(this.updateIconOffset);
    }
  };
</script>

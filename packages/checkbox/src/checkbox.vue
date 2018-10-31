<template>
  <label
    class="el-checkbox"
    :class="[
      border && checkboxSize ? 'el-checkbox--' + checkboxSize : '',
      { 'is-disabled': isDisabled },
      { 'is-bordered': border },
      { 'is-checked': isChecked }
    ]"
    role="checkbox"
    :aria-checked="indeterminate ? 'mixed': isChecked"
    :aria-disabled="isDisabled"
    :id="id"
  >
    <span class="el-checkbox__input"
      :class="{
        'is-disabled': isDisabled,
        'is-checked': isChecked,
        'is-indeterminate': indeterminate,
        'is-focus': focus
      }"
       aria-checked="mixed"
    >
      <span class="el-checkbox__inner"></span>
      <!-- trueLabel/falseLabel 与 label不可共存 -->
      <input
        v-if="trueLabel || falseLabel"
        class="el-checkbox__original"
        type="checkbox"
        aria-hidden="true"
        :name="name"
        :disabled="isDisabled"
        :true-value="trueLabel"
        :false-value="falseLabel"
        v-model="model"
        @change="handleChange"
        @focus="focus = true"
        @blur="focus = false">
      <input
        v-else
        class="el-checkbox__original"
        type="checkbox"
        aria-hidden="true"
        :disabled="isDisabled"
        :value="label"
        :name="name"
        v-model="model"
        @change="handleChange"
        @focus="focus = true"
        @blur="focus = false">
    </span>
    <!-- 当slot没有内容时，会显示label作为这个checkbox的文本 -->
    <span class="el-checkbox__label" v-if="$slots.default || label">
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';

  export default {
    name: 'ElCheckbox',

    mixins: [Emitter],
    // 获取父组件elForm provide注入的this
    inject: {
      elForm: {
        default: ''
      },
      // 获取父组件elFormItem provide注入的this
      elFormItem: {
        default: ''
      }
    },

    componentName: 'ElCheckbox',

    data() {
      return {
        selfModel: false, // 自己内部定义的model变量
        focus: false, // 控制表单是否focus
        isLimitExceeded: false // 控制是否超过最大值最小值的Boolean
      };
    },

    computed: {
      model: {
        get() {
          /**
           * 是分组checkbox-group的直接拿group的值，没有的拿checkbox绑定的v-model值，
           * 如果也没有，就用自身默认的selfModel: false;
           *  */
          return this.isGroup
            ? this.store : this.value !== undefined
              ? this.value : this.selfModel;
        },

        set(val) {
          if (this.isGroup) {
            // ========= 控制isLimitExceeded变量的开关 === start ====
            this.isLimitExceeded = false;
            (this._checkboxGroup.min !== undefined &&
              val.length < this._checkboxGroup.min &&
              (this.isLimitExceeded = true));

            (this._checkboxGroup.max !== undefined &&
              val.length > this._checkboxGroup.max &&
              (this.isLimitExceeded = true));
            // ========= 控制isLimitExceeded变量的开关 === end ====

            // 当状态为false的时候表示没有超过限制，允许修改
            this.isLimitExceeded === false &&
            this.dispatch('ElCheckboxGroup', 'input', [val]);
          } else {
            this.$emit('input', val);
            // 如果不是以组的形式存在的checkbox，会更新私有的model，即selfModel
            this.selfModel = val;
          }
        }
      },

      isChecked() {
        if ({}.toString.call(this.model) === '[object Boolean]') {
          // 如果checkbox布尔值，直接返回该布尔值
          return this.model;
        } else if (Array.isArray(this.model)) {
          // 如果是个数组，判断当前label是否在数组中
          return this.model.indexOf(this.label) > -1;
        } else if (this.model !== null && this.model !== undefined) {
          return this.model === this.trueLabel;
        }
      },
      // 判断是否为组合表单
      isGroup() {
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElCheckboxGroup') {
            parent = parent.$parent;
          } else {
            // 将组合表单父组件赋值给_checkboxGroup
            this._checkboxGroup = parent;
            return true;
          }
        }
        return false;
      },
      // return表单的值，若为组合表单，返回组合表单的value
      store() {
        return this._checkboxGroup ? this._checkboxGroup.value : this.value;
      },
      /**
       * 判断是否为组合表单
       * 1.如果是组合表单，先获取父组件的disabled元素、自身的disabled，最后获取elForm
       * 2.如果不是组合表单，先获取自身的disabled，最后获取elForm
       *  */
      isDisabled() {
        return this.isGroup
          ? this._checkboxGroup.disabled || this.disabled || (this.elForm || {}).disabled
          : this.disabled || (this.elForm || {}).disabled;
      },
      // 返回继承elFormItem的size，这里做容错处理
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      /**
       * checkbox的size先根据自身size、再_elFormItemSize、再全局的$ELEMENT设置的size判断
       *  */
      checkboxSize() {
        const temCheckboxSize = this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
        return this.isGroup
          ? this._checkboxGroup.checkboxGroupSize || temCheckboxSize
          : temCheckboxSize;
      }
    },

    props: {
      value: {}, // v-model绑定到input表单上，实际可拆分成:value 与 @input 结合体
      label: {}, // label文本
      indeterminate: Boolean,
      disabled: Boolean,
      checked: Boolean,
      name: String,
      trueLabel: [String, Number], // 选中时的值
      falseLabel: [String, Number], // 没有选中时的值
      id: String, /* 当indeterminate为真时，为controls提供相关连的checkbox的id，表明元素间的控制关系*/
      controls: String, /* 当indeterminate为真时，为controls提供相关连的checkbox的id，表明元素间的控制关系*/
      border: Boolean, // 是否显示边框
      size: String
    },

    methods: {
      /**
       * 总的作用就是如果设置了checked为true，校正绑定的v-model数据
       * 1.model不是数组，将为true时的label =>trueLabel赋值给model，没有则赋值true
       *  */
      addToStore() {
        if (
          Array.isArray(this.model) &&
          this.model.indexOf(this.label) === -1
        ) {
          this.model.push(this.label);
        } else {
          /**
           * FIXME: Element-ui的bug 不严谨
           * 场景：Array.isArray(this.model) 为true，trueLabel与label同时存在时，数组会被赋值为trueLabel
           * 组合型checkbox，不允许有trueLabel出现，否则点不动
           *  */
          this.model = this.trueLabel || true;
        }
      },
      handleChange(ev) {
        if (this.isLimitExceeded) return;
        let value;
        if (ev.target.checked) {
          value = this.trueLabel === undefined ? true : this.trueLabel;
        } else {
          value = this.falseLabel === undefined ? false : this.falseLabel;
        }
        this.$emit('change', value, ev);
        this.$nextTick(() => {
          if (this.isGroup) {
            this.dispatch('ElCheckboxGroup', 'change', [this._checkboxGroup.value]);
          }
        });
      }
    },

    created() {
      // 如果该checkbox的checked为true，校正下model的值
      this.checked && this.addToStore();
    },
    mounted() { // 为indeterminate元素 添加aria-controls 属性
      // indeterminate 属性用以表示 checkbox 的不确定状态，一般用于实现全选的效果
      if (this.indeterminate) {
        // TODO: controls什么作用
        this.$el.setAttribute('aria-controls', this.controls);
      }
    },

    watch: {
      value(value) {
        // 通知ElFormItem组件，表单值change
        this.dispatch('ElFormItem', 'el.form.change', value);
      }
    }
  };
</script>

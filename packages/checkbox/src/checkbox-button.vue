<template>
  <label
    class="el-checkbox-button"
      :class="[
        size ? 'el-checkbox-button--' + size : '',
        { 'is-disabled': isDisabled },
        { 'is-checked': isChecked },
        { 'is-focus': focus },
      ]"
    role="checkbox"
    :aria-checked="isChecked"
    :aria-disabled="isDisabled"
    >
    <input
      v-if="trueLabel || falseLabel"
      class="el-checkbox-button__original"
      type="checkbox"
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
      class="el-checkbox-button__original"
      type="checkbox"
      :name="name"
      :disabled="isDisabled"
      :value="label"
      v-model="model"
      @change="handleChange"
      @focus="focus = true"
      @blur="focus = false">

    <span class="el-checkbox-button__inner" 
      v-if="$slots.default || label"
      :style="isChecked ? activeStyle : null">
      <slot>{{label}}</slot>
    </span>

  </label>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';

  export default {
    name: 'ElCheckboxButton',
    // 添加dispatch 跟 broadcast 方法，用于触发父子组件相应的自定义事件
    mixins: [Emitter],
    // inject 注入父组件elForm/elFormItem,在这两个组件中provide注入的是这两个组件实例
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
        selfModel: false, // 该组件私有的model值
        focus: false, // 代表表单是否出发焦点的属性
        isLimitExceeded: false // 是否超出限制的范围
      };
    },

    props: {
      value: {}, // checkbox的值,v-model可以拆解为 :value 与 @input
      label: {}, // 如果是组形式，会将label值存入数组中
      disabled: Boolean, // 是否禁止的状态
      checked: Boolean, // 一开始时，是否默认选中
      name: String, // 表单的name
      trueLabel: [String, Number], // 选中时，label值
      falseLabel: [String, Number] // 不选中时，label值
    },
    computed: {
      model: {
        /**
         * 是分组checkbox-group的直接拿group的值，没有的拿checkbox绑定的v-model值，
         * 如果也没有，就用自身默认的selfModel: false;
         *  */
        get() {
          return this._checkboxGroup
            ? this.store : this.value !== undefined
              ? this.value : this.selfModel;
        },

        set(val) {
          if (this._checkboxGroup) {
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
          } else if (this.value !== undefined) {
            this.$emit('input', val);
          } else {
            this.selfModel = val;
          }
        }
      },

      isChecked() {
        if ({}.toString.call(this.model) === '[object Boolean]') {
          return this.model;
        } else if (Array.isArray(this.model)) {
          return this.model.indexOf(this.label) > -1;
        } else if (this.model !== null && this.model !== undefined) {
          return this.model === this.trueLabel;
        }
      },

      _checkboxGroup() {
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElCheckboxGroup') {
            parent = parent.$parent;
          } else {
            return parent;
          }
        }
        return false;
      },

      store() {
        return this._checkboxGroup ? this._checkboxGroup.value : this.value;
      },

      activeStyle() {
        return {
          backgroundColor: this._checkboxGroup.fill || '',
          borderColor: this._checkboxGroup.fill || '',
          color: this._checkboxGroup.textColor || '',
          'box-shadow': '-1px 0 0 0 ' + this._checkboxGroup.fill

        };
      },

      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },

      size() {
        return this._checkboxGroup.checkboxGroupSize || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },

      isDisabled() {
        return this._checkboxGroup
          ? this._checkboxGroup.disabled || this.disabled || (this.elForm || {}).disabled
          : this.disabled || (this.elForm || {}).disabled;
      }
    },
    methods: {
      addToStore() {
        if (
          Array.isArray(this.model) &&
          this.model.indexOf(this.label) === -1
        ) {
          this.model.push(this.label);
        } else {
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
          if (this._checkboxGroup) {
            this.dispatch('ElCheckboxGroup', 'change', [this._checkboxGroup.value]);
          }
        });
      }
    },

    created() {
      this.checked && this.addToStore();
    }
  };
</script>

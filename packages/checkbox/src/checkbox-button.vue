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
            // TODO:为什么checkbox是跟上面input事件一起的，这里不是
            this.selfModel = val;
          }
        }
      },
      // 表示是否选中的属性
      isChecked() {
        if ({}.toString.call(this.model) === '[object Boolean]') {
          return this.model;
        } else if (Array.isArray(this.model)) {
          return this.model.indexOf(this.label) > -1;
        } else if (this.model !== null && this.model !== undefined) {
          // TODO:加入存在label，trueLabel没写怎么办
          return this.model === this.trueLabel;
        }
      },
      // 组合组件checkboxGroup，不存在返回false
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
      // 返回 表单的值，如果存在组合组件，返回父组件checkboxGroup的value值
      store() {
        return this._checkboxGroup ? this._checkboxGroup.value : this.value;
      },
      // 返回激活时的样式对象
      activeStyle() {
        return {
          backgroundColor: this._checkboxGroup.fill || '',
          borderColor: this._checkboxGroup.fill || '',
          color: this._checkboxGroup.textColor || '',
          'box-shadow': '-1px 0 0 0 ' + this._checkboxGroup.fill

        };
      },
      // 返回父组件elFormItem上绑定的size
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      // 返回表单该显示的size
      size() {
        return this._checkboxGroup.checkboxGroupSize || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      // 表单禁止属性
      isDisabled() {
        return this._checkboxGroup
          ? this._checkboxGroup.disabled || this.disabled || (this.elForm || {}).disabled
          : this.disabled || (this.elForm || {}).disabled;
      }
    },
    methods: {
      /**
       * created()的时候如果组件上的checked为true时候，会调用此方法
       * 此方法的作用：校正绑定的model值
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

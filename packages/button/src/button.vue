<template>
<!-- 
  handleClick: 点击事件 
  :disabled="buttonDisabled || loading"： buttonDisabled如下面mothods中；loading（父组件通过props传递过来）
  autofocus：父组件通过props传入
  type：button原生type，入button、submit
  class: 通过class类名来控制按钮的样式、尺寸
-->
  <button
    class="el-button"
    @click="handleClick"
    :disabled="buttonDisabled || loading"
    :autofocus="autofocus"
    :type="nativeType"
    :class="[
      type ? 'el-button--' + type : '',
      buttonSize ? 'el-button--' + buttonSize : '',
      {
        'is-disabled': buttonDisabled,
        'is-loading': loading,
        'is-plain': plain,
        'is-round': round,
        'is-circle': circle
      }
    ]"
  >
  <!-- 父组件传递loading时，显示loading按钮 -->
    <i class="el-icon-loading" v-if="loading"></i>
    <i :class="icon" v-if="icon && !loading"></i>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>
<script>
  export default {
    name: 'ElButton',
    // TODO: 分析到el-form的时候记得回来看
    // 注入祖先元素provide的元素（这里inject注入的其实是el-form实例this
    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    props: {
      type: {
        type: String,
        default: 'default'
      },
      size: String,
      icon: {
        type: String,
        default: ''
      },
      nativeType: {
        type: String,
        default: 'button'
      },
      loading: Boolean,
      disabled: Boolean,
      plain: Boolean,
      autofocus: Boolean,
      round: Boolean,
      circle: Boolean
    },

    computed: {
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      buttonSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      /**
       * disabled: 用户传递的disabled
       * this.elForm.diabled: 父组件el-form的disabled属性（通过inject注入）
       *  */
      buttonDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      }
    },

    methods: {
      handleClick(evt) {
        this.$emit('click', evt);
      }
    },

    created() {
      console.log(this, 'this');
    }
  };
</script>

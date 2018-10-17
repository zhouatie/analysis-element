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
    <!-- icon按钮，当loading true的时候 隐藏 -->
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
      // 指定type类型，用于拼接class名字，来让按钮展示不同的样式
      type: {
        type: String,
        default: 'default'
      },
      // 通过buttonSize根据size来返回一个按钮样式
      size: String,
      icon: {
        type: String,
        default: ''
      },
      // el-button原生类型 button元素的type可以是button也可以是submit等
      nativeType: {
        type: String,
        default: 'button'
      },
      // loading图
      loading: Boolean,
      // 禁止按钮变量
      disabled: Boolean,
      // 简版按钮
      plain: Boolean,
      // 自动获取焦点
      autofocus: Boolean,
      // 圆角
      round: Boolean,
      // 控制按钮是否显示圆
      circle: Boolean
    },

    computed: {
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      // 返回按钮的size，用于拼接控制按钮大小的class
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
        // 触发挂载在el-button上的事件
        this.$emit('click', evt);
      }
    }
  };
</script>

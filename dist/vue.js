(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

    // 状态的初始化
    // 集中进行数据的初始化处理：initState 方法
    function initState(vm) {
      // 获取 options：_init 中已 options 挂载到 vm.$options
      const opts = vm.$options;

      if (opts.data) {
        initData(); // data 数据的初始化
      } // props 数据的初始化
      // watch 数据的初始化
      // computed 数据的初始化

    }

    function initData(vm) {
      console.log("进入 state.js - initData，数据初始化操作");
    }

    function initMixin(Vue) {
      // 在 Vue 原型上扩展一个原型方法 _init,进行 vue 初始化
      Vue.prototype._init = function (options) {
        // console.log(options);
        const vm = this; // this 指向当前 vue 实例

        vm.$options = options; // 将 Vue 实例化时用户传入的 options 暴露到 vm 实例上
        // new Vue 时，传入 options 选项，包含 el 和 data

        initState(vm); // 状态的初始化

        if (vm.$options.el) {
          console.log("有el,需要挂载");
        }
      };
    }

    /* Vue 中所有功能都是通过原型扩展方式添加的
    @Param {*} options  new Vue 时传入的 options 配置对象 */

    function Vue(options) {
      this._init(options); // 调用 Vue 原型上 _init 方法

    } // 调用 initMixin 进行 Vue 初始化操作


    initMixin(Vue);

    return Vue;

})));
//# sourceMappingURL=vue.js.map

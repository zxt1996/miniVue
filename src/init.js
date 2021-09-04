import { initState } from "./state";

// 原型方法 _init 模块化处理
export function initMixin(Vue) {
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
    }
}
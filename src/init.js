import { initState } from "./state";
import { compileToFunction } from './compiler/index';

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

    // 支持 new Vue({el}) 和 new Vue().$mount 两种情况
    Vue.prototype.$mount = function (el) {
        const vm = this;
        const opts = vm.$options;
        el = document.querySelector(el); // 获取真实的元素
        vm.$el = el; // vm.$el 为当前页面上的真实元素

        // 如果没有 render,找 template
        if (!opts.render) {
            // 如果没有 template，采用元素中的内容
            let template = opts.template;
            console.log("template = " + template);
            if (!template) {
                // 拿到整个元素标签
                console.log("没有template, el.outerHTML = " + el.outerHTML);
                template = el.outerHTML;
            } else {
                console.log('有 template = ' + template);
            }

            let render = compileToFunction(template);
            opts.render = render;
        }
    }
}
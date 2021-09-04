import { initMixin } from "./init";

/* Vue 中所有功能都是通过原型扩展方式添加的
@Param {*} options  new Vue 时传入的 options 配置对象 */
function Vue(options) {
    this._init(options); // 调用 Vue 原型上 _init 方法
}

// 调用 initMixin 进行 Vue 初始化操作
initMixin(Vue);

export default Vue;
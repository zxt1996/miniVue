import { observe } from './observe';
import { isFunction } from './utils';

// 状态的初始化
// 集中进行数据的初始化处理：initState 方法
export function initState(vm) {
    // 获取 options：_init 中已 options 挂载到 vm.$options
    const opts = vm.$options;

    if (opts.data) {
        initData(vm);  // data 数据的初始化
    }

    // props 数据的初始化
    // watch 数据的初始化
    // computed 数据的初始化
}

function initData(vm) {
    let data = vm.$options.data; // 拿到 vue 初始化时，用户传入的 data 数据

    // data 可能是函数或对象
    //  如果 data 是函数，则需要让 data 函数执行，拿到它返回的对象
    //  如果 data 是对象，不做处理
    // data 执行时，绑定 this 为 vm
    data = isFunction(data) ? data.call(vm) : data;

    console.log("进入 state.js - initData，数据初始化操作", data);

    observe(data); // 使用 observe 实现 data 数据的响应式

    console.log(data);
}
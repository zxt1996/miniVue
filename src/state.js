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
    console.log("进入 state.js - initData，数据初始化操作");
}
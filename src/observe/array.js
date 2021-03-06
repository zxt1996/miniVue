/* 出于对性能的考虑，Vue 没有对数组类型的数组使用 Object.defineProperty 进行递归劫持，
而是通过对能够导致原数组变化的 7 个方法进行拦截和重写实现了数据劫持 */

// 拿到数组的原型方法
let oldArrayPrototype = Array.prototype;
// 原型继承，将原型链向后移动 arrayMethods.__proto__ == oldArrayPrototype
// Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__
export let arrayMethods = Object.create(oldArrayPrototype);

// 重写能够导致原数组变化的七个方法
let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
];

// 在数组自身上进行方法重写，对链上的同名方法进行拦截
methods.forEach(method => {
    arrayMethods[method] = function(...args) {
        console.log('数组的方法进行重写 method = ' + method);

        // 调用数组原生方法逻辑（绑定到当前调用上下文）
        oldArrayPrototype[method].call(this, ...args);

        // 数组新增的属性如果是属性，要继续观测
        // 哪些方法有增加数组的功能：splice push unshift
        let inserted = null;
        switch (method) {
            case 'splice':
                inserted = args.slice(2);
            case 'push':
            case 'unshift':
                inserted = args;
                break;
        }

        let ob = this.__ob__;
        // observeArray：内部遍历 inserte 数组，调用 observe 方法，是对象就 new Observer，继续深层观察
        if (inserted) {
            ob.observeArray(inserted); // inserted 有值就是数组
        }
    }
})
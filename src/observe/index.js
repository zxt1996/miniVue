import { isObject, isArray } from '../utils';
import { arrayMethods } from "./array";

// 核心模块 observe：对数据进行观测
export function observe(value) {
    // 如果 value 不是对象，就不需要观测，直接 return
    if (!isObject(value)) {
        return;
    }

    // 观测 value 对象，实现数据响应式
    return new Observer(value);
}

class Observer {
    constructor(value) {
        // 分别处理 value 为数组和对象两种情况
        if (isArray(value)) {
            value.__proto__ = arrayMethods; //更改数组的原型方法
        } else {      
            // 如果 value 是对象，遍历对象中的属性，使用 object.defineProperty 重新定义
            this.walk(value); // 循环对象属性
        }
    }

    // 循环 data 对象，使用 Object.keys 不循环原型方法
    walk(data) {
        Object.keys(data).forEach(key => {
            // 使用 object.defineProperty 重新定义 data 对象中的属性
            defineReactive(data, key, data[key]);
        })
    }
}

/**
 * 给对象Obj，定义属性key，值为value
 *  使用Object.defineProperty重新定义data对象中的属性
 *  由于Object.defineProperty性能低，所以vue2的性能瓶颈也在这里
 * @param {*} obj 需要定义属性的对象
 * @param {*} key 给对象定义的属性名
 * @param {*} value 给对象定义的属性值
 */
function defineReactive(obj, key, value) {
    // 递归实现深层观测
    observe(value);

    Object.defineProperty(obj, key, {
        get() {
            return value;
        },
        set(newValue) {
            if (newValue === value) return;
            value = newValue;
        }
    })
}
/**
 * 判断是否为函数
 * @param {*} val 
 * @returns 
 */
export function isFunction(val) {
    return typeof val == 'function';
}

/**
 * 判断是否为对象：类型是object，且不能为 null
 * @param {*} val 
 * @returns 
 */
export function isObject(val) {
    return typeof val == 'object' && val !== null;
}
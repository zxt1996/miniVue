(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

    /**
     * 判断是否为函数
     * @param {*} val 
     * @returns 
     */
    function isFunction(val) {
      return typeof val == 'function';
    }
    /**
     * 判断是否为对象：类型是object，且不能为 null
     * @param {*} val 
     * @returns 
     */

    function isObject(val) {
      return typeof val == 'object' && val !== null;
    }
    /**
     * 判断是否是数组
     * @param {*} val 
     * @returns 
     */

    function isArray(val) {
      return Array.isArray(val);
    }

    /* 出于对性能的考虑，Vue 没有对数组类型的数组使用 Object.defineProperty 进行递归劫持，
    而是通过对能够导致原数组变化的 7 个方法进行拦截和重写实现了数据劫持 */
    // 拿到数组的原型方法
    let oldArrayPrototype = Array.prototype; // 原型继承，将原型链向后移动 arrayMethods.__proto__ == oldArrayPrototype
    // Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__

    let arrayMethods = Object.create(oldArrayPrototype); // 重写能够导致原数组变化的七个方法

    let methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; // 在数组自身上进行方法重写，对链上的同名方法进行拦截

    methods.forEach(method => {
      arrayMethods[method] = function (...args) {
        console.log('数组的方法进行重写 method = ' + method); // 调用数组原生方法逻辑（绑定到当前调用上下文）

        oldArrayPrototype[method].call(this, ...args); // 数组新增的属性如果是属性，要继续观测
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

        let ob = this.__ob__; // observeArray：内部遍历 inserte 数组，调用 observe 方法，是对象就 new Observer，继续深层观察

        if (inserted) {
          ob.observeArray(inserted); // inserted 有值就是数组
        }
      };
    });

    function observe(value) {
      // 如果 value 不是对象，就不需要观测，直接 return
      if (!isObject(value)) {
        return;
      } // 观测 value 对象，实现数据响应式


      return new Observer(value);
    }

    class Observer {
      constructor(value) {
        // value：为数组或对象添加自定义属性 __ob__ = this
        // this：为当前 Observer 类的实例，实例上就有 observeArray 方法
        // value.__ob__ = this;  // 可被遍历枚举，会造成死循环
        // 定义 __ob__ 属性为不可被枚举，防止对象在进入 walk 都继续 defineProperty,造成死循环
        Object.defineProperty(value, '__ob__', {
          value: this,
          enumerable: false // 不可被枚举

        }); // 分别处理 value 为数组和对象两种情况

        if (isArray(value)) {
          value.__proto__ = arrayMethods; //更改数组的原型方法

          this.observeArray(value); // 对数组数据类型进行深层观测
        } else {
          // 如果 value 是对象，遍历对象中的属性，使用 object.defineProperty 重新定义
          this.walk(value); // 循环对象属性
        }
      }
      /**
      * 遍历数组，对数组中的对象进行递归观测
      *  1）[[]] 数组套数组
      *  2）[{}] 数组套对象
      * @param {*} data 
      */


      observeArray(data) {
        // observe 方法内，如果是对象类型，继续 new Observer 进行递归处理
        data.forEach(item => observe(item));
      } // 循环 data 对象，使用 Object.keys 不循环原型方法


      walk(data) {
        Object.keys(data).forEach(key => {
          // 使用 object.defineProperty 重新定义 data 对象中的属性
          defineReactive(data, key, data[key]);
        });
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
          // console.log("修改了被观测属性 key = " + key + ", newValue = " + JSON.stringify(newValue));
          if (newValue === value) return; // 当值被修改时，通过 observe 实现对新值得深层观测，此时，新增对象将被观测

          observe(newValue);
          value = newValue;
        }

      });
    }

    // 集中进行数据的初始化处理：initState 方法

    function initState(vm) {
      // 获取 options：_init 中已 options 挂载到 vm.$options
      const opts = vm.$options;

      if (opts.data) {
        initData(vm); // data 数据的初始化
      } // props 数据的初始化
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
      observe(data); // 使用 observe 实现 data 数据的响应式
      // 为了让外部的 vm 实例能够拿到观测后的 data，将处理后的 data 直接挂载到 vm 上

      vm._data = data; // 当 vm.message 在 vm 实例上取值时，将它代理到 vm._data 上去取

      for (let key in data) {
        Proxy(vm, key, '_data');
      }
    }
    /**
     * 代理方法
     *  当取 vm.key 时，将它代理到 vm._data上去取
     * @param {*} vm        vm 实例
     * @param {*} key       属性名
     * @param {*} source    代理目标，这里是vm._data
     */


    function Proxy(vm, key, source) {
      Object.defineProperty(vm, key, {
        get() {
          return vm[source][key];
        },

        set(newValue) {
          vm[source][key] = newValue;
        }

      });
    }

    // 将模板编译为 ast 语法树
    function compileToFunction(template) {
      // 1. 将模板变成 AST 语法树
      let ast = parserHTML(template); // 2. 使用 AST 生成 render 函数

      generate(ast);
    }

    function parserHTML(template) {
      console.log("parserHTML-template: " + template);
    }

    function generate(ast) {
      console.log("parserHTML-ast：" + ast);
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
      }; // 支持 new Vue({el}) 和 new Vue().$mount 两种情况


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

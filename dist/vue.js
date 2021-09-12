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

    // 标签名 a-aaa
    const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 命名空间标签 aa:aa-xxx

    const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // 开始标签

    const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
    // 结束标签

    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
    // 匹配属性

    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配标签结束的 >

    const startTagClose = /^\s*(\/?)>/; // 匹配 {{ }} 表达式
    function parserHTML(html) {
      console.log("***** 进入 parserHTML：将模板编译成 AST 语法树 *****");
      let stack = [];
      let root = null; // 构建父子关系

      function createASTElement(tag, attrs, parent) {
        return {
          tag,
          // 标签名
          type: 1,
          // 元素
          children: [],
          // 儿子
          parent,
          // 父亲
          attrs // 属性

        };
      } // 处理开始标签,如:[div,p]


      function start(tag, attrs) {
        // 遇到开始标签，就取栈中最后一个，作为父节点
        let parent = stack[stack.length - 1];
        let element = createASTElement(tag, attrs, parent); // 还没有根节点时，作为根节点

        if (root == null) {
          root = element;
        }

        if (parent) {
          element.parent = parent; // 为当前节点设置父节点

          parent.children.push(element); // 同时，当前节点称为父节点的子节点
        }

        stack.push(element);
      } // 结束标签


      function end(tagName) {
        // 如果是结束标签，就从栈中抛出
        let endTag = stack.pop(); // check：抛出的结果标签名与当前结束标签名是否一致

        if (endTag.tag != tagName) {
          console.log("标签出错");
        }
      } // 文本标签


      function text(chars) {
        // 文本直接放到前一个中，注意：文本可能有空白字符
        let parent = stack[stack.length - 1];
        chars = chars.replace(/\s/g, ""); // 将空格替换为空，即删除空格

        if (chars) {
          parent.children.push({
            type: 2,
            // 文本类型为 2
            text: chars
          });
        }
      }
      /**
      * 截取字符串
      * @param {*} len 截取长度
      */


      function advance(len) {
        html = html.substring(len);
      }
      /**
      * 匹配开始标签，返回匹配结果
      */


      function parseStartTag() {
        // 匹配开始标签，开始标签名为索引 1
        // console.log('<aa:aa-xxx'.match(startTagOpen))
        // [
        // '<aa:aa-xxx',
        // 'aa:aa-xxx',			// 开始标签的标签名
        // index: 0,
        // input: '<aa:aa-xxx',
        // groups: undefined
        // ]
        const start = html.match(startTagOpen);

        if (start) {
          // 构造匹配结果，包含标签名和属性
          const match = {
            tagName: start[1],
            attrs: []
          };
          console.log("match 结果：" + match); // 截取匹配到的结果

          advance(start[0].length);
          console.log("截取后的 html: " + html);
          let end; // 是否匹配到开始标签的结束符号 > 或 /> 

          let attr; // 存储属性匹配的结果
          // 匹配属性且不能为开始的结束标签，例如：<div>，到 > 就已经结束了，不再继续匹配该标签内的属性
          // 		attr = html.match(attribute)  匹配属性并赋值当前属性的匹配结果
          // 		!(end = html.match(startTagClose))   没有匹配到开始标签的关闭符号 > 或 />

          while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            // 将匹配到的属性，push 到 attrs 数组中，匹配到关闭符号 >，while 就结束
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5]
            });
            advance(attr[0].length); // 截取匹配到的属性 xxx=xxx
          } // 匹配到关闭符号 >,当前标签处理完成 while 结束
          // 此时，<div id="app" 处理完成，需连同关闭符号 > 一起被截取掉


          if (end) {
            advance(end[0].length);
          } // 开始标签处理完成后，返回匹配结果：tagName 标签名 + attrs属性


          return match;
        }

        return false;
      } // 对模板不停截取，直至全部解析完毕


      while (html) {
        // 解析标签 or 文本，看第一字符是否为尖角号 <
        let index = html.indexOf('<');

        if (index == 0) {
          console.log("解析 html：" + html + ",结果：是标签"); // 如果是标签，继续解析开始标签和属性

          const startTagMatch = parseStartTag(); // 匹配开始标签，返回匹配结果

          if (startTagMatch) {
            // 匹配到开始标签
            // 匹配到开始标签，调用start方法，传递标签名和属性
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue; // 如果是开始标签，无需执行下面逻辑，继续下次 while 解析后续内容
          } // 没有匹配到开始标签，此时有可能为结束标签 </div>，继续处理结束标签


          let endTagMatch; // console.log('</aa:aa-xxxdsadsa>'.match(endTag))
          // [
          // '</aa:aa-xxxdsadsa>',
          // 'aa:aa-xxxdsadsa', 		// 结束标签的标签名
          // index: 0,
          // input: '</aa:aa-xxxdsadsa>',
          // groups: undefined
          // ]

          if (endTagMatch = html.match(endTag)) {
            // 匹配到结束标签
            // 匹配到开始标签，调用start方法，传递标签名和属性
            end(endTagMatch[1]);
            advance(endTagMatch[0].length);
            continue; // 如果是结束标签，无需执行下面逻辑，继续下次 while 解析后续内容
          }
        }

        if (index > 0) {
          // 文本
          // 将文本取出来并发射出去，再从 html 中拿掉
          let chars = html.substring(0, index); // hello</div>

          text(chars);
          advance(chars.length);
        }
      }

      return root;
    }

    function compileToFunction(template) {
      // 1. 将模板变成 AST 语法树
      let ast = parserHTML(template);
      console.log("解析 HTML 返回 ast 语法树====>");
      console.log(ast); // 2. 使用 AST 生成 render 函数

      generate(ast);
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

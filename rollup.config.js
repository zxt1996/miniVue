import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve';

// 导出 rollup 配置对象
export default {
    input:'./src/index.js', // 打包入口
    output:{// 可定义为数组，输出多种类型
        file:'dist/vue.js', // 打包出口
        format:'umd',// 常用格式：IIFE（立即执行函数）、ESM（ES6模块）、CJS（Node规范）、UMD（AMD+CJS）
        name:'Vue', // 导出模块Vue，并绑定到window上
        sourcemap:true, // 开启sourcemap
    },
    plugins:[
        resolve(),
        babel({
            exclude:'node_modules/**' // 忽略node_modules下所有文件
        })
    ]
}
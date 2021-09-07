# Vue 数据渲染的核心流程
# 1，初次渲染时
1. template 模板被编译为 ast 语法树；

2. 通过 ast 语法树生成 render 函数；

3. 通过 render 函数返回 vnode 虚拟节点；

4. 使用 vnode 虚拟节点生成真实 dom 并进行渲染；

## 2，视图更新时
1. 调用 render 函数生成新的 vnode 虚拟节点；

2. 通过 diff 算法对新老 vnode 虚拟节点进行对比；

3. 根据虚拟节点比对结果，更新真实 dom；
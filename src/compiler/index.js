import { parserHTML } from "./parser";

// 将模板编译为 ast 语法树

export function compileToFunction(template) {
    // 1. 将模板变成 AST 语法树
    let ast = parserHTML(template);
    console.log("解析 HTML 返回 ast 语法树====>");
    console.log(ast);
    // 2. 使用 AST 生成 render 函数
    let code = generate(ast);
}

function generate(ast) {
    console.log("parserHTML-ast：" + ast);
}
// 将模板编译为 ast 语法树

export function compileToFunction(template) {
    // 1. 将模板变成 AST 语法树
    let ast = parserHTML(template);
    // 2. 使用 AST 生成 render 函数
    let code = generate(ast);
}

function parserHTML(template) {
    console.log("parserHTML-template: " + template);
}

function generate(ast) {
    console.log("parserHTML-ast：" + ast);
}
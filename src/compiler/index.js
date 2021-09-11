// 将模板编译为 ast 语法树

// 标签名 a-aaa
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  
// 命名空间标签 aa:aa-xxx
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// 开始标签
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
// 结束标签
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
// 匹配属性
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; 
// 匹配标签结束的 >
const startTagClose = /^\s*(\/?)>/;
// 匹配 {{ }} 表达式
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

export function compileToFunction(template) {
    // 1. 将模板变成 AST 语法树
    let ast = parserHTML(template);
    // 2. 使用 AST 生成 render 函数
    let code = generate(ast);
}

// 开始标签
function start(tagName, attrs) {
    console.log("start", tagName, attrs)
}
// 结束标签
function end(tagName) {
    console.log("end", tagName)
}
// 文本标签
function text(chars) {
    console.log("text", chars)
}

function parserHTML(html) {
    // console.log("parserHTML-template: " + template);
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
                tagName:start[1],
                attrs:[]
            }
            console.log("match 结果："+match);
            // 截取匹配到的结果
            advance(start[0].length);
            console.log("截取后的 html: "+ html);

            let end;  // 是否匹配到开始标签的结束符号 > 或 /> 
            let attr; // 存储属性匹配的结果
            // 匹配属性且不能为开始的结束标签，例如：<div>，到 > 就已经结束了，不再继续匹配该标签内的属性
            // 		attr = html.match(attribute)  匹配属性并赋值当前属性的匹配结果
            // 		!(end = html.match(startTagClose))   没有匹配到开始标签的关闭符号 > 或 />
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                // 将匹配到的属性，push 到 attrs 数组中，匹配到关闭符号 >，while 就结束
                match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] });
                advance(attr[0].length); // 截取匹配到的属性 xxx=xxx
            }
            // 匹配到关闭符号 >,当前标签处理完成 while 结束
            // 此时，<div id="app" 处理完成，需连同关闭符号 > 一起被截取掉
            if (end) {
                advance(end[0].length);
            }

            // 开始标签处理完成后，返回匹配结果：tagName 标签名 + attrs属性
            return match;
        }
        return false;
    }

    // 对模板不停截取，直至全部解析完毕
    while(html) {
        // 解析标签 or 文本，看第一字符是否为尖角号 <
        let index = html.indexOf('<');
        if (index == 0) {
            console.log("解析 html：" + html + ",结果：是标签");
            // 如果是标签，继续解析开始标签和属性
            const startTagMatch = parseStartTag(); // 匹配开始标签，返回匹配结果
            if (startTagMatch) { // 匹配到开始标签
                // 匹配到开始标签，调用start方法，传递标签名和属性
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue; // 如果是开始标签，无需执行下面逻辑，继续下次 while 解析后续内容
            }

            // 没有匹配到开始标签，此时有可能为结束标签 </div>，继续处理结束标签
            let endTagMatch;
            // console.log('</aa:aa-xxxdsadsa>'.match(endTag))
            // [
            // '</aa:aa-xxxdsadsa>',
            // 'aa:aa-xxxdsadsa', 		// 结束标签的标签名
            // index: 0,
            // input: '</aa:aa-xxxdsadsa>',
            // groups: undefined
            // ]
            if (endTagMatch = html.match(endTag)) { // 匹配到结束标签
                // 匹配到开始标签，调用start方法，传递标签名和属性
                end(endTagMatch[1])
                advance(endTagMatch[0].length)
                continue; // 如果是结束标签，无需执行下面逻辑，继续下次 while 解析后续内容
            }
        }

        if (index > 0) { // 文本
            // 将文本取出来并发射出去，再从 html 中拿掉
            let chars = html.substring(0, index); // hello</div>
            text(chars);
            advance(chars.length);
        }
    }
}

function generate(ast) {
    console.log("parserHTML-ast：" + ast);
}
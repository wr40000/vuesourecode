import {parseHTML} from './parse'
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

function genProps(attrs){
    // console.log(attrs);
    let str = '';
    for(let i = 0; i<attrs.length; i++){
        let attr = attrs[i];
        if(attr.name == 'style'){
            let obj = {};
            attr.value.split(';').forEach((item)=>{
                let [key, value] = item.split(':');
                obj[key] = value
            })
            attr.value = obj
            // console.log(attr.value);
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`
}
function genchildren(children){
    return children.map((child)=>{
        // console.log("genchildren(children): ",child);
        let text = gen(child)
        // console.log(text);
        return text
    }).join(',')   
}
function gen(node) {
    if (node.type === 1) {
        return codegen(node);
    } else {
        // 文本
        let text = node.text
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        } else {
            //_v( _s(name)+'hello' + _s(name))
            let tokens = [];
            
            let match;
            defaultTagRE.lastIndex = 0;
            let lastIndex = 0;
            // split
            while (match = defaultTagRE.exec(text)) {
                let index = match.index; // 匹配的位置  {{name}} hello  {{name}} hello 
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join('+')})`
        }
    }
}
function codegen(ast){
    let children = genchildren(ast.children)
    // console.log("children: ",ast.children);
    let code = (`_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'},${ast.children.length ? `${children}` : ''})`)
    // console.log(code);
    return code
};

export function compileToFunction(html){
    let ast = parseHTML(html)
    let code = codegen(ast);
    
    code = `with(this){return ${code}}`;   //with作用是使代码可以访问传进来的this的属性
    let render = new Function(code);    //根据代码生成render函数

    return render;
}
import {parseHTML} from './parse'
var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

function genProps(attrs){
    let str = '';
    for(let i = 0; i<attrs.length; i++){
        let attr = attrs[i];
        if(attr.name == 'style'){
            let obj = {};
            // console.log(attr);
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
function gen(node){
    // console.log(node.type);
    if(node.type === 1){
        // console.log(`gen(node)${node.type}`,node);
        let text = codegen(node)
        // console.log("gen(node):",text);
        return text
    }else{
        let text = node.text
        // console.log(text);
        if(!defaultTagRE.test(text)){
            // console.log(`_v(${text})`);
            return `_v(${text})`
        }else{
            let tokens = [];
            let match;
            defaultTagRE.lastIndex = 0
            let lastIndex = 0;
            while(match = defaultTagRE.exec(text)){
                let index = match.index;
                if(index > lastIndex){
                    // console.log(text.slice(lastIndex, index));
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                // console.log(index,"**");
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if(lastIndex < text.length){
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            // console.log("tokens: ",tokens);
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
    
    // console.log(code);
    code = `with(this){return ${code}}`;   //with作用是使代码可以访问传进来的this的属性
    let render = new Function(code);    //根据代码生成render函数
    // console.log(render);

    return render;
}
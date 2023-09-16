// Regular Expressions for parsing tags and attributes
var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
var dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
// var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z".concat(unicodeRegExp.source, "]*");
var ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
var startTagOpen = new RegExp("^<".concat(qnameCapture));
var startTagClose = /^\s*(\/?)>/;
var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
var doctype = /^<!DOCTYPE [^>]+>/i;
// #7298: escape - to avoid being passed as HTML comment when inlined in page
var comment = /^<!\--/;
var conditionalComment = /^<!\[/;
// Special Elements (can contain anything)
// var isPlainTextElement = makeMap('script,style,textarea', true);
var reCache = {};
var decodingMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&amp;': '&',
    '&#10;': '\n',
    '&#9;': '\t',
    '&#39;': "'"
};
var encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;
var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

export function parseHTML(html){
    const ELEMENT_TYPE = 1;
    const TEXT_TYPE = 3;
    let stack = [];
    let currentParent;
    let root;
    function createASTElement(tag, attrs){
        return {
            tag,
            type: ELEMENT_TYPE, 
            children: [],
            attrs,
            parent: null
        }
    };    
    function start(tar, attrs){
        // debugger
        let node = createASTElement(tar,attrs);
        if(!root){
            root = node
        }
        if(currentParent){
            node.parent = currentParent
            currentParent.children.push(node)
            // console.log(currentParent);
        }
        stack.push(node);
        currentParent = node        
    };
    function end(tag){
        let node = stack.pop();
        currentParent = stack[stack.length - 1];
    };
    function chars(text){
        text = text.replace(/\s/g,'')
        // console.log(text);
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
        // console.log("currentParent: ",currentParent);
    };
    function advance(n){
        html = html.substring(n)
    }
    function parseStartTag(){
        const start = html.match(startTagOpen);
        // console.log("1 start: ",start);
        if(start){
            const match = {
                tarName:start[1],
                attrs:[]
            }
            advance(start[0].length);
            // console.log("2 html: ",html);
            let attr,end;
            // 如果不是开始标签就一直匹配下去
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
                advance(attr[0].length);
                // console.log("3 attr: ",attr);
                // console.log("4 html: ",html);
                match.attrs.push({name:attr[1],value:attr[3] || attr[4] || attr[5] || true})
                // console.log("5 match: ",match);
            }
            if(end){
                // console.log("7 end: ",end);
                advance(end[0].length)
            }
            // console.log("7 match: ",match);
            return match
        }
        return false
    }
    while(html){
        let textEnd = html.indexOf('<');
        // console.log("8 html: ",html);
        // console.log("8 textEnd: ",textEnd);
        if(textEnd == 0){
            const startTagMatch = parseStartTag();
            // console.log("startTagMatch: ",startTagMatch);
            if(startTagMatch){
                // console.log("9 startTagMatch: ",startTagMatch);
                start(startTagMatch.tarName, startTagMatch.attrs)
                continue;
            }
            let endTagMatch = html.match(endTag);
            if(endTagMatch){
                advance(endTagMatch[0].length);
                end(endTagMatch[0])
                continue;
            }
        }
        if(textEnd > 0){
            let text = html.substring(0, textEnd);
            // console.log("9 text: ",text);
            if(text){
                advance(text.length)
                chars(text)
            }            
        }
    }
    // console.log("10 html: ",html);
    // console.log("10 root: ",root);
    return root;
}
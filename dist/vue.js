(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var oldArrayproto = Array.prototype;
  var newArrayproto = Object.create(oldArrayproto);
  var methods = ["shift", "unshift", "pop", "push", "reverse", "sort", "splice"]; // concat slice不会改变原数组

  methods.forEach(function (method) {
    newArrayproto[method] = function () {
      var _oldArrayproto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // 重写数组的方法
      var result = (_oldArrayproto$method = oldArrayproto[method]).call.apply(_oldArrayproto$method, [this].concat(args)); // 内部调用原来的方法，函数劫持 切片编程
      // console.log(method);

      // 对对新增的数据再次观测
      var inserted;
      var ob = this.__ob__; //外部data调用方法，所以this就指向data
      switch (method) {
        case 'push':
        case "unshift":
          //vm.arr.unshift({a: 100})
          inserted = args;
          break;
        case "splice":
          //vm.arr.splice(0, 1, 55,56,57)
          inserted = args.slice(2);
          break;
      }
      // console.log(inserted);
      if (inserted) {
        ob.observeArray(inserted);
      }
      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      // Object.defineProperty只能劫持已经存在的属性，vue2的$set就是为后加的属性添加响应式

      // data.__ob__ = this //给data加上walk observeArray方法，array.js要使用以给新数据加上数据监测
      // data.__ob__ = this;会发生死循环，__ob__会被当做walk的key,defineReactive
      // 中调用observe，再次return new Observe(data)，又加上data.__proto__ = newArrayproto;
      // 再次执行walk,陷入死循环，所以修改该属性为不可枚举即可解决
      Object.defineProperties(data, _defineProperty({}, '__ob__', {
        value: this,
        enumerable: false
      }));

      // 不能给数组中的每个基本数据类型加上响应式，但是引用数据类型要加上响应式
      if (Array.isArray(data)) {
        data.__proto__ = newArrayproto;
        // 这里我们要重新重写数组的7个方法，但同时保留其他的方法
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }
    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        // 重新定义属性  性能不太行
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observe;
  }();
  function defineReactive(target, key, value) {
    observe(value);
    Object.defineProperties(target, _defineProperty({}, key, {
      get: function get() {
        //修改数组元素为基本数据类型时之所以会有这个log，应该是外层的数据的get,
        //不会出现打印console.log("用户取值了", value); 的value为数组元素为基本数据类型的情况
        // console.log("用户取值了", value); 
        return value;
      },
      set: function set(newValue) {
        // console.log("用户更改值了");
        if (value === newValue) return;
        observe(newValue); // 每一个新值也同样需要进行数据代理
        value = newValue;
      }
    }));
  }
  function observe(data) {
    if (_typeof(data) !== 'object' || data == null) {
      return; // 只对对象数据劫持
    }

    if (data.__ob__ instanceof Observe) {
      // 说明数据已经被劫持过，直接返回
      return data.__ob__;
    }

    // 被劫持过则不需要在劫持(判断是否被劫持,可以增添一个实例，用实例来判断是否被劫持过)
    return new Observe(data);
  }

  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
  }
  // vm._data 用vm 代理 使得读取vm._data.name可以简化为vm.name
  function proxy(vm, target, key) {
    Object.defineProperties(vm, _defineProperty({}, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newvalue) {
        if (vm[target][key] === newvalue) return;
        vm[target][key] = newvalue;
      }
    }));
  }
  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data;
    // console.log(vm._data === data); // true
    // 数据劫持
    observe(data); //Object.defineProperties重新递归定义递归

    // vm._data 用vm 代理 使得读取vm._data.name可以简化为vm.name
    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }

  // Regular Expressions for parsing tags and attributes
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  // var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z".concat(unicodeRegExp.source, "]*");
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture));
  var startTagClose = /^\s*(\/?)>/;
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = [];
    var currentParent;
    var root;
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }
    function start(tar, attrs) {
      // debugger
      var node = createASTElement(tar, attrs);
      if (!root) {
        root = node;
      }
      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
        // console.log(currentParent);
      }

      stack.push(node);
      currentParent = node;
    }
    function end(tag) {
      stack.pop();
      currentParent = stack[stack.length - 1];
    }
    function chars(text) {
      text = text.replace(/\s/g, '');
      // console.log(text);
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
      // console.log("currentParent: ",currentParent);
    }
    function advance(n) {
      html = html.substring(n);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      // console.log("1 start: ",start);
      if (start) {
        var match = {
          tarName: start[1],
          attrs: []
        };
        advance(start[0].length);
        // console.log("2 html: ",html);
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          // console.log("3 attr: ",attr);
          // console.log("4 html: ",html);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
          // console.log("5 match: ",match);
        }

        if (_end) {
          // console.log("7 end: ",end);
          advance(_end[0].length);
        }
        // console.log("7 match: ",match);
        return match;
      }
      return false;
    }
    while (html) {
      var textEnd = html.indexOf('<');
      // console.log("8 html: ",html);
      // console.log("8 textEnd: ",textEnd);
      if (textEnd == 0) {
        var startTagMatch = parseStartTag();
        // console.log("startTagMatch: ",startTagMatch);
        if (startTagMatch) {
          // console.log("9 startTagMatch: ",startTagMatch);
          start(startTagMatch.tarName, startTagMatch.attrs);
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[0]);
          continue;
        }
      }
      if (textEnd > 0) {
        var text = html.substring(0, textEnd);
        // console.log("9 text: ",text);
        if (text) {
          advance(text.length);
          chars(text);
        }
      }
    }
    // console.log("10 html: ",html);
    // console.log("10 root: ",root);
    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  function genProps(attrs) {
    var str = '';
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name == 'style') {
        var obj = {};
        // console.log(attr);
        attr.value.split(';').forEach(function (item) {
          var _item$split = item.split(':'),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
        // console.log(attr.value);
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }
  function genchildren(children) {
    return children.map(function (child) {
      // console.log("genchildren(children): ",child);
      var text = gen(child);
      // console.log(text);
      return text;
    }).join(',');
  }
  function gen(node) {
    // console.log(node.type);
    if (node.type === 1) {
      // console.log(`gen(node)${node.type}`,node);
      var text = codegen(node);
      // console.log("gen(node):",text);
      return text;
    } else {
      var _text = node.text;
      // console.log(text);
      if (!defaultTagRE.test(_text)) {
        // console.log(`_v(${text})`);
        return "_v(".concat(_text, ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;
        while (match = defaultTagRE.exec(_text)) {
          var index = match.index;
          if (index > lastIndex) {
            // console.log(text.slice(lastIndex, index));
            tokens.push(JSON.stringify(_text.slice(lastIndex, index)));
          }
          // console.log(index,"**");
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }
        if (lastIndex < _text.length) {
          tokens.push(JSON.stringify(_text.slice(lastIndex)));
        }
        // console.log("tokens: ",tokens);
        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }
  function codegen(ast) {
    var children = genchildren(ast.children);
    // console.log("children: ",ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null', ",").concat(ast.children.length ? "".concat(children) : '', ")");
    // console.log(code);
    return code;
  }
  function compileToFunction(html) {
    var ast = parseHTML(html);
    var code = codegen(ast);

    // console.log(code);
    code = "with(this){return ".concat(code, "}"); //with作用是使代码可以访问传进来的this的属性
    var render = new Function(code); //根据代码生成render函数
    // console.log(render);

    return render;
  }

  // h()  _c()
  function createElementVNode(vm, tag, data) {
    // console.log(vm);
    // console.log("tag: ",tag);
    // console.log("data: ",data);
    // console.log("...children: ",...children);
    if (data == null) {
      data = {};
    }
    var key = data.key;
    // console.log("data: ",data);
    // console.log("key: ",key);
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, key, data, children);
  }

  //  _v()
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  // ast一样吗？ ast做的是语法层面的转化，他描述的是语法本身(html,css,js)，我们的虚拟DOM是
  // 描述的DOM元素，可以增加一些自定义的属性
  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function createElm(vnode) {
    //              (标签名 key)
    //          vnode(div app)
    //              /           \
    //    vonde(div div)         vnode(span span)
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag === 'string') {
      //标签
      vnode.el = document.createElement(tag); //这里将真实节点和虚拟节点对应起来，后续如果修改属性
      patchProps(vnode.el, data);
      children.forEach(function (child) {
        // console.log(vnode);
        vnode.el.appendChild(createElm(child)); //递归，不断地向vnode.el里添加html元素
      });
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  function patch(oldVNode, vnode) {
    // 写的是初渲染流程
    var isRealELement = oldVNode.nodeType;
    if (isRealELement) {
      var elm = oldVNode;
      var parentElm = elm.parentNode;
      // console.log(parentElm, vnode);
      var newElm = createElm(vnode);
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm);
      return newElm;
    }
  }
  function initLifeCycle(Vue) {
    Vue.prototype._updata = function (vnode) {
      var vm = this;
      var el = vm.$el;
      var elm = patch(el, vnode);
      vm.$el = elm;
    };

    // _c(
    //     'div',
    //     {id:"app",style:{"color":"red","background-color":"yellow"}},
    //     _c(
    //         'div',
    //         {style:{"color":"red"}},
    //         _v(
    //             _s(arr[3].JNTM)+"Terraria"+_s(arr[1])+"Terraria"
    //         )
    //     ),
    //     _c('span',null,_v(_s(arr[2])))
    // )

    // 根据_c _v _s生成的vnode是不一样的，tag(标签名)是不一样的，可以根据这个区分
    // _c('div', {}, ...children)
    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    // _v(text)
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    Vue.prototype._s = function (value) {
      if (typeof value !== 'Object') return value;
      return JSON.stringify(value);
    };
    Vue.prototype._render = function () {
      var vm = this;
      // 让with中的this 指向 vm
      // 当渲染的时候会去实例上取值，我们就可以将属性和视图绑定在一起
      return vm.$options.render.call(vm); // 通过ast语法转义后的render方法
    };
  }

  function mountComponent(vm, el) {
    vm.$el = el;

    // 1.调用render方法生成虚拟dom
    // vm._render();   //vm.$options.render() 虚拟节点
    vm._updata(vm._render()); //虚拟节点扩展为真实节点

    // 2.根据虚拟dom生成真实dom

    // 3.插入到el元素中
  }

  // Vue核心流程
  // 1> 创造响应式数据
  // 1> 模板解析为ast语法树
  // 1> 将ast语法树转换为render函数，因为使用正则匹配，性能损耗比较大，所以转换为render函数
  // 1> 后续数据更新只需要重新执行render函数，无需再次执行ast转化

  // render函数会产生虚拟节点(使用响应式数据)
  // 根据生成的虚拟节点创造真实的DOM

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // 用户数据挂载到实例上

      // 初始状态
      initState(vm);
      if (options.el) {
        vm.$mount(options.el);
      }
    };
    Vue.prototype.$mount = function (el) {
      // debugger
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;
      if (!ops.render) {
        // 查找有无render
        var template;
        if (!ops.template && el) {
          // 没写template用外部的template
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template; // 写了template用自己的的template
          }
        }
        // console.log(template);
        if (template) {
          var render = compileToFunction(template);
          ops.render = render;
        }
      }
      mountComponent(vm, el); //组件的挂载
    };
  }

  function Vue(options) {
    this._init(options);
  }
  initMixin(Vue);
  initLifeCycle(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map

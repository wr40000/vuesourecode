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
      ob.dep.notify(); //让对象和数组本身也响应
      return result;
    };
  });

  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++; // 属性的dep要收集watcher
      this.subs = []; //这里存放着当前属性对应的wetcher有哪些
    }
    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 不希望放重复的watcher 而且刚才只是一个单向的关系  dep => Watcher
        // this.subs.push(Dep.target);

        Dep.target.addDep(this); //让watcher记住dep  双向
        // watcher和Dep是一个多对多的关系(一个属性可以再多个组件中使用dep -> 多个watcher)
        // 一个组件中由多个属性组成(一个watcher对应多个dep)
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.updata();
        });
      }
    }]);
    return Dep;
  }();
  Dep.target = null;
  var stack = [];
  function pushTarget(watcher) {
    // debugger
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    // debugger
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      this.dep = new Dep(); //所有对象也增加dep
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
  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();
      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }
  function defineReactive(target, key, value) {
    var childDep = observe(value);
    var dep = new Dep();
    // console.log(dep,key);
    Object.defineProperties(target, _defineProperty({}, key, {
      get: function get() {
        if (Dep.target) {
          dep.depend(); //让这个属性收集器记住当前的watch
          if (childDep) {
            childDep.dep.depend(); //让对象和数组本身也依赖收集
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
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
        dep.notify();
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

  var id = 0;

  // 给每个属性增加一个dep
  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);
      this.id = id++;
      this.renderWatcher = options; //表示是一个渲染函数
      if (typeof exprOrFn === 'string') {
        this.getter = function () {
          // console.log("vm[exprOrFn]: ", vm[exprOrFn]);
          return vm[exprOrFn];
        };
      } else {
        this.getter = exprOrFn; //getter意味着这个函数可以发生取值操作
      }

      this.deps = []; //后续实现计算属性和一些清理工作需要用到
      this.depsId = new Set();
      this.lazy = options.lazy;
      this.cb = cb;
      this.dirty = this.lazy;
      this.vm = vm;
      this.user = options.user;
      this.value = this.lazy ? undefined : this.get(); //意味着这个函数发生取值操作
    }
    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // this:更新函数所在的那个watcher  类中的this都是实例 这里的this=> Watcher
        // Dep.target = this;  //静态属性就是只有一份  实现计算属性时替换为pushTarget(this)
        pushTarget(this);
        var value = this.getter.call(this.vm); //会去vm上取值  
        // Dep.target = null;   //实现计算属性时替换为popTarget()
        popTarget();
        return value;
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        // 获取到用户函数的返回值，同时还要将dirty改为false,标识为脏
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;
        while (i--) {
          this.deps[i].depend(); //让计算属性watcher也收集渲染watcher
        }
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        //一个事件对应着多个属性 重复的属性也不用记录
        var id = dep.id;
        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); //watcher已经记住了dep,此时让dep也记住watcher
        }
      }
    }, {
      key: "updata",
      value: function updata() {
        if (this.lazy) {
          this.dirty = true;
        } else {
          // this.get()  //重新更新
          queueWatcher(this); //把当前watcher存起来  放到一个队列里
        }
      }
    }, {
      key: "run",
      value: function run() {
        var oldValue = this.value;
        var newValue = this.get();
        if (this.user) {
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }]);
    return Watcher;
  }();
  var queue = [];
  var has = {};
  var pending = false; //防抖
  function flushSchedulerQueue() {
    var flusherQueue = queue.slice(0);
    has = {};
    queue = [];
    pending = false;
    flusherQueue.forEach(function (q) {
      q.run();
    });
  }
  function queueWatcher(watcher) {
    var id = watcher.id;
    if (!has[id]) {
      //一个watcher不重复刷新
      queue.push(watcher);
      has[id] = true;
      if (!pending) {
        // setTimeout(flushSchedulerQueue,0)
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }
  var callbacks = [];
  var waiting = false;
  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    });
  }
  // nextTick没有直接使用某个api，而是采用优雅降级的方式
  // 内部先采用的是Promise,MutationObserver(h5的api), 
  var timeFunc; //初始化文件时确定了该函数
  if (Promise) {
    timeFunc = function timeFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observer = new MutationObserver(flushCallbacks); //这里传入的回调是异步执行的
    var textNode = document.createTextNode(1);
    observer.observe(textNode, {
      characterData: true
    });
    timeFunc = function timeFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timeFunc = function timeFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timeFunc = function timeFunc() {
      setTimeout(flushCallbacks);
    };
  }
  function nextTick(cb) {
    callbacks.push(cb); //维护nextTick中的callback方法
    if (!waiting) {
      // setTimeout(()=>{
      //     flushCallbacks();
      // }, 0)
      timeFunc();
      waiting = true;
    }
  }

  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
    if (opts.computed) {
      // debugger
      initComputed(vm);
    }
    if (opts.watch) {
      // debugger
      initWatch(vm);
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
  function initWatch(vm) {
    var watch = vm.$options.watch;
    for (var key in watch) {
      var handler = watch[key]; //字符串 数组 函数
      // console.log("key: ", key, "handler: ", handler);
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }
  function createWatcher(vm, key, handler) {
    // 字符串 函数
    if (typeof handler === 'string') {
      handler = vm[handler];
    }
    return vm.$watch(key, handler);
  }
  function initComputed(vm) {
    var computed = vm.$options.computed;
    // 将计算属性的getter保存到vm上
    var watchers = vm._createComputedGetter = {};
    for (var key in computed) {
      var userDef = computed[key];
      var fn = typeof userDef === 'function' ? userDef : userDef.get;
      // 1> {lazy:true}是不希望上来就执行fn 像一般的渲染watcher会直接执行get(),也就是渲染函数
      // 2> 将属性和watcher对应起来
      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }
  function defineComputed(target, key, userDef) {
    var setter = userDef.set || function () {};
    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }
  function createComputedGetter(key) {
    // 监测是否要执行这个getter
    return function () {
      // 获取到对应的watcher
      var watcher = this._createComputedGetter[key];
      if (watcher.dirty) {
        // 求值后dirty为true, 下次就不求了
        watcher.evaluate();
      }
      if (Dep.target) {
        //渲染watcher                       
        watcher.depend(); //计算属性出栈后，应该让计算属性watcher里面的w属性也去收集上层watcher
        // 月收集上一层的watcher
      }

      return watcher.value;
    };
  }
  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;
    Vue.prototype.$watch = function (exprOrFn, cb) {
      // console.log('exprOrFn: ',exprOrFn,"cb: ", cb, "options: ",options);

      // work的值发生变化了，直接执行cb函数即可
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
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
        // 如果不是开始标签就一直匹配下去
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
    // console.log(attrs);
    var str = '';
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name == 'style') {
        var obj = {};
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
    // console.log(data);
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
    var node = {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
      //......
    };
    // console.log(node);
    return node;
  }
  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
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
      patchProps(vnode.el, {}, data);
      children.forEach(function (child) {
        // console.log(vnode);
        vnode.el.appendChild(createElm(child)); //递归，不断地向vnode.el里添加html元素
      });
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // 老的属性有，新的没有，删除老的
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};
    for (var key in oldStyles) {
      if (!newStyles[key]) {
        el.style[key] = '';
      }
    }
    for (var _key in oldProps) {
      //老的属性有
      if (!props[_key]) {
        //新的没有要删除
        el.removeAttribute[_key];
      }
    }
    for (var _key2 in props) {
      //用新的覆盖老的
      if (_key2 === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
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
    } else {
      return patchVnode(oldVNode, vnode);
    }
  }
  function patchVnode(oldVNode, vnode) {
    if (!isSameVnode(oldVNode, vnode)) {
      var _el = createElm(vnode);
      oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
      return _el;
    }
    // 文本情况
    // debugger
    var el = vnode.el = oldVNode.el; //复用老节点的文本
    if (!oldVNode.tag) {
      //是文本
      if (oldVNode.text !== vnode.text) {
        el.textContent = vnode.text;
      }
    }
    patchProps(el, oldVNode.data, vnode.data);

    // 比较儿子节点
    var oldChildren = oldVNode.children || [];
    var newChildren = vnode.children || [];
    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 完整的diff算法,比较两者的孩子
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
      mountChildren(el, newChildren);
    } else if (oldChildren.length > 0) {
      el.innerHTML = '';
    }
    return el;
  }
  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }
  function updateChildren(el, oldChildren, newChildren) {
    console.log(oldChildren, newChildren);
    var oldStartIndex = 0;
    var newStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex];
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      if (isSameVnode(oldStartVnode, newStartVnode)) {
        //头头比对
        patchVnode(oldStartVnode, newStartVnode); //相同节点，递归比较子节点
        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
        // 开始比较开头节点
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        //尾尾比对
        patchVnode(oldEndVnode, newEndVnode); //相同节点，递归比较子节点
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
        // 开始比较开头节点
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        //交叉比对
        patchVnode(oldEndVnode, newStartVnode);
        el.insertBefore(oldEndVnode.el, oldStartVnode.el);
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
        // 开始比较开头节点
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        //交叉比对
        patchVnode(oldStartVnode, newEndVnode);
        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
        // 开始比较开头节点
      }
    }

    if (newStartIndex <= newEndIndex) {
      //新的多了  多余的就插入进去
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]);
        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
        // el.appendChild(childEl)
        el.insertBefore(childEl, anchor); //anchor为null则会认为是appendchildren
      }
    }

    if (oldStartIndex <= oldEndIndex) {
      //老的多了  删除老的
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        var _childEl = createElm(oldChildren[_i]);
        el.removeChild(_childEl);
      }
    }

    // console.log(oldEndIndex,newEndIndex,oldStartVnode,newStartVnode,oldEndVnode,newEndVnode);
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
    //             _s(arr[3].JNTM)+"Terraria"+_s(arr[1])+"Terraria" //似乎会将_s的结果拼串
    //         )
    //     ),
    //     _c('span',null,_v(_s(arr[2])))
    // )

    // 根据_c _v _s生成的vnode是不一样的，tag(标签名)是不一样的，可以根据这个区分
    // _c('div', {}, ...children)  ...arguments是 'div', {}, ...children
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
    var updataComponent = function updataComponent() {
      vm._updata(vm._render()); //虚拟节点扩展为真实节点
    };
    // 我们可以给模板里的属性增加以一个收集器dep
    // 页面渲染的时候 我们将渲染逻辑封装到watcher中  vm._updata(vm._render())
    // 让dep记住这个wetcher即可，稍后属性表变化了可以找到对应的dep中的存放的wetcher进行
    // 重新渲染
    new Watcher(vm, updataComponent, true);
    // console.log(watcher);

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

  function callHook(vm, hook) {
    // 调用钩子函数
    var handlers = vm.$options[hook];
    // console.log("handlers: ",handlers);
    if (handlers) {
      handlers.forEach(function (handler) {
        handler.call(vm);
      });
    }
  }

  // 静态方法
  var strats = {};
  var LIFECYCLE = ["beforeCreate", "created"];
  LIFECYCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      if (c) {
        if (p) {
          return p.concat(c);
        } else {
          return [c]; //儿子有父亲没有
        }
      } else {
        return p; //如果儿子没有则用父亲即可
      }
    };
  });

  function mergeOptions(parent, child) {
    // console.log("parent: ",parent);
    var options = {};
    for (var key in parent) {
      mergeField(key);
    }
    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }
    function mergeField(key) {
      // 策略模式，目的是减少if / else
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        // 如果不在策略中
        options[key] = child[key] || parent[key]; // 优先采用儿子
      }
    }

    return options;
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // 用户数据挂载到实例上  并合并
      vm.$options = mergeOptions(this.constructor.options, options);
      callHook(vm, 'beforeCreate');
      // 初始状态
      initState(vm);
      callHook(vm, 'created');
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

  function initGlobalAPI(Vue) {
    Vue.options = {};
    Vue.mixin = function (mixin) {
      // 我们希望将用户的选项和全局的options进行合并
      this.options = mergeOptions(this.options, mixin);
      return this;
    };
  }

  function Vue(options) {
    this._init(options);
  }
  initMixin(Vue); //扩展了init方法
  initLifeCycle(Vue);
  initGlobalAPI(Vue); //全局API
  initStateMixin(Vue); //实现$nextTick $watch

  var render1 = compileToFunction("<ul a=\"1\" key=\"a\" style=\"color:#0000ff;background-color: #ff0000\">    \n<li key=\"a\">1</li>\n<li key=\"b\">2</li>\n<li key=\"c\">3</li>  \n<li key=\"d\">4</li>    \n</ul>");
  var vm1 = new Vue({
    data: {
      name: '第一次'
    }
  });
  var preVnode = render1.call(vm1);
  var el = createElm(preVnode);
  document.body.appendChild(el);

  // let render2 = compileToFunction('<span>{{name}}</span>');
  var render2 = compileToFunction("<ul a=\"1\" key=\"a\" style=\"color:#0000ff;background-color: #00ff00\">\n<li key=\"b\">2</li>\n<li key=\"c\">3</li>  \n<li key=\"d\">4</li>        \n<li key=\"a\">1</li>\n</ul>");
  var vm2 = new Vue({
    data: {
      name: '第二次'
    }
  });
  var nextVnode = render2.call(vm2);
  // console.log(nextVnode);

  setTimeout(function () {
    patch(preVnode, nextVnode);
  }, 1000);

  return Vue;

}));
//# sourceMappingURL=vue.js.map

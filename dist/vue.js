(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
      console.log(method);

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
      console.log(inserted);
      if (inserted) {
        ob.observeArray(inserted);
      }
      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      // Object.defineProperty智能劫持已经存在的属性，vue2的$set就是为后加的属性添加响应式

      // data.__ob__ = this //给data加上walk observeArray方法，array.js要使用以给新数据加上数据监测
      // data.__proto__ = newArrayproto;会发生死循环，__ob__会被当做walk的key,defineReactive
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
        console.log("用户取值了", value);
        return value;
      },
      set: function set(newValue) {
        console.log("用户更改值了");
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

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // 用户数据挂载到实例上

      // 初始状态
      initState(vm);
    };
  }

  function Vue(options) {
    this._init(options);
  }
  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map

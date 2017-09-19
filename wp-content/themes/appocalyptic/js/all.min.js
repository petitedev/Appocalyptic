

(function (window, factory) {
  if (typeof define == 'function' && define.amd) {
    define('jquery-bridget/jquery-bridget', ['jquery'], function (jQuery) {
      return factory(window, jQuery);
    });
  } else if (typeof module == 'object' && module.exports) {
    module.exports = factory(window, require('jquery'));
  } else {
    window.jQueryBridget = factory(window, window.jQuery);
  }
})(window, function factory(window, jQuery) {
  'use strict';

  var arraySlice = Array.prototype.slice;

  var console = window.console;
  var logError = typeof console == 'undefined' ? function () {} : function (message) {
    console.error(message);
  };

  function jQueryBridget(namespace, PluginClass, $) {
    $ = $ || jQuery || window.jQuery;
    if (!$) {
      return;
    }

    if (!PluginClass.prototype.option) {
      PluginClass.prototype.option = function (opts) {
        if (!$.isPlainObject(opts)) {
          return;
        }
        this.options = $.extend(true, this.options, opts);
      };
    }

    $.fn[namespace] = function (arg0) {
      if (typeof arg0 == 'string') {
        var args = arraySlice.call(arguments, 1);
        return methodCall(this, arg0, args);
      }

      plainCall(this, arg0);
      return this;
    };

    function methodCall($elems, methodName, args) {
      var returnValue;
      var pluginMethodStr = '$().' + namespace + '("' + methodName + '")';

      $elems.each(function (i, elem) {
        var instance = $.data(elem, namespace);
        if (!instance) {
          logError(namespace + ' not initialized. Cannot call methods, i.e. ' + pluginMethodStr);
          return;
        }

        var method = instance[methodName];
        if (!method || methodName.charAt(0) == '_') {
          logError(pluginMethodStr + ' is not a valid method');
          return;
        }

        var value = method.apply(instance, args);

        returnValue = returnValue === undefined ? value : returnValue;
      });

      return returnValue !== undefined ? returnValue : $elems;
    }

    function plainCall($elems, options) {
      $elems.each(function (i, elem) {
        var instance = $.data(elem, namespace);
        if (instance) {
          instance.option(options);
          instance._init();
        } else {
          instance = new PluginClass(elem, options);
          $.data(elem, namespace, instance);
        }
      });
    }

    updateJQuery($);
  }

  function updateJQuery($) {
    if (!$ || $ && $.bridget) {
      return;
    }
    $.bridget = jQueryBridget;
  }

  updateJQuery(jQuery || window.jQuery);

  return jQueryBridget;
});

(function (global, factory) {
  if (typeof define == 'function' && define.amd) {
    define('ev-emitter/ev-emitter', factory);
  } else if (typeof module == 'object' && module.exports) {
    module.exports = factory();
  } else {
    global.EvEmitter = factory();
  }
})(typeof window != 'undefined' ? window : this, function () {

  function EvEmitter() {}

  var proto = EvEmitter.prototype;

  proto.on = function (eventName, listener) {
    if (!eventName || !listener) {
      return;
    }

    var events = this._events = this._events || {};

    var listeners = events[eventName] = events[eventName] || [];

    if (listeners.indexOf(listener) == -1) {
      listeners.push(listener);
    }

    return this;
  };

  proto.once = function (eventName, listener) {
    if (!eventName || !listener) {
      return;
    }

    this.on(eventName, listener);

    var onceEvents = this._onceEvents = this._onceEvents || {};

    var onceListeners = onceEvents[eventName] = onceEvents[eventName] || {};

    onceListeners[listener] = true;

    return this;
  };

  proto.off = function (eventName, listener) {
    var listeners = this._events && this._events[eventName];
    if (!listeners || !listeners.length) {
      return;
    }
    var index = listeners.indexOf(listener);
    if (index != -1) {
      listeners.splice(index, 1);
    }

    return this;
  };

  proto.emitEvent = function (eventName, args) {
    var listeners = this._events && this._events[eventName];
    if (!listeners || !listeners.length) {
      return;
    }
    var i = 0;
    var listener = listeners[i];
    args = args || [];

    var onceListeners = this._onceEvents && this._onceEvents[eventName];

    while (listener) {
      var isOnce = onceListeners && onceListeners[listener];
      if (isOnce) {
        this.off(eventName, listener);

        delete onceListeners[listener];
      }

      listener.apply(this, args);

      i += isOnce ? 0 : 1;
      listener = listeners[i];
    }

    return this;
  };

  proto.allOff = proto.removeAllListeners = function () {
    delete this._events;
    delete this._onceEvents;
  };

  return EvEmitter;
});

(function (window, factory) {
  'use strict';

  if (typeof define == 'function' && define.amd) {
    define('desandro-matches-selector/matches-selector', factory);
  } else if (typeof module == 'object' && module.exports) {
    module.exports = factory();
  } else {
    window.matchesSelector = factory();
  }
})(window, function factory() {
  'use strict';

  var matchesMethod = function () {
    var ElemProto = window.Element.prototype;

    if (ElemProto.matches) {
      return 'matches';
    }

    if (ElemProto.matchesSelector) {
      return 'matchesSelector';
    }

    var prefixes = ['webkit', 'moz', 'ms', 'o'];

    for (var i = 0; i < prefixes.length; i++) {
      var prefix = prefixes[i];
      var method = prefix + 'MatchesSelector';
      if (ElemProto[method]) {
        return method;
      }
    }
  }();

  return function matchesSelector(elem, selector) {
    return elem[matchesMethod](selector);
  };
});

(function (window, factory) {

  if (typeof define == 'function' && define.amd) {
    define('fizzy-ui-utils/utils', ['desandro-matches-selector/matches-selector'], function (matchesSelector) {
      return factory(window, matchesSelector);
    });
  } else if (typeof module == 'object' && module.exports) {
    module.exports = factory(window, require('desandro-matches-selector'));
  } else {
    window.fizzyUIUtils = factory(window, window.matchesSelector);
  }
})(window, function factory(window, matchesSelector) {

  var utils = {};

  utils.extend = function (a, b) {
    for (var prop in b) {
      a[prop] = b[prop];
    }
    return a;
  };

  utils.modulo = function (num, div) {
    return (num % div + div) % div;
  };

  utils.makeArray = function (obj) {
    var ary = [];
    if (Array.isArray(obj)) {
      ary = obj;
    } else if (obj && typeof obj == 'object' && typeof obj.length == 'number') {
      for (var i = 0; i < obj.length; i++) {
        ary.push(obj[i]);
      }
    } else {
      ary.push(obj);
    }
    return ary;
  };

  utils.removeFrom = function (ary, obj) {
    var index = ary.indexOf(obj);
    if (index != -1) {
      ary.splice(index, 1);
    }
  };

  utils.getParent = function (elem, selector) {
    while (elem.parentNode && elem != document.body) {
      elem = elem.parentNode;
      if (matchesSelector(elem, selector)) {
        return elem;
      }
    }
  };

  utils.getQueryElement = function (elem) {
    if (typeof elem == 'string') {
      return document.querySelector(elem);
    }
    return elem;
  };

  utils.handleEvent = function (event) {
    var method = 'on' + event.type;
    if (this[method]) {
      this[method](event);
    }
  };

  utils.filterFindElements = function (elems, selector) {
    elems = utils.makeArray(elems);
    var ffElems = [];

    elems.forEach(function (elem) {
      if (!(elem instanceof HTMLElement)) {
        return;
      }

      if (!selector) {
        ffElems.push(elem);
        return;
      }

      if (matchesSelector(elem, selector)) {
        ffElems.push(elem);
      }

      var childElems = elem.querySelectorAll(selector);

      for (var i = 0; i < childElems.length; i++) {
        ffElems.push(childElems[i]);
      }
    });

    return ffElems;
  };

  utils.debounceMethod = function (_class, methodName, threshold) {
    var method = _class.prototype[methodName];
    var timeoutName = methodName + 'Timeout';

    _class.prototype[methodName] = function () {
      var timeout = this[timeoutName];
      if (timeout) {
        clearTimeout(timeout);
      }
      var args = arguments;

      var _this = this;
      this[timeoutName] = setTimeout(function () {
        method.apply(_this, args);
        delete _this[timeoutName];
      }, threshold || 100);
    };
  };

  utils.docReady = function (callback) {
    var readyState = document.readyState;
    if (readyState == 'complete' || readyState == 'interactive') {
      setTimeout(callback);
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  };

  utils.toDashed = function (str) {
    return str.replace(/(.)([A-Z])/g, function (match, $1, $2) {
      return $1 + '-' + $2;
    }).toLowerCase();
  };

  var console = window.console;

  utils.htmlInit = function (WidgetClass, namespace) {
    utils.docReady(function () {
      var dashedNamespace = utils.toDashed(namespace);
      var dataAttr = 'data-' + dashedNamespace;
      var dataAttrElems = document.querySelectorAll('[' + dataAttr + ']');
      var jsDashElems = document.querySelectorAll('.js-' + dashedNamespace);
      var elems = utils.makeArray(dataAttrElems).concat(utils.makeArray(jsDashElems));
      var dataOptionsAttr = dataAttr + '-options';
      var jQuery = window.jQuery;

      elems.forEach(function (elem) {
        var attr = elem.getAttribute(dataAttr) || elem.getAttribute(dataOptionsAttr);
        var options;
        try {
          options = attr && JSON.parse(attr);
        } catch (error) {
          if (console) {
            console.error('Error parsing ' + dataAttr + ' on ' + elem.className + ': ' + error);
          }
          return;
        }

        var instance = new WidgetClass(elem, options);

        if (jQuery) {
          jQuery.data(elem, namespace, instance);
        }
      });
    });
  };

  return utils;
});

(function (window, factory) {
  if (typeof define == 'function' && define.amd) {
    define('infinite-scroll/js/core', ['ev-emitter/ev-emitter', 'fizzy-ui-utils/utils'], function (EvEmitter, utils) {
      return factory(window, EvEmitter, utils);
    });
  } else if (typeof module == 'object' && module.exports) {
    module.exports = factory(window, require('ev-emitter'), require('fizzy-ui-utils'));
  } else {
    window.InfiniteScroll = factory(window, window.EvEmitter, window.fizzyUIUtils);
  }
})(window, function factory(window, EvEmitter, utils) {

  var jQuery = window.jQuery;

  var instances = {};

  function InfiniteScroll(element, options) {
    var queryElem = utils.getQueryElement(element);

    if (!queryElem) {
      console.error('Bad element for InfiniteScroll: ' + (queryElem || element));
      return;
    }
    element = queryElem;

    if (element.infiniteScrollGUID) {
      var instance = instances[element.infiniteScrollGUID];
      instance.option(options);
      return instance;
    }

    this.element = element;

    this.options = utils.extend({}, InfiniteScroll.defaults);
    this.option(options);

    if (jQuery) {
      this.$element = jQuery(this.element);
    }

    this.create();
  }

  InfiniteScroll.defaults = {};

  InfiniteScroll.create = {};
  InfiniteScroll.destroy = {};

  var proto = InfiniteScroll.prototype;

  utils.extend(proto, EvEmitter.prototype);

  var GUID = 0;

  proto.create = function () {
    var id = this.guid = ++GUID;
    this.element.infiniteScrollGUID = id;
    instances[id] = this;
    this.pageIndex = 1;
    this.loadCount = 0;
    this.updateGetPath();

    if (!this.getPath) {
      console.error('Disabling InfiniteScroll');
      return;
    }
    this.updateGetAbsolutePath();
    this.log('initialized', [this.element.className]);
    this.callOnInit();

    for (var method in InfiniteScroll.create) {
      InfiniteScroll.create[method].call(this);
    }
  };

  proto.option = function (opts) {
    utils.extend(this.options, opts);
  };

  proto.callOnInit = function () {
    var onInit = this.options.onInit;
    if (onInit) {
      onInit.call(this, this);
    }
  };

  proto.dispatchEvent = function (type, event, args) {
    this.log(type, args);
    var emitArgs = event ? [event].concat(args) : args;
    this.emitEvent(type, emitArgs);

    if (!jQuery || !this.$element) {
      return;
    }

    type += '.infiniteScroll';
    var $event = type;
    if (event) {
      var jQEvent = jQuery.Event(event);
      jQEvent.type = type;
      $event = jQEvent;
    }
    this.$element.trigger($event, args);
  };

  var loggers = {
    initialized: function (className) {
      return 'on ' + className;
    },
    request: function (path) {
      return 'URL: ' + path;
    },
    load: function (response, path) {
      return (response.title || '') + '. URL: ' + path;
    },
    error: function (error, path) {
      return error + '. URL: ' + path;
    },
    append: function (response, path, items) {
      return items.length + ' items. URL: ' + path;
    },
    last: function (response, path) {
      return 'URL: ' + path;
    },
    history: function (title, path) {
      return 'URL: ' + path;
    },
    pageIndex: function (index, origin) {
      return 'current page determined to be: ' + index + ' from ' + origin;
    }
  };

  proto.log = function (type, args) {
    if (!this.options.debug) {
      return;
    }
    var message = '[InfiniteScroll] ' + type;
    var logger = loggers[type];
    if (logger) {
      message += '. ' + logger.apply(this, args);
    }
    console.log(message);
  };

  proto.updateMeasurements = function () {
    this.windowHeight = window.innerHeight;
    var rect = this.element.getBoundingClientRect();
    this.top = rect.top + window.pageYOffset;
  };

  proto.updateScroller = function () {
    var elementScroll = this.options.elementScroll;
    if (!elementScroll) {
      this.scroller = window;
      return;
    }

    this.scroller = elementScroll === true ? this.element : utils.getQueryElement(elementScroll);
    if (!this.scroller) {
      throw 'Unable to find elementScroll: ' + elementScroll;
    }
  };

  proto.updateGetPath = function () {
    var optPath = this.options.path;
    if (!optPath) {
      console.error('InfiniteScroll path option required. Set as: ' + optPath);
      return;
    }

    var type = typeof optPath;
    if (type == 'function') {
      this.getPath = optPath;
      return;
    }

    var templateMatch = type == 'string' && optPath.match('{{#}}');
    if (templateMatch) {
      this.updateGetPathTemplate(optPath);
      return;
    }

    this.updateGetPathSelector(optPath);
  };

  proto.updateGetPathTemplate = function (optPath) {
    this.getPath = function () {
      var nextIndex = this.pageIndex + 1;
      return optPath.replace('{{#}}', nextIndex);
    }.bind(this);

    var regexString = optPath.replace('{{#}}', '(\\d\\d?\\d?)');
    var templateRe = new RegExp(regexString);
    var match = location.href.match(templateRe);
    if (match) {
      this.pageIndex = parseInt(match[1], 10);
      this.log('pageIndex', this.pageIndex, 'template string');
    }
  };

  var pathRegexes = [/^(.*?\/?page\/?)(\d\d?\d?)(.*?$)/, /^(.*?\/?\?page=)(\d\d?\d?)(.*?$)/, /(.*?)(\d\d?\d?)(?!.*\d)(.*?$)/];

  proto.updateGetPathSelector = function (optPath) {
    var hrefElem = document.querySelector(optPath);
    if (!hrefElem) {
      console.error('Bad InfiniteScroll path option. Next link not found: ' + optPath);
      return;
    }
    var href = hrefElem.getAttribute('href');

    var pathParts, regex;
    for (var i = 0; href && i < pathRegexes.length; i++) {
      regex = pathRegexes[i];
      var match = href.match(regex);
      if (match) {
        pathParts = match.slice(1);
        break;
      }
    }
    if (!pathParts) {
      console.error('InfiniteScroll unable to parse next link href: ' + href);
      return;
    }
    this.isPathSelector = true;
    this.getPath = function () {
      var nextIndex = this.pageIndex + 1;
      return pathParts[0] + nextIndex + pathParts[2];
    }.bind(this);

    this.pageIndex = parseInt(pathParts[1], 10) - 1;
    this.log('pageIndex', [this.pageIndex, 'next link']);
  };

  proto.updateGetAbsolutePath = function () {
    var path = this.getPath();

    var isAbsolute = path.match(/^http/) || path.match(/^\//);
    if (isAbsolute) {
      this.getAbsolutePath = this.getPath;
      return;
    }

    var pathname = location.pathname;

    var directory = pathname.substring(0, pathname.lastIndexOf('/'));

    this.getAbsolutePath = function () {
      return directory + '/' + this.getPath();
    };
  };

  InfiniteScroll.create.hideNav = function () {
    var nav = utils.getQueryElement(this.options.hideNav);
    if (!nav) {
      return;
    }
    nav.style.display = 'none';
    this.nav = nav;
  };

  InfiniteScroll.destroy.hideNav = function () {
    if (this.nav) {
      this.nav.style.display = '';
    }
  };

  proto.destroy = function () {
    this.allOff();
    for (var method in InfiniteScroll.destroy) {
      InfiniteScroll.destroy[method].call(this);
    }

    delete this.element.infiniteScrollGUID;
    delete instances[this.guid];
  };

  InfiniteScroll.throttle = function (fn, threshold) {
    threshold = threshold || 200;
    var last, timeout;

    return function () {
      var now = +new Date();
      var args = arguments;
      var trigger = function () {
        last = now;
        fn.apply(this, args);
      }.bind(this);
      if (last && now < last + threshold) {
        clearTimeout(timeout);
        timeout = setTimeout(trigger, threshold);
      } else {
        trigger();
      }
    };
  };

  InfiniteScroll.data = function (elem) {
    elem = utils.getQueryElement(elem);
    var id = elem && elem.infiniteScrollGUID;
    return id && instances[id];
  };

  InfiniteScroll.setJQuery = function ($) {
    jQuery = $;
  };

  utils.htmlInit(InfiniteScroll, 'infinite-scroll');

  if (jQuery && jQuery.bridget) {
    jQuery.bridget('infiniteScroll', InfiniteScroll);
  }

  return InfiniteScroll;
});

(function (window, factory) {
  if (typeof define == 'function' && define.amd) {
    define('infinite-scroll/js/page-load', ['./core'], function (InfiniteScroll) {
      return factory(window, InfiniteScroll);
    });
  } else if (typeof module == 'object' && module.exports) {
    module.exports = factory(window, require('./core'));
  } else {
    factory(window, window.InfiniteScroll);
  }
})(window, function factory(window, InfiniteScroll) {

  var proto = InfiniteScroll.prototype;

  InfiniteScroll.defaults.loadOnScroll = true;
  InfiniteScroll.defaults.checkLastPage = true;
  InfiniteScroll.defaults.responseType = 'document';


  InfiniteScroll.create.pageLoad = function () {
    this.canLoad = true;
    this.on('scrollThreshold', this.onScrollThresholdLoad);
    this.on('append', this.checkLastPage);
    if (this.options.outlayer) {
      this.on('append', this.onAppendOutlayer);
    }
  };

  proto.onScrollThresholdLoad = function () {
    if (this.options.loadOnScroll) {
      this.loadNextPage();
    }
  };

  proto.loadNextPage = function () {
    if (this.isLoading || !this.canLoad) {
      return;
    }

    var path = this.getAbsolutePath();
    this.isLoading = true;

    var onLoad = function (response) {
      this.onPageLoad(response, path);
    }.bind(this);

    var onError = function (error) {
      this.onPageError(error, path);
    }.bind(this);

    request(path, this.options.responseType, onLoad, onError);
    this.dispatchEvent('request', null, [path]);
  };

  proto.onPageLoad = function (response, path) {
    if (!this.options.append) {
      this.isLoading = false;
    }
    this.pageIndex++;
    this.loadCount++;
    this.dispatchEvent('load', null, [response, path]);
    this.appendNextPage(response, path);
    return response;
  };

  proto.appendNextPage = function (response, path) {
    var optAppend = this.options.append;

    var isDocument = this.options.responseType == 'document';
    if (!isDocument || !optAppend) {
      return;
    }

    var items = response.querySelectorAll(optAppend);
    var fragment = getItemsFragment(items);
    var appendReady = function () {
      this.appendItems(items, fragment);
      this.isLoading = false;
      this.dispatchEvent('append', null, [response, path, items]);
    }.bind(this);

    if (this.options.outlayer) {
      this.appendOutlayerItems(fragment, appendReady);
    } else {
      appendReady();
    }
  };

  proto.appendItems = function (items, fragment) {
    if (!items || !items.length) {
      return;
    }

    fragment = fragment || getItemsFragment(items);
    refreshScripts(fragment);
    this.element.appendChild(fragment);
  };

  function getItemsFragment(items) {
    var fragment = document.createDocumentFragment();
    for (var i = 0; items && i < items.length; i++) {
      fragment.appendChild(items[i]);
    }
    return fragment;
  }

  function refreshScripts(fragment) {
    var scripts = fragment.querySelectorAll('script');
    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i];
      var freshScript = document.createElement('script');
      copyAttributes(script, freshScript);
      script.parentNode.replaceChild(freshScript, script);
    }
  }

  function copyAttributes(fromNode, toNode) {
    var attrs = fromNode.attributes;
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      toNode.setAttribute(attr.name, attr.value);
    }
  }

  proto.appendOutlayerItems = function (fragment, appendReady) {
    var imagesLoaded = InfiniteScroll.imagesLoaded || window.imagesLoaded;
    if (!imagesLoaded) {
      console.error('[InfiniteScroll] imagesLoaded required for outlayer option');
      this.isLoading = false;
      return;
    }

    imagesLoaded(fragment, appendReady);
  };

  proto.onAppendOutlayer = function (response, path, items) {
    this.options.outlayer.appended(items);
  };

  proto.checkLastPage = function (response, path) {
    var checkLastPage = this.options.checkLastPage;
    if (!checkLastPage) {
      return;
    }

    var pathOpt = this.options.path;

    if (typeof pathOpt == 'function') {
      var nextPath = this.getPath();
      if (!nextPath) {
        this.lastPageReached(response, path);
        return;
      }
    }

    var selector;
    if (typeof checkLastPage == 'string') {
      selector = checkLastPage;
    } else if (this.isPathSelector) {
      selector = pathOpt;
    }

    if (!selector || !response.querySelector) {
      return;
    }

    var nextElem = response.querySelector(selector);
    if (!nextElem) {
      this.lastPageReached(response, path);
    }
  };

  proto.lastPageReached = function (response, path) {
    this.canLoad = false;
    this.dispatchEvent('last', null, [response, path]);
  };

  proto.onPageError = function (error, path) {
    this.isLoading = false;
    this.canLoad = false;
    this.dispatchEvent('error', null, [error, path]);
    return error;
  };

  InfiniteScroll.create.prefill = function () {
    if (!this.options.prefill) {
      return;
    }
    var append = this.options.append;
    if (!append) {
      console.error('append option required for prefill. Set as :' + append);
      return;
    }
    this.updateMeasurements();
    this.updateScroller();
    this.isPrefilling = true;
    this.on('append', this.prefill);
    this.once('error', this.stopPrefill);
    this.once('last', this.stopPrefill);
    this.prefill();
  };

  proto.prefill = function () {
    var distance = this.getPrefillDistance();
    this.isPrefilling = distance >= 0;
    if (this.isPrefilling) {
      this.log('prefill');
      this.loadNextPage();
    } else {
      this.stopPrefill();
    }
  };

  proto.getPrefillDistance = function () {
    if (this.options.elementScroll) {
      return this.scroller.clientHeight - this.scroller.scrollHeight;
    }

    return this.windowHeight - this.element.clientHeight;
  };

  proto.stopPrefill = function () {
    console.log('stopping prefill');
    this.off('append', this.prefill);
  };

  function request(url, responseType, onLoad, onError) {
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.responseType = responseType || '';

    req.onload = function () {
      if (req.status == 200) {
        onLoad(req.response);
      } else {
        var error = new Error(req.statusText);
        onError(error);
      }
    };

    req.onerror = function () {
      var error = new Error('Network error requesting ' + url);
      onError(error);
    };

    req.send();
  }

  return InfiniteScroll;
});

(function (window, factory) {
  if (typeof define == 'function' && define.amd) {
    define('infinite-scroll/js/scroll-watch', ['./core', 'fizzy-ui-utils/utils'], function (InfiniteScroll, utils) {
      return factory(window, InfiniteScroll, utils);
    });
  } else if (typeof module == 'object' && module.exports) {
    module.exports = factory(window, require('./core'), require('fizzy-ui-utils'));
  } else {
    factory(window, window.InfiniteScroll, window.fizzyUIUtils);
  }
})(window, function factory(window, InfiniteScroll, utils) {

  var proto = InfiniteScroll.prototype;

  InfiniteScroll.defaults.scrollThreshold = 400;


  InfiniteScroll.create.scrollWatch = function () {
    this.pageScrollHandler = this.onPageScroll.bind(this);
    this.resizeHandler = this.onResize.bind(this);

    var scrollThreshold = this.options.scrollThreshold;
    var isEnable = scrollThreshold || scrollThreshold === 0;
    if (isEnable) {
      this.enableScrollWatch();
    }
  };

  InfiniteScroll.destroy.scrollWatch = function () {
    this.disableScrollWatch();
  };

  proto.enableScrollWatch = function () {
    if (this.isScrollWatching) {
      return;
    }
    this.isScrollWatching = true;
    this.updateMeasurements();
    this.updateScroller();

    this.on('last', this.disableScrollWatch);
    this.bindScrollWatchEvents(true);
  };

  proto.disableScrollWatch = function () {
    if (!this.isScrollWatching) {
      return;
    }
    this.bindScrollWatchEvents(false);
    delete this.isScrollWatching;
  };

  proto.bindScrollWatchEvents = function (isBind) {
    var addRemove = isBind ? 'addEventListener' : 'removeEventListener';
    this.scroller[addRemove]('scroll', this.pageScrollHandler);
    window[addRemove]('resize', this.resizeHandler);
  };

  proto.onPageScroll = InfiniteScroll.throttle(function () {
    var distance = this.getBottomDistance();
    if (distance <= this.options.scrollThreshold) {
      this.dispatchEvent('scrollThreshold');
    }
  });

  proto.getBottomDistance = function () {
    if (this.options.elementScroll) {
      return this.getElementBottomDistance();
    } else {
      return this.getWindowBottomDistance();
    }
  };

  proto.getWindowBottomDistance = function () {
    var bottom = this.top + this.element.clientHeight;
    var scrollY = window.pageYOffset + this.windowHeight;
    return bottom - scrollY;
  };

  proto.getElementBottomDistance = function () {
    var bottom = this.scroller.scrollHeight;
    var scrollY = this.scroller.scrollTop + this.scroller.clientHeight;
    return bottom - scrollY;
  };

  proto.onResize = function () {
    this.updateMeasurements();
  };

  utils.debounceMethod(InfiniteScroll, 'onResize', 150);

  return InfiniteScroll;
});

(function (window, factory) {
  if (typeof define == 'function' && define.amd) {
    define('infinite-scroll/js/history', ['./core', 'fizzy-ui-utils/utils'], function (InfiniteScroll, utils) {
      return factory(window, InfiniteScroll, utils);
    });
  } else if (typeof module == 'object' && module.exports) {
    module.exports = factory(window, require('./core'), require('fizzy-ui-utils'));
  } else {
    factory(window, window.InfiniteScroll, window.fizzyUIUtils);
  }
})(window, function factory(window, InfiniteScroll, utils) {

  var proto = InfiniteScroll.prototype;

  InfiniteScroll.defaults.history = 'replace';


  var link = document.createElement('a');

  InfiniteScroll.create.history = function () {
    if (!this.options.history) {
      return;
    }

    link.href = this.getAbsolutePath();

    var linkOrigin = link.origin || link.protocol + '//' + link.host;
    var isSameOrigin = linkOrigin == location.origin;
    if (!isSameOrigin) {
      console.error('[InfiniteScroll] cannot set history with different origin: ' + link.origin + ' on ' + location.origin + ' . History behavior disabled.');
      return;
    }

    if (this.options.append) {
      this.createHistoryAppend();
    } else {
      this.createHistoryPageLoad();
    }
  };

  proto.createHistoryAppend = function () {
    this.updateMeasurements();
    this.updateScroller();

    this.scrollPages = [{
      top: 0,
      path: location.href,
      title: document.title
    }];
    this.scrollPageIndex = 0;

    this.scrollHistoryHandler = this.onScrollHistory.bind(this);
    this.unloadHandler = this.onUnload.bind(this);
    this.scroller.addEventListener('scroll', this.scrollHistoryHandler);
    this.on('append', this.onAppendHistory);
    this.bindHistoryAppendEvents(true);
  };

  proto.bindHistoryAppendEvents = function (isBind) {
    var addRemove = isBind ? 'addEventListener' : 'removeEventListener';
    this.scroller[addRemove]('scroll', this.scrollHistoryHandler);
    window[addRemove]('unload', this.unloadHandler);
  };

  proto.createHistoryPageLoad = function () {
    this.on('load', this.onPageLoadHistory);
  };

  InfiniteScroll.destroy.history = proto.destroyHistory = function () {
    var isHistoryAppend = this.options.history && this.options.append;
    if (isHistoryAppend) {
      this.bindHistoryAppendEvents(false);
    }
  };

  proto.onAppendHistory = function (response, path, items) {
    var firstItem = items[0];
    var elemScrollY = this.getElementScrollY(firstItem);

    link.href = path;

    this.scrollPages.push({
      top: elemScrollY,
      path: link.href,
      title: response.title
    });
  };

  proto.getElementScrollY = function (elem) {
    if (this.options.elementScroll) {
      return this.getElementElementScrollY(elem);
    } else {
      return this.getElementWindowScrollY(elem);
    }
  };

  proto.getElementWindowScrollY = function (elem) {
    var rect = elem.getBoundingClientRect();
    return rect.top + window.pageYOffset;
  };

  proto.getElementElementScrollY = function (elem) {
    return elem.offsetTop - this.top;
  };

  proto.onScrollHistory = function () {
    var scrollViewY = this.getScrollViewY();
    var pageIndex, page;
    for (var i = 0; i < this.scrollPages.length; i++) {
      var scrollPage = this.scrollPages[i];
      if (scrollPage.top >= scrollViewY) {
        break;
      }
      pageIndex = i;
      page = scrollPage;
    }

    if (pageIndex != this.scrollPageIndex) {
      this.scrollPageIndex = pageIndex;
      this.setHistory(page.title, page.path);
    }
  };

  utils.debounceMethod(InfiniteScroll, 'onScrollHistory', 150);

  proto.getScrollViewY = function () {
    if (this.options.elementScroll) {
      return this.scroller.scrollTop + this.scroller.clientHeight / 2;
    } else {
      return window.pageYOffset + this.windowHeight / 2;
    }
  };

  proto.setHistory = function (title, path) {
    var optHistory = this.options.history;
    var historyMethod = optHistory && history[optHistory + 'State'];
    if (!historyMethod) {
      return;
    }

    history[optHistory + 'State'](null, title, path);

    if (this.options.historyTitle) {
      document.title = title;
    }

    this.dispatchEvent('history', null, [title, path]);
  };

  proto.onUnload = function () {
    var pageIndex = this.scrollPageIndex;
    if (pageIndex === 0) {
      return;
    }

    var scrollPage = this.scrollPages[pageIndex];
    var scrollY = window.pageYOffset - scrollPage.top + this.top;

    this.destroyHistory();
    scrollTo(0, scrollY);
  };

  proto.onPageLoadHistory = function (response, path) {
    this.setHistory(response.title, path);
  };

  return InfiniteScroll;
});

(function (window, factory) {
  if (typeof define == 'function' && define.amd) {
    define('infinite-scroll/js/button', ['./core', 'fizzy-ui-utils/utils'], function (InfiniteScroll, utils) {
      return factory(window, InfiniteScroll, utils);
    });
  } else if (typeof module == 'object' && module.exports) {
    module.exports = factory(window, require('./core'), require('fizzy-ui-utils'));
  } else {
    factory(window, window.InfiniteScroll, window.fizzyUIUtils);
  }
})(window, function factory(window, InfiniteScroll, utils) {

  InfiniteScroll.create.button = function () {
    var buttonElem = utils.getQueryElement(this.options.button);
    if (buttonElem) {
      this.button = new InfiniteScrollButton(buttonElem, this);
      return;
    }
  };

  InfiniteScroll.destroy.button = function () {
    if (this.button) {
      this.button.destroy();
    }
  };

  function InfiniteScrollButton(element, infScroll) {
    this.element = element;
    this.infScroll = infScroll;

    this.clickHandler = this.onClick.bind(this);
    this.element.addEventListener('click', this.clickHandler);
    infScroll.on('request', this.disable.bind(this));
    infScroll.on('load', this.enable.bind(this));
    infScroll.on('error', this.hide.bind(this));
    infScroll.on('last', this.hide.bind(this));
  }

  InfiniteScrollButton.prototype.onClick = function (event) {
    event.preventDefault();
    this.infScroll.loadNextPage();
  };

  InfiniteScrollButton.prototype.enable = function () {
    this.element.removeAttribute('disabled');
  };

  InfiniteScrollButton.prototype.disable = function () {
    this.element.disabled = 'disabled';
  };

  InfiniteScrollButton.prototype.hide = function () {
    this.element.style.display = 'none';
  };

  InfiniteScrollButton.prototype.destroy = function () {
    this.element.removeEventListener(this.clickHandler);
  };

  InfiniteScroll.Button = InfiniteScrollButton;

  return InfiniteScroll;
});

(function (window, factory) {
  if (typeof define == 'function' && define.amd) {
    define('infinite-scroll/js/status', ['./core', 'fizzy-ui-utils/utils'], function (InfiniteScroll, utils) {
      return factory(window, InfiniteScroll, utils);
    });
  } else if (typeof module == 'object' && module.exports) {
    module.exports = factory(window, require('./core'), require('fizzy-ui-utils'));
  } else {
    factory(window, window.InfiniteScroll, window.fizzyUIUtils);
  }
})(window, function factory(window, InfiniteScroll, utils) {

  var proto = InfiniteScroll.prototype;

  InfiniteScroll.create.status = function () {
    var statusElem = utils.getQueryElement(this.options.status);
    if (!statusElem) {
      return;
    }

    this.statusElement = statusElem;
    this.statusEventElements = {
      request: statusElem.querySelector('.infinite-scroll-request'),
      error: statusElem.querySelector('.infinite-scroll-error'),
      last: statusElem.querySelector('.infinite-scroll-last')
    };

    this.on('request', this.showRequestStatus);
    this.on('error', this.showErrorStatus);
    this.on('last', this.showLastStatus);
    var hideEvent = this.options.append ? 'append' : 'load';
    this.on(hideEvent, this.hideAllStatus);
  };

  proto.showRequestStatus = function () {
    this.showStatus('request');
  };

  proto.showErrorStatus = function () {
    this.showStatus('error');
  };

  proto.showLastStatus = function () {
    this.showStatus('last');
  };

  proto.showStatus = function (eventName) {
    show(this.statusElement);
    this.hideStatusEventElements();
    var eventElem = this.statusEventElements[eventName];
    show(eventElem);
  };

  proto.hideAllStatus = function () {
    hide(this.statusElement);
    this.hideStatusEventElements();
  };

  proto.hideStatusEventElements = function () {
    for (var type in this.statusEventElements) {
      var eventElem = this.statusEventElements[type];
      hide(eventElem);
    }
  };

  function hide(elem) {
    setDisplay(elem, 'none');
  }

  function show(elem) {
    setDisplay(elem, 'block');
  }

  function setDisplay(elem, value) {
    if (elem) {
      elem.style.display = value;
    }
  }

  return InfiniteScroll;
});

(function (window, factory) {
  if (typeof define == 'function' && define.amd) {
    define(['infinite-scroll/js/core', 'infinite-scroll/js/page-load', 'infinite-scroll/js/scroll-watch', 'infinite-scroll/js/history', 'infinite-scroll/js/button', 'infinite-scroll/js/status'], factory);
  } else if (typeof module == 'object' && module.exports) {
    module.exports = factory(require('./core'), require('./page-load'), require('./scroll-watch'), require('./history'), require('./button'), require('./status'));
  }
})(window, function factory(InfiniteScroll) {
  return InfiniteScroll;
});

(function (window, factory) {
  'use strict';

  if (typeof define == 'function' && define.amd) {
    define('imagesloaded/imagesloaded', ['ev-emitter/ev-emitter'], function (EvEmitter) {
      return factory(window, EvEmitter);
    });
  } else if (typeof module == 'object' && module.exports) {
    module.exports = factory(window, require('ev-emitter'));
  } else {
    window.imagesLoaded = factory(window, window.EvEmitter);
  }
})(typeof window !== 'undefined' ? window : this, function factory(window, EvEmitter) {

  var $ = window.jQuery;
  var console = window.console;

  function extend(a, b) {
    for (var prop in b) {
      a[prop] = b[prop];
    }
    return a;
  }

  function makeArray(obj) {
    var ary = [];
    if (Array.isArray(obj)) {
      ary = obj;
    } else if (typeof obj.length == 'number') {
      for (var i = 0; i < obj.length; i++) {
        ary.push(obj[i]);
      }
    } else {
      ary.push(obj);
    }
    return ary;
  }

  function ImagesLoaded(elem, options, onAlways) {
    if (!(this instanceof ImagesLoaded)) {
      return new ImagesLoaded(elem, options, onAlways);
    }

    if (typeof elem == 'string') {
      elem = document.querySelectorAll(elem);
    }

    this.elements = makeArray(elem);
    this.options = extend({}, this.options);

    if (typeof options == 'function') {
      onAlways = options;
    } else {
      extend(this.options, options);
    }

    if (onAlways) {
      this.on('always', onAlways);
    }

    this.getImages();

    if ($) {
      this.jqDeferred = new $.Deferred();
    }

    setTimeout(function () {
      this.check();
    }.bind(this));
  }

  ImagesLoaded.prototype = Object.create(EvEmitter.prototype);

  ImagesLoaded.prototype.options = {};

  ImagesLoaded.prototype.getImages = function () {
    this.images = [];

    this.elements.forEach(this.addElementImages, this);
  };

  ImagesLoaded.prototype.addElementImages = function (elem) {
    if (elem.nodeName == 'IMG') {
      this.addImage(elem);
    }

    if (this.options.background === true) {
      this.addElementBackgroundImages(elem);
    }

    var nodeType = elem.nodeType;
    if (!nodeType || !elementNodeTypes[nodeType]) {
      return;
    }
    var childImgs = elem.querySelectorAll('img');

    for (var i = 0; i < childImgs.length; i++) {
      var img = childImgs[i];
      this.addImage(img);
    }

    if (typeof this.options.background == 'string') {
      var children = elem.querySelectorAll(this.options.background);
      for (i = 0; i < children.length; i++) {
        var child = children[i];
        this.addElementBackgroundImages(child);
      }
    }
  };

  var elementNodeTypes = {
    1: true,
    9: true,
    11: true
  };

  ImagesLoaded.prototype.addElementBackgroundImages = function (elem) {
    var style = getComputedStyle(elem);
    if (!style) {
      return;
    }

    var reURL = /url\((['"])?(.*?)\1\)/gi;
    var matches = reURL.exec(style.backgroundImage);
    while (matches !== null) {
      var url = matches && matches[2];
      if (url) {
        this.addBackground(url, elem);
      }
      matches = reURL.exec(style.backgroundImage);
    }
  };

  ImagesLoaded.prototype.addImage = function (img) {
    var loadingImage = new LoadingImage(img);
    this.images.push(loadingImage);
  };

  ImagesLoaded.prototype.addBackground = function (url, elem) {
    var background = new Background(url, elem);
    this.images.push(background);
  };

  ImagesLoaded.prototype.check = function () {
    var _this = this;
    this.progressedCount = 0;
    this.hasAnyBroken = false;

    if (!this.images.length) {
      this.complete();
      return;
    }

    function onProgress(image, elem, message) {
      setTimeout(function () {
        _this.progress(image, elem, message);
      });
    }

    this.images.forEach(function (loadingImage) {
      loadingImage.once('progress', onProgress);
      loadingImage.check();
    });
  };

  ImagesLoaded.prototype.progress = function (image, elem, message) {
    this.progressedCount++;
    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;

    this.emitEvent('progress', [this, image, elem]);
    if (this.jqDeferred && this.jqDeferred.notify) {
      this.jqDeferred.notify(this, image);
    }

    if (this.progressedCount == this.images.length) {
      this.complete();
    }

    if (this.options.debug && console) {
      console.log('progress: ' + message, image, elem);
    }
  };

  ImagesLoaded.prototype.complete = function () {
    var eventName = this.hasAnyBroken ? 'fail' : 'done';
    this.isComplete = true;
    this.emitEvent(eventName, [this]);
    this.emitEvent('always', [this]);
    if (this.jqDeferred) {
      var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
      this.jqDeferred[jqMethod](this);
    }
  };

  function LoadingImage(img) {
    this.img = img;
  }

  LoadingImage.prototype = Object.create(EvEmitter.prototype);

  LoadingImage.prototype.check = function () {
    var isComplete = this.getIsImageComplete();
    if (isComplete) {
      this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
      return;
    }

    this.proxyImage = new Image();
    this.proxyImage.addEventListener('load', this);
    this.proxyImage.addEventListener('error', this);

    this.img.addEventListener('load', this);
    this.img.addEventListener('error', this);
    this.proxyImage.src = this.img.src;
  };

  LoadingImage.prototype.getIsImageComplete = function () {
    return this.img.complete && this.img.naturalWidth !== undefined;
  };

  LoadingImage.prototype.confirm = function (isLoaded, message) {
    this.isLoaded = isLoaded;
    this.emitEvent('progress', [this, this.img, message]);
  };

  LoadingImage.prototype.handleEvent = function (event) {
    var method = 'on' + event.type;
    if (this[method]) {
      this[method](event);
    }
  };

  LoadingImage.prototype.onload = function () {
    this.confirm(true, 'onload');
    this.unbindEvents();
  };

  LoadingImage.prototype.onerror = function () {
    this.confirm(false, 'onerror');
    this.unbindEvents();
  };

  LoadingImage.prototype.unbindEvents = function () {
    this.proxyImage.removeEventListener('load', this);
    this.proxyImage.removeEventListener('error', this);
    this.img.removeEventListener('load', this);
    this.img.removeEventListener('error', this);
  };

  function Background(url, element) {
    this.url = url;
    this.element = element;
    this.img = new Image();
  }

  Background.prototype = Object.create(LoadingImage.prototype);

  Background.prototype.check = function () {
    this.img.addEventListener('load', this);
    this.img.addEventListener('error', this);
    this.img.src = this.url;

    var isComplete = this.getIsImageComplete();
    if (isComplete) {
      this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
      this.unbindEvents();
    }
  };

  Background.prototype.unbindEvents = function () {
    this.img.removeEventListener('load', this);
    this.img.removeEventListener('error', this);
  };

  Background.prototype.confirm = function (isLoaded, message) {
    this.isLoaded = isLoaded;
    this.emitEvent('progress', [this, this.element, message]);
  };

  ImagesLoaded.makeJQueryPlugin = function (jQuery) {
    jQuery = jQuery || window.jQuery;
    if (!jQuery) {
      return;
    }

    $ = jQuery;

    $.fn.imagesLoaded = function (options, callback) {
      var instance = new ImagesLoaded(this, options, callback);
      return instance.jqDeferred.promise($(this));
    };
  };

  ImagesLoaded.makeJQueryPlugin();

  return ImagesLoaded;
});

;(function (factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
})(function ($) {

  var _previousResizeWidth = -1,
      _updateTimeout = -1;

  var _parse = function (value) {
    return parseFloat(value) || 0;
  };

  var _rows = function (elements) {
    var tolerance = 1,
        $elements = $(elements),
        lastTop = null,
        rows = [];

    $elements.each(function () {
      var $that = $(this),
          top = $that.offset().top - _parse($that.css('margin-top')),
          lastRow = rows.length > 0 ? rows[rows.length - 1] : null;

      if (lastRow === null) {
        rows.push($that);
      } else {
        if (Math.floor(Math.abs(lastTop - top)) <= tolerance) {
          rows[rows.length - 1] = lastRow.add($that);
        } else {
          rows.push($that);
        }
      }

      lastTop = top;
    });

    return rows;
  };

  var _parseOptions = function (options) {
    var opts = {
      byRow: true,
      property: 'height',
      target: null,
      remove: false
    };

    if (typeof options === 'object') {
      return $.extend(opts, options);
    }

    if (typeof options === 'boolean') {
      opts.byRow = options;
    } else if (options === 'remove') {
      opts.remove = true;
    }

    return opts;
  };

  var matchHeight = $.fn.matchHeight = function (options) {
    var opts = _parseOptions(options);

    if (opts.remove) {
      var that = this;

      this.css(opts.property, '');

      $.each(matchHeight._groups, function (key, group) {
        group.elements = group.elements.not(that);
      });

      return this;
    }

    if (this.length <= 1 && !opts.target) {
      return this;
    }

    matchHeight._groups.push({
      elements: this,
      options: opts
    });

    matchHeight._apply(this, opts);

    return this;
  };

  matchHeight.version = '0.7.2';
  matchHeight._groups = [];
  matchHeight._throttle = 80;
  matchHeight._maintainScroll = false;
  matchHeight._beforeUpdate = null;
  matchHeight._afterUpdate = null;
  matchHeight._rows = _rows;
  matchHeight._parse = _parse;
  matchHeight._parseOptions = _parseOptions;

  matchHeight._apply = function (elements, options) {
    var opts = _parseOptions(options),
        $elements = $(elements),
        rows = [$elements];

    var scrollTop = $(window).scrollTop(),
        htmlHeight = $('html').outerHeight(true);

    var $hiddenParents = $elements.parents().filter(':hidden');

    $hiddenParents.each(function () {
      var $that = $(this);
      $that.data('style-cache', $that.attr('style'));
    });

    $hiddenParents.css('display', 'block');

    if (opts.byRow && !opts.target) {
      $elements.each(function () {
        var $that = $(this),
            display = $that.css('display');

        if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
          display = 'block';
        }

        $that.data('style-cache', $that.attr('style'));

        $that.css({
          'display': display,
          'padding-top': '0',
          'padding-bottom': '0',
          'margin-top': '0',
          'margin-bottom': '0',
          'border-top-width': '0',
          'border-bottom-width': '0',
          'height': '100px',
          'overflow': 'hidden'
        });
      });

      rows = _rows($elements);

      $elements.each(function () {
        var $that = $(this);
        $that.attr('style', $that.data('style-cache') || '');
      });
    }

    $.each(rows, function (key, row) {
      var $row = $(row),
          targetHeight = 0;

      if (!opts.target) {
        if (opts.byRow && $row.length <= 1) {
          $row.css(opts.property, '');
          return;
        }

        $row.each(function () {
          var $that = $(this),
              style = $that.attr('style'),
              display = $that.css('display');

          if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
            display = 'block';
          }

          var css = { 'display': display };
          css[opts.property] = '';
          $that.css(css);

          if ($that.outerHeight(false) > targetHeight) {
            targetHeight = $that.outerHeight(false);
          }

          if (style) {
            $that.attr('style', style);
          } else {
            $that.css('display', '');
          }
        });
      } else {
        targetHeight = opts.target.outerHeight(false);
      }

      $row.each(function () {
        var $that = $(this),
            verticalPadding = 0;

        if (opts.target && $that.is(opts.target)) {
          return;
        }

        if ($that.css('box-sizing') !== 'border-box') {
          verticalPadding += _parse($that.css('border-top-width')) + _parse($that.css('border-bottom-width'));
          verticalPadding += _parse($that.css('padding-top')) + _parse($that.css('padding-bottom'));
        }

        $that.css(opts.property, targetHeight - verticalPadding + 'px');
      });
    });

    $hiddenParents.each(function () {
      var $that = $(this);
      $that.attr('style', $that.data('style-cache') || null);
    });

    if (matchHeight._maintainScroll) {
      $(window).scrollTop(scrollTop / htmlHeight * $('html').outerHeight(true));
    }

    return this;
  };

  matchHeight._applyDataApi = function () {
    var groups = {};

    $('[data-match-height], [data-mh]').each(function () {
      var $this = $(this),
          groupId = $this.attr('data-mh') || $this.attr('data-match-height');

      if (groupId in groups) {
        groups[groupId] = groups[groupId].add($this);
      } else {
        groups[groupId] = $this;
      }
    });

    $.each(groups, function () {
      this.matchHeight(true);
    });
  };

  var _update = function (event) {
    if (matchHeight._beforeUpdate) {
      matchHeight._beforeUpdate(event, matchHeight._groups);
    }

    $.each(matchHeight._groups, function () {
      matchHeight._apply(this.elements, this.options);
    });

    if (matchHeight._afterUpdate) {
      matchHeight._afterUpdate(event, matchHeight._groups);
    }
  };

  matchHeight._update = function (throttle, event) {
    if (event && event.type === 'resize') {
      var windowWidth = $(window).width();
      if (windowWidth === _previousResizeWidth) {
        return;
      }
      _previousResizeWidth = windowWidth;
    }

    if (!throttle) {
      _update(event);
    } else if (_updateTimeout === -1) {
      _updateTimeout = setTimeout(function () {
        _update(event);
        _updateTimeout = -1;
      }, matchHeight._throttle);
    }
  };

  $(matchHeight._applyDataApi);

  var on = $.fn.on ? 'on' : 'bind';

  $(window)[on]('load', function (event) {
    matchHeight._update(false, event);
  });

  $(window)[on]('resize orientationchange', function (event) {
    matchHeight._update(true, event);
  });
});

;(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    factory(require('jquery'));
  } else {
    factory(window.jQuery || window.Zepto);
  }
})(function ($) {
  var CLOSE_EVENT = 'Close',
      BEFORE_CLOSE_EVENT = 'BeforeClose',
      AFTER_CLOSE_EVENT = 'AfterClose',
      BEFORE_APPEND_EVENT = 'BeforeAppend',
      MARKUP_PARSE_EVENT = 'MarkupParse',
      OPEN_EVENT = 'Open',
      CHANGE_EVENT = 'Change',
      NS = 'mfp',
      EVENT_NS = '.' + NS,
      READY_CLASS = 'mfp-ready',
      REMOVING_CLASS = 'mfp-removing',
      PREVENT_CLOSE_CLASS = 'mfp-prevent-close';

  var mfp,
      MagnificPopup = function () {},
      _isJQ = !!window.jQuery,
      _prevStatus,
      _window = $(window),
      _document,
      _prevContentType,
      _wrapClasses,
      _currPopupType;

  var _mfpOn = function (name, f) {
    mfp.ev.on(NS + name + EVENT_NS, f);
  },
      _getEl = function (className, appendTo, html, raw) {
    var el = document.createElement('div');
    el.className = 'mfp-' + className;
    if (html) {
      el.innerHTML = html;
    }
    if (!raw) {
      el = $(el);
      if (appendTo) {
        el.appendTo(appendTo);
      }
    } else if (appendTo) {
      appendTo.appendChild(el);
    }
    return el;
  },
      _mfpTrigger = function (e, data) {
    mfp.ev.triggerHandler(NS + e, data);

    if (mfp.st.callbacks) {
      e = e.charAt(0).toLowerCase() + e.slice(1);
      if (mfp.st.callbacks[e]) {
        mfp.st.callbacks[e].apply(mfp, $.isArray(data) ? data : [data]);
      }
    }
  },
      _getCloseBtn = function (type) {
    if (type !== _currPopupType || !mfp.currTemplate.closeBtn) {
      mfp.currTemplate.closeBtn = $(mfp.st.closeMarkup.replace('%title%', mfp.st.tClose));
      _currPopupType = type;
    }
    return mfp.currTemplate.closeBtn;
  },
      _checkInstance = function () {
    if (!$.magnificPopup.instance) {
      mfp = new MagnificPopup();
      mfp.init();
      $.magnificPopup.instance = mfp;
    }
  },
      supportsTransitions = function () {
    var s = document.createElement('p').style,
        v = ['ms', 'O', 'Moz', 'Webkit'];

    if (s['transition'] !== undefined) {
      return true;
    }

    while (v.length) {
      if (v.pop() + 'Transition' in s) {
        return true;
      }
    }

    return false;
  };

  MagnificPopup.prototype = {

    constructor: MagnificPopup,

    init: function () {
      var appVersion = navigator.appVersion;
      mfp.isLowIE = mfp.isIE8 = document.all && !document.addEventListener;
      mfp.isAndroid = /android/gi.test(appVersion);
      mfp.isIOS = /iphone|ipad|ipod/gi.test(appVersion);
      mfp.supportsTransition = supportsTransitions();

      mfp.probablyMobile = mfp.isAndroid || mfp.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent);
      _document = $(document);

      mfp.popupsCache = {};
    },

    open: function (data) {

      var i;

      if (data.isObj === false) {
        mfp.items = data.items.toArray();

        mfp.index = 0;
        var items = data.items,
            item;
        for (i = 0; i < items.length; i++) {
          item = items[i];
          if (item.parsed) {
            item = item.el[0];
          }
          if (item === data.el[0]) {
            mfp.index = i;
            break;
          }
        }
      } else {
        mfp.items = $.isArray(data.items) ? data.items : [data.items];
        mfp.index = data.index || 0;
      }

      if (mfp.isOpen) {
        mfp.updateItemHTML();
        return;
      }

      mfp.types = [];
      _wrapClasses = '';
      if (data.mainEl && data.mainEl.length) {
        mfp.ev = data.mainEl.eq(0);
      } else {
        mfp.ev = _document;
      }

      if (data.key) {
        if (!mfp.popupsCache[data.key]) {
          mfp.popupsCache[data.key] = {};
        }
        mfp.currTemplate = mfp.popupsCache[data.key];
      } else {
        mfp.currTemplate = {};
      }

      mfp.st = $.extend(true, {}, $.magnificPopup.defaults, data);
      mfp.fixedContentPos = mfp.st.fixedContentPos === 'auto' ? !mfp.probablyMobile : mfp.st.fixedContentPos;

      if (mfp.st.modal) {
        mfp.st.closeOnContentClick = false;
        mfp.st.closeOnBgClick = false;
        mfp.st.showCloseBtn = false;
        mfp.st.enableEscapeKey = false;
      }

      if (!mfp.bgOverlay) {
        mfp.bgOverlay = _getEl('bg').on('click' + EVENT_NS, function () {
          mfp.close();
        });

        mfp.wrap = _getEl('wrap').attr('tabindex', -1).on('click' + EVENT_NS, function (e) {
          if (mfp._checkIfClose(e.target)) {
            mfp.close();
          }
        });

        mfp.container = _getEl('container', mfp.wrap);
      }

      mfp.contentContainer = _getEl('content');
      if (mfp.st.preloader) {
        mfp.preloader = _getEl('preloader', mfp.container, mfp.st.tLoading);
      }

      var modules = $.magnificPopup.modules;
      for (i = 0; i < modules.length; i++) {
        var n = modules[i];
        n = n.charAt(0).toUpperCase() + n.slice(1);
        mfp['init' + n].call(mfp);
      }
      _mfpTrigger('BeforeOpen');

      if (mfp.st.showCloseBtn) {
        if (!mfp.st.closeBtnInside) {
          mfp.wrap.append(_getCloseBtn());
        } else {
          _mfpOn(MARKUP_PARSE_EVENT, function (e, template, values, item) {
            values.close_replaceWith = _getCloseBtn(item.type);
          });
          _wrapClasses += ' mfp-close-btn-in';
        }
      }

      if (mfp.st.alignTop) {
        _wrapClasses += ' mfp-align-top';
      }

      if (mfp.fixedContentPos) {
        mfp.wrap.css({
          overflow: mfp.st.overflowY,
          overflowX: 'hidden',
          overflowY: mfp.st.overflowY
        });
      } else {
        mfp.wrap.css({
          top: _window.scrollTop(),
          position: 'absolute'
        });
      }
      if (mfp.st.fixedBgPos === false || mfp.st.fixedBgPos === 'auto' && !mfp.fixedContentPos) {
        mfp.bgOverlay.css({
          height: _document.height(),
          position: 'absolute'
        });
      }

      if (mfp.st.enableEscapeKey) {
        _document.on('keyup' + EVENT_NS, function (e) {
          if (e.keyCode === 27) {
            mfp.close();
          }
        });
      }

      _window.on('resize' + EVENT_NS, function () {
        mfp.updateSize();
      });

      if (!mfp.st.closeOnContentClick) {
        _wrapClasses += ' mfp-auto-cursor';
      }

      if (_wrapClasses) mfp.wrap.addClass(_wrapClasses);

      var windowHeight = mfp.wH = _window.height();

      var windowStyles = {};

      if (mfp.fixedContentPos) {
        if (mfp._hasScrollBar(windowHeight)) {
          var s = mfp._getScrollbarSize();
          if (s) {
            windowStyles.marginRight = s;
          }
        }
      }

      if (mfp.fixedContentPos) {
        if (!mfp.isIE7) {
          windowStyles.overflow = 'hidden';
        } else {
          $('body, html').css('overflow', 'hidden');
        }
      }

      var classesToadd = mfp.st.mainClass;
      if (mfp.isIE7) {
        classesToadd += ' mfp-ie7';
      }
      if (classesToadd) {
        mfp._addClassToMFP(classesToadd);
      }

      mfp.updateItemHTML();

      _mfpTrigger('BuildControls');

      $('html').css(windowStyles);

      mfp.bgOverlay.add(mfp.wrap).prependTo(mfp.st.prependTo || $(document.body));

      mfp._lastFocusedEl = document.activeElement;

      setTimeout(function () {

        if (mfp.content) {
          mfp._addClassToMFP(READY_CLASS);
          mfp._setFocus();
        } else {
          mfp.bgOverlay.addClass(READY_CLASS);
        }

        _document.on('focusin' + EVENT_NS, mfp._onFocusIn);
      }, 16);

      mfp.isOpen = true;
      mfp.updateSize(windowHeight);
      _mfpTrigger(OPEN_EVENT);

      return data;
    },

    close: function () {
      if (!mfp.isOpen) return;
      _mfpTrigger(BEFORE_CLOSE_EVENT);

      mfp.isOpen = false;

      if (mfp.st.removalDelay && !mfp.isLowIE && mfp.supportsTransition) {
        mfp._addClassToMFP(REMOVING_CLASS);
        setTimeout(function () {
          mfp._close();
        }, mfp.st.removalDelay);
      } else {
        mfp._close();
      }
    },

    _close: function () {
      _mfpTrigger(CLOSE_EVENT);

      var classesToRemove = REMOVING_CLASS + ' ' + READY_CLASS + ' ';

      mfp.bgOverlay.detach();
      mfp.wrap.detach();
      mfp.container.empty();

      if (mfp.st.mainClass) {
        classesToRemove += mfp.st.mainClass + ' ';
      }

      mfp._removeClassFromMFP(classesToRemove);

      if (mfp.fixedContentPos) {
        var windowStyles = { marginRight: '' };
        if (mfp.isIE7) {
          $('body, html').css('overflow', '');
        } else {
          windowStyles.overflow = '';
        }
        $('html').css(windowStyles);
      }

      _document.off('keyup' + EVENT_NS + ' focusin' + EVENT_NS);
      mfp.ev.off(EVENT_NS);

      mfp.wrap.attr('class', 'mfp-wrap').removeAttr('style');
      mfp.bgOverlay.attr('class', 'mfp-bg');
      mfp.container.attr('class', 'mfp-container');

      if (mfp.st.showCloseBtn && (!mfp.st.closeBtnInside || mfp.currTemplate[mfp.currItem.type] === true)) {
        if (mfp.currTemplate.closeBtn) mfp.currTemplate.closeBtn.detach();
      }

      if (mfp.st.autoFocusLast && mfp._lastFocusedEl) {
        $(mfp._lastFocusedEl).focus();
      }
      mfp.currItem = null;
      mfp.content = null;
      mfp.currTemplate = null;
      mfp.prevHeight = 0;

      _mfpTrigger(AFTER_CLOSE_EVENT);
    },

    updateSize: function (winHeight) {

      if (mfp.isIOS) {
        var zoomLevel = document.documentElement.clientWidth / window.innerWidth;
        var height = window.innerHeight * zoomLevel;
        mfp.wrap.css('height', height);
        mfp.wH = height;
      } else {
        mfp.wH = winHeight || _window.height();
      }

      if (!mfp.fixedContentPos) {
        mfp.wrap.css('height', mfp.wH);
      }

      _mfpTrigger('Resize');
    },

    updateItemHTML: function () {
      var item = mfp.items[mfp.index];

      mfp.contentContainer.detach();

      if (mfp.content) mfp.content.detach();

      if (!item.parsed) {
        item = mfp.parseEl(mfp.index);
      }

      var type = item.type;

      _mfpTrigger('BeforeChange', [mfp.currItem ? mfp.currItem.type : '', type]);


      mfp.currItem = item;

      if (!mfp.currTemplate[type]) {
        var markup = mfp.st[type] ? mfp.st[type].markup : false;

        _mfpTrigger('FirstMarkupParse', markup);

        if (markup) {
          mfp.currTemplate[type] = $(markup);
        } else {
          mfp.currTemplate[type] = true;
        }
      }

      if (_prevContentType && _prevContentType !== item.type) {
        mfp.container.removeClass('mfp-' + _prevContentType + '-holder');
      }

      var newContent = mfp['get' + type.charAt(0).toUpperCase() + type.slice(1)](item, mfp.currTemplate[type]);
      mfp.appendContent(newContent, type);

      item.preloaded = true;

      _mfpTrigger(CHANGE_EVENT, item);
      _prevContentType = item.type;

      mfp.container.prepend(mfp.contentContainer);

      _mfpTrigger('AfterChange');
    },

    appendContent: function (newContent, type) {
      mfp.content = newContent;

      if (newContent) {
        if (mfp.st.showCloseBtn && mfp.st.closeBtnInside && mfp.currTemplate[type] === true) {
          if (!mfp.content.find('.mfp-close').length) {
            mfp.content.append(_getCloseBtn());
          }
        } else {
          mfp.content = newContent;
        }
      } else {
        mfp.content = '';
      }

      _mfpTrigger(BEFORE_APPEND_EVENT);
      mfp.container.addClass('mfp-' + type + '-holder');

      mfp.contentContainer.append(mfp.content);
    },

    parseEl: function (index) {
      var item = mfp.items[index],
          type;

      if (item.tagName) {
        item = { el: $(item) };
      } else {
        type = item.type;
        item = { data: item, src: item.src };
      }

      if (item.el) {
        var types = mfp.types;

        for (var i = 0; i < types.length; i++) {
          if (item.el.hasClass('mfp-' + types[i])) {
            type = types[i];
            break;
          }
        }

        item.src = item.el.attr('data-mfp-src');
        if (!item.src) {
          item.src = item.el.attr('href');
        }
      }

      item.type = type || mfp.st.type || 'inline';
      item.index = index;
      item.parsed = true;
      mfp.items[index] = item;
      _mfpTrigger('ElementParse', item);

      return mfp.items[index];
    },

    addGroup: function (el, options) {
      var eHandler = function (e) {
        e.mfpEl = this;
        mfp._openClick(e, el, options);
      };

      if (!options) {
        options = {};
      }

      var eName = 'click.magnificPopup';
      options.mainEl = el;

      if (options.items) {
        options.isObj = true;
        el.off(eName).on(eName, eHandler);
      } else {
        options.isObj = false;
        if (options.delegate) {
          el.off(eName).on(eName, options.delegate, eHandler);
        } else {
          options.items = el;
          el.off(eName).on(eName, eHandler);
        }
      }
    },
    _openClick: function (e, el, options) {
      var midClick = options.midClick !== undefined ? options.midClick : $.magnificPopup.defaults.midClick;

      if (!midClick && (e.which === 2 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)) {
        return;
      }

      var disableOn = options.disableOn !== undefined ? options.disableOn : $.magnificPopup.defaults.disableOn;

      if (disableOn) {
        if ($.isFunction(disableOn)) {
          if (!disableOn.call(mfp)) {
            return true;
          }
        } else {
          if (_window.width() < disableOn) {
            return true;
          }
        }
      }

      if (e.type) {
        e.preventDefault();

        if (mfp.isOpen) {
          e.stopPropagation();
        }
      }

      options.el = $(e.mfpEl);
      if (options.delegate) {
        options.items = el.find(options.delegate);
      }
      mfp.open(options);
    },

    updateStatus: function (status, text) {

      if (mfp.preloader) {
        if (_prevStatus !== status) {
          mfp.container.removeClass('mfp-s-' + _prevStatus);
        }

        if (!text && status === 'loading') {
          text = mfp.st.tLoading;
        }

        var data = {
          status: status,
          text: text
        };

        _mfpTrigger('UpdateStatus', data);

        status = data.status;
        text = data.text;

        mfp.preloader.html(text);

        mfp.preloader.find('a').on('click', function (e) {
          e.stopImmediatePropagation();
        });

        mfp.container.addClass('mfp-s-' + status);
        _prevStatus = status;
      }
    },

    _checkIfClose: function (target) {

      if ($(target).hasClass(PREVENT_CLOSE_CLASS)) {
        return;
      }

      var closeOnContent = mfp.st.closeOnContentClick;
      var closeOnBg = mfp.st.closeOnBgClick;

      if (closeOnContent && closeOnBg) {
        return true;
      } else {
        if (!mfp.content || $(target).hasClass('mfp-close') || mfp.preloader && target === mfp.preloader[0]) {
          return true;
        }

        if (target !== mfp.content[0] && !$.contains(mfp.content[0], target)) {
          if (closeOnBg) {
            if ($.contains(document, target)) {
              return true;
            }
          }
        } else if (closeOnContent) {
          return true;
        }
      }
      return false;
    },
    _addClassToMFP: function (cName) {
      mfp.bgOverlay.addClass(cName);
      mfp.wrap.addClass(cName);
    },
    _removeClassFromMFP: function (cName) {
      this.bgOverlay.removeClass(cName);
      mfp.wrap.removeClass(cName);
    },
    _hasScrollBar: function (winHeight) {
      return (mfp.isIE7 ? _document.height() : document.body.scrollHeight) > (winHeight || _window.height());
    },
    _setFocus: function () {
      (mfp.st.focus ? mfp.content.find(mfp.st.focus).eq(0) : mfp.wrap).focus();
    },
    _onFocusIn: function (e) {
      if (e.target !== mfp.wrap[0] && !$.contains(mfp.wrap[0], e.target)) {
        mfp._setFocus();
        return false;
      }
    },
    _parseMarkup: function (template, values, item) {
      var arr;
      if (item.data) {
        values = $.extend(item.data, values);
      }
      _mfpTrigger(MARKUP_PARSE_EVENT, [template, values, item]);

      $.each(values, function (key, value) {
        if (value === undefined || value === false) {
          return true;
        }
        arr = key.split('_');
        if (arr.length > 1) {
          var el = template.find(EVENT_NS + '-' + arr[0]);

          if (el.length > 0) {
            var attr = arr[1];
            if (attr === 'replaceWith') {
              if (el[0] !== value[0]) {
                el.replaceWith(value);
              }
            } else if (attr === 'img') {
              if (el.is('img')) {
                el.attr('src', value);
              } else {
                el.replaceWith($('<img>').attr('src', value).attr('class', el.attr('class')));
              }
            } else {
              el.attr(arr[1], value);
            }
          }
        } else {
          template.find(EVENT_NS + '-' + key).html(value);
        }
      });
    },

    _getScrollbarSize: function () {
      if (mfp.scrollbarSize === undefined) {
        var scrollDiv = document.createElement("div");
        scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
        document.body.appendChild(scrollDiv);
        mfp.scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
      }
      return mfp.scrollbarSize;
    }

  };
  $.magnificPopup = {
    instance: null,
    proto: MagnificPopup.prototype,
    modules: [],

    open: function (options, index) {
      _checkInstance();

      if (!options) {
        options = {};
      } else {
        options = $.extend(true, {}, options);
      }

      options.isObj = true;
      options.index = index || 0;
      return this.instance.open(options);
    },

    close: function () {
      return $.magnificPopup.instance && $.magnificPopup.instance.close();
    },

    registerModule: function (name, module) {
      if (module.options) {
        $.magnificPopup.defaults[name] = module.options;
      }
      $.extend(this.proto, module.proto);
      this.modules.push(name);
    },

    defaults: {

      disableOn: 0,

      key: null,

      midClick: false,

      mainClass: '',

      preloader: true,

      focus: '',

      closeOnContentClick: false,

      closeOnBgClick: true,

      closeBtnInside: true,

      showCloseBtn: true,

      enableEscapeKey: true,

      modal: false,

      alignTop: false,

      removalDelay: 0,

      prependTo: null,

      fixedContentPos: 'auto',

      fixedBgPos: 'auto',

      overflowY: 'auto',

      closeMarkup: '<button title="%title%" type="button" class="mfp-close">&#215;</button>',

      tClose: 'Close (Esc)',

      tLoading: 'Loading...',

      autoFocusLast: true

    }
  };

  $.fn.magnificPopup = function (options) {
    _checkInstance();

    var jqEl = $(this);

    if (typeof options === "string") {

      if (options === 'open') {
        var items,
            itemOpts = _isJQ ? jqEl.data('magnificPopup') : jqEl[0].magnificPopup,
            index = parseInt(arguments[1], 10) || 0;

        if (itemOpts.items) {
          items = itemOpts.items[index];
        } else {
          items = jqEl;
          if (itemOpts.delegate) {
            items = items.find(itemOpts.delegate);
          }
          items = items.eq(index);
        }
        mfp._openClick({ mfpEl: items }, jqEl, itemOpts);
      } else {
        if (mfp.isOpen) mfp[options].apply(mfp, Array.prototype.slice.call(arguments, 1));
      }
    } else {
      options = $.extend(true, {}, options);

      if (_isJQ) {
        jqEl.data('magnificPopup', options);
      } else {
        jqEl[0].magnificPopup = options;
      }

      mfp.addGroup(jqEl, options);
    }
    return jqEl;
  };

  var INLINE_NS = 'inline',
      _hiddenClass,
      _inlinePlaceholder,
      _lastInlineElement,
      _putInlineElementsBack = function () {
    if (_lastInlineElement) {
      _inlinePlaceholder.after(_lastInlineElement.addClass(_hiddenClass)).detach();
      _lastInlineElement = null;
    }
  };

  $.magnificPopup.registerModule(INLINE_NS, {
    options: {
      hiddenClass: 'hide',
      markup: '',
      tNotFound: 'Content not found'
    },
    proto: {

      initInline: function () {
        mfp.types.push(INLINE_NS);

        _mfpOn(CLOSE_EVENT + '.' + INLINE_NS, function () {
          _putInlineElementsBack();
        });
      },

      getInline: function (item, template) {

        _putInlineElementsBack();

        if (item.src) {
          var inlineSt = mfp.st.inline,
              el = $(item.src);

          if (el.length) {
            var parent = el[0].parentNode;
            if (parent && parent.tagName) {
              if (!_inlinePlaceholder) {
                _hiddenClass = inlineSt.hiddenClass;
                _inlinePlaceholder = _getEl(_hiddenClass);
                _hiddenClass = 'mfp-' + _hiddenClass;
              }

              _lastInlineElement = el.after(_inlinePlaceholder).detach().removeClass(_hiddenClass);
            }

            mfp.updateStatus('ready');
          } else {
            mfp.updateStatus('error', inlineSt.tNotFound);
            el = $('<div>');
          }

          item.inlineElement = el;
          return el;
        }

        mfp.updateStatus('ready');
        mfp._parseMarkup(template, {}, item);
        return template;
      }
    }
  });

  var AJAX_NS = 'ajax',
      _ajaxCur,
      _removeAjaxCursor = function () {
    if (_ajaxCur) {
      $(document.body).removeClass(_ajaxCur);
    }
  },
      _destroyAjaxRequest = function () {
    _removeAjaxCursor();
    if (mfp.req) {
      mfp.req.abort();
    }
  };

  $.magnificPopup.registerModule(AJAX_NS, {

    options: {
      settings: null,
      cursor: 'mfp-ajax-cur',
      tError: '<a href="%url%">The content</a> could not be loaded.'
    },

    proto: {
      initAjax: function () {
        mfp.types.push(AJAX_NS);
        _ajaxCur = mfp.st.ajax.cursor;

        _mfpOn(CLOSE_EVENT + '.' + AJAX_NS, _destroyAjaxRequest);
        _mfpOn('BeforeChange.' + AJAX_NS, _destroyAjaxRequest);
      },
      getAjax: function (item) {

        if (_ajaxCur) {
          $(document.body).addClass(_ajaxCur);
        }

        mfp.updateStatus('loading');

        var opts = $.extend({
          url: item.src,
          success: function (data, textStatus, jqXHR) {
            var temp = {
              data: data,
              xhr: jqXHR
            };

            _mfpTrigger('ParseAjax', temp);

            mfp.appendContent($(temp.data), AJAX_NS);

            item.finished = true;

            _removeAjaxCursor();

            mfp._setFocus();

            setTimeout(function () {
              mfp.wrap.addClass(READY_CLASS);
            }, 16);

            mfp.updateStatus('ready');

            _mfpTrigger('AjaxContentAdded');
          },
          error: function () {
            _removeAjaxCursor();
            item.finished = item.loadError = true;
            mfp.updateStatus('error', mfp.st.ajax.tError.replace('%url%', item.src));
          }
        }, mfp.st.ajax.settings);

        mfp.req = $.ajax(opts);

        return '';
      }
    }
  });

  var _imgInterval,
      _getTitle = function (item) {
    if (item.data && item.data.title !== undefined) return item.data.title;

    var src = mfp.st.image.titleSrc;

    if (src) {
      if ($.isFunction(src)) {
        return src.call(mfp, item);
      } else if (item.el) {
        return item.el.attr(src) || '';
      }
    }
    return '';
  };

  $.magnificPopup.registerModule('image', {

    options: {
      markup: '<div class="mfp-figure">' + '<div class="mfp-close"></div>' + '<figure>' + '<div class="mfp-img"></div>' + '<figcaption>' + '<div class="mfp-bottom-bar">' + '<div class="mfp-title"></div>' + '<div class="mfp-counter"></div>' + '</div>' + '</figcaption>' + '</figure>' + '</div>',
      cursor: 'mfp-zoom-out-cur',
      titleSrc: 'title',
      verticalFit: true,
      tError: '<a href="%url%">The image</a> could not be loaded.'
    },

    proto: {
      initImage: function () {
        var imgSt = mfp.st.image,
            ns = '.image';

        mfp.types.push('image');

        _mfpOn(OPEN_EVENT + ns, function () {
          if (mfp.currItem.type === 'image' && imgSt.cursor) {
            $(document.body).addClass(imgSt.cursor);
          }
        });

        _mfpOn(CLOSE_EVENT + ns, function () {
          if (imgSt.cursor) {
            $(document.body).removeClass(imgSt.cursor);
          }
          _window.off('resize' + EVENT_NS);
        });

        _mfpOn('Resize' + ns, mfp.resizeImage);
        if (mfp.isLowIE) {
          _mfpOn('AfterChange', mfp.resizeImage);
        }
      },
      resizeImage: function () {
        var item = mfp.currItem;
        if (!item || !item.img) return;

        if (mfp.st.image.verticalFit) {
          var decr = 0;

          if (mfp.isLowIE) {
            decr = parseInt(item.img.css('padding-top'), 10) + parseInt(item.img.css('padding-bottom'), 10);
          }
          item.img.css('max-height', mfp.wH - decr);
        }
      },
      _onImageHasSize: function (item) {
        if (item.img) {

          item.hasSize = true;

          if (_imgInterval) {
            clearInterval(_imgInterval);
          }

          item.isCheckingImgSize = false;

          _mfpTrigger('ImageHasSize', item);

          if (item.imgHidden) {
            if (mfp.content) mfp.content.removeClass('mfp-loading');

            item.imgHidden = false;
          }
        }
      },

      findImageSize: function (item) {

        var counter = 0,
            img = item.img[0],
            mfpSetInterval = function (delay) {

          if (_imgInterval) {
            clearInterval(_imgInterval);
          }

          _imgInterval = setInterval(function () {
            if (img.naturalWidth > 0) {
              mfp._onImageHasSize(item);
              return;
            }

            if (counter > 200) {
              clearInterval(_imgInterval);
            }

            counter++;
            if (counter === 3) {
              mfpSetInterval(10);
            } else if (counter === 40) {
              mfpSetInterval(50);
            } else if (counter === 100) {
              mfpSetInterval(500);
            }
          }, delay);
        };

        mfpSetInterval(1);
      },

      getImage: function (item, template) {

        var guard = 0,
            onLoadComplete = function () {
          if (item) {
            if (item.img[0].complete) {
              item.img.off('.mfploader');

              if (item === mfp.currItem) {
                mfp._onImageHasSize(item);

                mfp.updateStatus('ready');
              }

              item.hasSize = true;
              item.loaded = true;

              _mfpTrigger('ImageLoadComplete');
            } else {
              guard++;
              if (guard < 200) {
                setTimeout(onLoadComplete, 100);
              } else {
                onLoadError();
              }
            }
          }
        },
            onLoadError = function () {
          if (item) {
            item.img.off('.mfploader');
            if (item === mfp.currItem) {
              mfp._onImageHasSize(item);
              mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src));
            }

            item.hasSize = true;
            item.loaded = true;
            item.loadError = true;
          }
        },
            imgSt = mfp.st.image;

        var el = template.find('.mfp-img');
        if (el.length) {
          var img = document.createElement('img');
          img.className = 'mfp-img';
          if (item.el && item.el.find('img').length) {
            img.alt = item.el.find('img').attr('alt');
          }
          item.img = $(img).on('load.mfploader', onLoadComplete).on('error.mfploader', onLoadError);
          img.src = item.src;

          if (el.is('img')) {
            item.img = item.img.clone();
          }

          img = item.img[0];
          if (img.naturalWidth > 0) {
            item.hasSize = true;
          } else if (!img.width) {
            item.hasSize = false;
          }
        }

        mfp._parseMarkup(template, {
          title: _getTitle(item),
          img_replaceWith: item.img
        }, item);

        mfp.resizeImage();

        if (item.hasSize) {
          if (_imgInterval) clearInterval(_imgInterval);

          if (item.loadError) {
            template.addClass('mfp-loading');
            mfp.updateStatus('error', imgSt.tError.replace('%url%', item.src));
          } else {
            template.removeClass('mfp-loading');
            mfp.updateStatus('ready');
          }
          return template;
        }

        mfp.updateStatus('loading');
        item.loading = true;

        if (!item.hasSize) {
          item.imgHidden = true;
          template.addClass('mfp-loading');
          mfp.findImageSize(item);
        }

        return template;
      }
    }
  });

  var hasMozTransform,
      getHasMozTransform = function () {
    if (hasMozTransform === undefined) {
      hasMozTransform = document.createElement('p').style.MozTransform !== undefined;
    }
    return hasMozTransform;
  };

  $.magnificPopup.registerModule('zoom', {

    options: {
      enabled: false,
      easing: 'ease-in-out',
      duration: 300,
      opener: function (element) {
        return element.is('img') ? element : element.find('img');
      }
    },

    proto: {

      initZoom: function () {
        var zoomSt = mfp.st.zoom,
            ns = '.zoom',
            image;

        if (!zoomSt.enabled || !mfp.supportsTransition) {
          return;
        }

        var duration = zoomSt.duration,
            getElToAnimate = function (image) {
          var newImg = image.clone().removeAttr('style').removeAttr('class').addClass('mfp-animated-image'),
              transition = 'all ' + zoomSt.duration / 1000 + 's ' + zoomSt.easing,
              cssObj = {
            position: 'fixed',
            zIndex: 9999,
            left: 0,
            top: 0,
            '-webkit-backface-visibility': 'hidden'
          },
              t = 'transition';

          cssObj['-webkit-' + t] = cssObj['-moz-' + t] = cssObj['-o-' + t] = cssObj[t] = transition;

          newImg.css(cssObj);
          return newImg;
        },
            showMainContent = function () {
          mfp.content.css('visibility', 'visible');
        },
            openTimeout,
            animatedImg;

        _mfpOn('BuildControls' + ns, function () {
          if (mfp._allowZoom()) {

            clearTimeout(openTimeout);
            mfp.content.css('visibility', 'hidden');

            image = mfp._getItemToZoom();

            if (!image) {
              showMainContent();
              return;
            }

            animatedImg = getElToAnimate(image);

            animatedImg.css(mfp._getOffset());

            mfp.wrap.append(animatedImg);

            openTimeout = setTimeout(function () {
              animatedImg.css(mfp._getOffset(true));
              openTimeout = setTimeout(function () {

                showMainContent();

                setTimeout(function () {
                  animatedImg.remove();
                  image = animatedImg = null;
                  _mfpTrigger('ZoomAnimationEnded');
                }, 16);
              }, duration);
            }, 16);
          }
        });
        _mfpOn(BEFORE_CLOSE_EVENT + ns, function () {
          if (mfp._allowZoom()) {

            clearTimeout(openTimeout);

            mfp.st.removalDelay = duration;

            if (!image) {
              image = mfp._getItemToZoom();
              if (!image) {
                return;
              }
              animatedImg = getElToAnimate(image);
            }

            animatedImg.css(mfp._getOffset(true));
            mfp.wrap.append(animatedImg);
            mfp.content.css('visibility', 'hidden');

            setTimeout(function () {
              animatedImg.css(mfp._getOffset());
            }, 16);
          }
        });

        _mfpOn(CLOSE_EVENT + ns, function () {
          if (mfp._allowZoom()) {
            showMainContent();
            if (animatedImg) {
              animatedImg.remove();
            }
            image = null;
          }
        });
      },

      _allowZoom: function () {
        return mfp.currItem.type === 'image';
      },

      _getItemToZoom: function () {
        if (mfp.currItem.hasSize) {
          return mfp.currItem.img;
        } else {
          return false;
        }
      },

      _getOffset: function (isLarge) {
        var el;
        if (isLarge) {
          el = mfp.currItem.img;
        } else {
          el = mfp.st.zoom.opener(mfp.currItem.el || mfp.currItem);
        }

        var offset = el.offset();
        var paddingTop = parseInt(el.css('padding-top'), 10);
        var paddingBottom = parseInt(el.css('padding-bottom'), 10);
        offset.top -= $(window).scrollTop() - paddingTop;

        var obj = {
          width: el.width(),

          height: (_isJQ ? el.innerHeight() : el[0].offsetHeight) - paddingBottom - paddingTop
        };

        if (getHasMozTransform()) {
          obj['-moz-transform'] = obj['transform'] = 'translate(' + offset.left + 'px,' + offset.top + 'px)';
        } else {
          obj.left = offset.left;
          obj.top = offset.top;
        }
        return obj;
      }

    }
  });

  var IFRAME_NS = 'iframe',
      _emptyPage = '//about:blank',
      _fixIframeBugs = function (isShowing) {
    if (mfp.currTemplate[IFRAME_NS]) {
      var el = mfp.currTemplate[IFRAME_NS].find('iframe');
      if (el.length) {
        if (!isShowing) {
          el[0].src = _emptyPage;
        }

        if (mfp.isIE8) {
          el.css('display', isShowing ? 'block' : 'none');
        }
      }
    }
  };

  $.magnificPopup.registerModule(IFRAME_NS, {

    options: {
      markup: '<div class="mfp-iframe-scaler">' + '<div class="mfp-close"></div>' + '<iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe>' + '</div>',

      srcAction: 'iframe_src',

      patterns: {
        youtube: {
          index: 'youtube.com',
          id: 'v=',
          src: '//www.youtube.com/embed/%id%?autoplay=1'
        },
        vimeo: {
          index: 'vimeo.com/',
          id: '/',
          src: '//player.vimeo.com/video/%id%?autoplay=1'
        },
        gmaps: {
          index: '//maps.google.',
          src: '%id%&output=embed'
        }
      }
    },

    proto: {
      initIframe: function () {
        mfp.types.push(IFRAME_NS);

        _mfpOn('BeforeChange', function (e, prevType, newType) {
          if (prevType !== newType) {
            if (prevType === IFRAME_NS) {
              _fixIframeBugs();
            } else if (newType === IFRAME_NS) {
              _fixIframeBugs(true);
            }
          }
        });

        _mfpOn(CLOSE_EVENT + '.' + IFRAME_NS, function () {
          _fixIframeBugs();
        });
      },

      getIframe: function (item, template) {
        var embedSrc = item.src;
        var iframeSt = mfp.st.iframe;

        $.each(iframeSt.patterns, function () {
          if (embedSrc.indexOf(this.index) > -1) {
            if (this.id) {
              if (typeof this.id === 'string') {
                embedSrc = embedSrc.substr(embedSrc.lastIndexOf(this.id) + this.id.length, embedSrc.length);
              } else {
                embedSrc = this.id.call(this, embedSrc);
              }
            }
            embedSrc = this.src.replace('%id%', embedSrc);
            return false;
          }
        });

        var dataObj = {};
        if (iframeSt.srcAction) {
          dataObj[iframeSt.srcAction] = embedSrc;
        }
        mfp._parseMarkup(template, dataObj, item);

        mfp.updateStatus('ready');

        return template;
      }
    }
  });

  var _getLoopedId = function (index) {
    var numSlides = mfp.items.length;
    if (index > numSlides - 1) {
      return index - numSlides;
    } else if (index < 0) {
      return numSlides + index;
    }
    return index;
  },
      _replaceCurrTotal = function (text, curr, total) {
    return text.replace(/%curr%/gi, curr + 1).replace(/%total%/gi, total);
  };

  $.magnificPopup.registerModule('gallery', {

    options: {
      enabled: false,
      arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
      preload: [0, 2],
      navigateByImgClick: true,
      arrows: true,

      tPrev: 'Previous (Left arrow key)',
      tNext: 'Next (Right arrow key)',
      tCounter: '%curr% of %total%'
    },

    proto: {
      initGallery: function () {

        var gSt = mfp.st.gallery,
            ns = '.mfp-gallery';

        mfp.direction = true;

        if (!gSt || !gSt.enabled) return false;

        _wrapClasses += ' mfp-gallery';

        _mfpOn(OPEN_EVENT + ns, function () {

          if (gSt.navigateByImgClick) {
            mfp.wrap.on('click' + ns, '.mfp-img', function () {
              if (mfp.items.length > 1) {
                mfp.next();
                return false;
              }
            });
          }

          _document.on('keydown' + ns, function (e) {
            if (e.keyCode === 37) {
              mfp.prev();
            } else if (e.keyCode === 39) {
              mfp.next();
            }
          });
        });

        _mfpOn('UpdateStatus' + ns, function (e, data) {
          if (data.text) {
            data.text = _replaceCurrTotal(data.text, mfp.currItem.index, mfp.items.length);
          }
        });

        _mfpOn(MARKUP_PARSE_EVENT + ns, function (e, element, values, item) {
          var l = mfp.items.length;
          values.counter = l > 1 ? _replaceCurrTotal(gSt.tCounter, item.index, l) : '';
        });

        _mfpOn('BuildControls' + ns, function () {
          if (mfp.items.length > 1 && gSt.arrows && !mfp.arrowLeft) {
            var markup = gSt.arrowMarkup,
                arrowLeft = mfp.arrowLeft = $(markup.replace(/%title%/gi, gSt.tPrev).replace(/%dir%/gi, 'left')).addClass(PREVENT_CLOSE_CLASS),
                arrowRight = mfp.arrowRight = $(markup.replace(/%title%/gi, gSt.tNext).replace(/%dir%/gi, 'right')).addClass(PREVENT_CLOSE_CLASS);

            arrowLeft.click(function () {
              mfp.prev();
            });
            arrowRight.click(function () {
              mfp.next();
            });

            mfp.container.append(arrowLeft.add(arrowRight));
          }
        });

        _mfpOn(CHANGE_EVENT + ns, function () {
          if (mfp._preloadTimeout) clearTimeout(mfp._preloadTimeout);

          mfp._preloadTimeout = setTimeout(function () {
            mfp.preloadNearbyImages();
            mfp._preloadTimeout = null;
          }, 16);
        });

        _mfpOn(CLOSE_EVENT + ns, function () {
          _document.off(ns);
          mfp.wrap.off('click' + ns);
          mfp.arrowRight = mfp.arrowLeft = null;
        });
      },
      next: function () {
        mfp.direction = true;
        mfp.index = _getLoopedId(mfp.index + 1);
        mfp.updateItemHTML();
      },
      prev: function () {
        mfp.direction = false;
        mfp.index = _getLoopedId(mfp.index - 1);
        mfp.updateItemHTML();
      },
      goTo: function (newIndex) {
        mfp.direction = newIndex >= mfp.index;
        mfp.index = newIndex;
        mfp.updateItemHTML();
      },
      preloadNearbyImages: function () {
        var p = mfp.st.gallery.preload,
            preloadBefore = Math.min(p[0], mfp.items.length),
            preloadAfter = Math.min(p[1], mfp.items.length),
            i;

        for (i = 1; i <= (mfp.direction ? preloadAfter : preloadBefore); i++) {
          mfp._preloadItem(mfp.index + i);
        }
        for (i = 1; i <= (mfp.direction ? preloadBefore : preloadAfter); i++) {
          mfp._preloadItem(mfp.index - i);
        }
      },
      _preloadItem: function (index) {
        index = _getLoopedId(index);

        if (mfp.items[index].preloaded) {
          return;
        }

        var item = mfp.items[index];
        if (!item.parsed) {
          item = mfp.parseEl(index);
        }

        _mfpTrigger('LazyLoad', item);

        if (item.type === 'image') {
          item.img = $('<img class="mfp-img" />').on('load.mfploader', function () {
            item.hasSize = true;
          }).on('error.mfploader', function () {
            item.hasSize = true;
            item.loadError = true;
            _mfpTrigger('LazyLoadError', item);
          }).attr('src', item.src);
        }

        item.preloaded = true;
      }
    }
  });

  var RETINA_NS = 'retina';

  $.magnificPopup.registerModule(RETINA_NS, {
    options: {
      replaceSrc: function (item) {
        return item.src.replace(/\.\w+$/, function (m) {
          return '@2x' + m;
        });
      },
      ratio: 1 },
    proto: {
      initRetina: function () {
        if (window.devicePixelRatio > 1) {

          var st = mfp.st.retina,
              ratio = st.ratio;

          ratio = !isNaN(ratio) ? ratio : ratio();

          if (ratio > 1) {
            _mfpOn('ImageHasSize' + '.' + RETINA_NS, function (e, item) {
              item.img.css({
                'max-width': item.img[0].naturalWidth / ratio,
                'width': '100%'
              });
            });
            _mfpOn('ElementParse' + '.' + RETINA_NS, function (e, item) {
              item.src = st.replaceSrc(item, ratio);
            });
          }
        }
      }
    }
  });

  _checkInstance();
});
!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.3.1';

  var Foundation = {
    version: FOUNDATION_VERSION,

    _plugins: {},

    _uuids: [],

    rtl: function () {
      return $('html').attr('dir') === 'rtl';
    },

    plugin: function (plugin, name) {
      var className = name || functionName(plugin);

      var attrName = hyphenate(className);

      this._plugins[attrName] = this[className] = plugin;
    },

    registerPlugin: function (plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr(`data-${pluginName}`)) {
        plugin.$element.attr(`data-${pluginName}`, plugin.uuid);
      }
      if (!plugin.$element.data('zfPlugin')) {
        plugin.$element.data('zfPlugin', plugin);
      }

      plugin.$element.trigger(`init.zf.${pluginName}`);

      this._uuids.push(plugin.uuid);

      return;
    },

    unregisterPlugin: function (plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr(`data-${pluginName}`).removeData('zfPlugin').trigger(`destroyed.zf.${pluginName}`);
      for (var prop in plugin) {
        plugin[prop] = null;
      }
      return;
    },

    reInit: function (plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins,
              _this = this,
              fns = {
            'object': function (plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function () {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function () {
              this['object'](Object.keys(_this._plugins));
            }
          };
          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    GetYoDigits: function (length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? `-${namespace}` : '');
    },

    reflow: function (elem, plugins) {
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      } else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      $.each(plugins, function (i, name) {
        var plugin = _this._plugins[name];

        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        $elem.each(function () {
          var $el = $(this),
              opts = {};

          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {
                return el.trim();
              });
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function ($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend'
      };
      var elem = document.createElement('div'),
          end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    }
  };

  Foundation.util = {
    throttle: function (func, delay) {
      var timer = null;

      return function () {
        var context = this,
            args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }
  };

  var foundation = function (method) {
    var type = typeof method,
        $meta = $('meta.foundation-mq'),
        $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {
      var args = Array.prototype.slice.call(arguments, 1);
      var plugClass = this.data('zfPlugin');

      if (plugClass !== undefined && plugClass[method] !== undefined) {
        if (this.length === 1) {
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {
      throw new TypeError(`We're sorry, ${type} is not a valid parameter. You must use a string representing the method you wish to invoke.`);
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  (function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
      return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }

    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function () {
          return Date.now() - this.start;
        }
      };
    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function () {},
          fBound = function () {
        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }

  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if ('true' === str) return true;else if ('false' === str) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }

  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}(jQuery);

'use strict';

!function ($) {
  const defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],

    current: '',

    _init() {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: `only screen and (min-width: ${namedQueries[key]})`
          });
        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },

    atLeast(size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },

    is(size) {
      size = size.trim().split(' ');
      if (size.length > 1 && size[1] === 'only') {
        if (size[0] === this._getCurrentSize()) return true;
      } else {
        return this.atLeast(size[0]);
      }
      return false;
    },

    get(size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },

    _getCurrentSize() {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if (typeof matched === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },

    _watcher() {
      $(window).on('resize.zf.mediaquery', () => {
        var newSize = this._getCurrentSize(),
            currentSize = this.current;

        if (newSize !== currentSize) {
          this.current = newSize;

          $(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    }
  };

  Foundation.MediaQuery = MediaQuery;

  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    var styleMedia = window.styleMedia || window.media;

    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium(media) {
          var text = `@media ${media}{ #matchmediajs-test { width: 1px; } }`;

          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1);

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;
}(jQuery);

'use strict';

!function ($) {

  const keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    parseKey(event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

      key = key.replace(/\W+/, '');

      if (event.shiftKey) key = `SHIFT_${key}`;
      if (event.ctrlKey) key = `CTRL_${key}`;
      if (event.altKey) key = `ALT_${key}`;

      key = key.replace(/_$/, '');

      return key;
    },

    handleKey(event, component, functions) {
      var commandList = commands[component],
          keyCode = this.parseKey(event),
          cmds,
          command,
          fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {
        cmds = commandList;
      } else {
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else cmds = $.extend({}, commandList.rtl, commandList.ltr);
      }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {
        var returnValue = fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {
          functions.handled(returnValue);
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {
          functions.unhandled();
        }
      }
    },

    findFocusable($element) {
      if (!$element) {
        return false;
      }
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {
          return false;
        }
        return true;
      });
    },

    register(componentName, cmds) {
      commands[componentName] = cmds;
    },

    trapFocus($element) {
      var $focusable = Foundation.Keyboard.findFocusable($element),
          $firstFocusable = $focusable.eq(0),
          $lastFocusable = $focusable.eq(-1);

      $element.on('keydown.zf.trapfocus', function (event) {
        if (event.target === $lastFocusable[0] && Foundation.Keyboard.parseKey(event) === 'TAB') {
          event.preventDefault();
          $firstFocusable.focus();
        } else if (event.target === $firstFocusable[0] && Foundation.Keyboard.parseKey(event) === 'SHIFT_TAB') {
          event.preventDefault();
          $lastFocusable.focus();
        }
      });
    },

    releaseFocus($element) {
      $element.off('keydown.zf.trapfocus');
    }
  };

  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) k[kcs[kc]] = kcs[kc];
    return k;
  }

  Foundation.Keyboard = Keyboard;
}(jQuery);

'use strict';

!function ($) {

  const MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (`${prefixes[i]}MutationObserver` in window) {
        return window[`${prefixes[i]}MutationObserver`];
      }
    }
    return false;
  }();

  const triggers = (el, type) => {
    el.data(type).split(' ').forEach(id => {
      $(`#${id}`)[type === 'close' ? 'trigger' : 'triggerHandler'](`${type}.zf.trigger`, [el]);
    });
  };

  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  $(document).on('click.zf.trigger', '[data-close]', function () {
    let id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else {
      $(this).trigger('close.zf.trigger');
    }
  });

  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    let id = $(this).data('toggle');
    if (id) {
      triggers($(this), 'toggle');
    } else {
      $(this).trigger('toggle.zf.trigger');
    }
  });

  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    let animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    let id = $(this).data('toggle-focus');
    $(`#${id}`).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  $(window).on('load', () => {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    mutateListener();
    closemeListener();
  }

  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if (typeof pluginName === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      let listeners = plugNames.map(name => {
        return `closeme.zf.${name}`;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        let plugin = e.namespace.split('.')[0];
        let plugins = $(`[data-${plugin}]`).not(`[data-yeti-box="${pluginId}"]`);

        plugins.each(function () {
          let _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    let timer,
        $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }

          $nodes.attr('data-events', "resize");
        }, debounce || 10);
      });
    }
  }

  function scrollListener(debounce) {
    let timer,
        $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }

          $nodes.attr('data-events', "scroll");
        }, debounce || 10);
      });
    }
  }

  function mutateListener(debounce) {
    let $nodes = $('[data-mutate]');
    if ($nodes.length && MutationObserver) {
      $nodes.each(function () {
        $(this).triggerHandler('mutateme.zf.trigger');
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {
      return false;
    }
    let nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    var listeningElementsMutation = function (mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);

      switch (mutationRecordsList[0].type) {

        case "attributes":
          if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          }
          if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('resizeme.zf.trigger', [$target]);
          }
          if (mutationRecordsList[0].attributeName === "style") {
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          }
          break;

        case "childList":
          $target.closest("[data-mutate]").attr("data-events", "mutate");
          $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          break;

        default:
          return false;
      }
    };

    if (nodes.length) {
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
      }
    }
  }

  Foundation.IHearYou = checkListeners;
}(jQuery);

'use strict';

!function ($) {

  const Nest = {
    Feather(menu, type = 'zf') {
      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
          subMenuClass = `is-${type}-submenu`,
          subItemClass = `${subMenuClass}-item`,
          hasSubClass = `is-${type}-submenu-parent`;

      items.each(function () {
        var $item = $(this),
            $sub = $item.children('ul');

        if ($sub.length) {
          $item.addClass(hasSubClass).attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text()
          });

          if (type === 'drilldown') {
            $item.attr({ 'aria-expanded': false });
          }

          $sub.addClass(`submenu ${subMenuClass}`).attr({
            'data-submenu': '',
            'role': 'menu'
          });
          if (type === 'drilldown') {
            $sub.attr({ 'aria-hidden': true });
          }
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass(`is-submenu-item ${subItemClass}`);
        }
      });

      return;
    },

    Burn(menu, type) {
      var subMenuClass = `is-${type}-submenu`,
          subItemClass = `${subMenuClass}-item`,
          hasSubClass = `is-${type}-submenu-parent`;

      menu.find('>li, .menu, .menu > li').removeClass(`${subMenuClass} ${subItemClass} ${hasSubClass} is-submenu-item submenu is-active`).removeAttr('data-submenu').css('display', '');
    }
  };

  Foundation.Nest = Nest;
}(jQuery);

'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets
  };

  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
        top,
        bottom,
        left,
        right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left;
    } else {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  }

  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      case 'left bottom':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'right bottom':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  }
}(jQuery);

'use strict';

!function ($) {

  const initClasses = ['mui-enter', 'mui-leave'];
  const activeClasses = ['mui-enter-active', 'mui-leave-active'];

  const Motion = {
    animateIn: function (element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function (element, animation, cb) {
      animate(false, element, animation, cb);
    }
  };

  function Move(duration, elem, fn) {
    var anim,
        prog,
        start = null;


    if (duration === 0) {
      fn.apply(elem);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      return;
    }

    function move(ts) {
      if (!start) start = ts;

      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {
        anim = window.requestAnimationFrame(move, elem);
      } else {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    reset();

    element.addClass(animation).css('transition', 'none');

    requestAnimationFrame(() => {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    requestAnimationFrame(() => {
      element[0].offsetWidth;
      element.css('transition', '').addClass(activeClass);
    });

    element.one(Foundation.transitionend(element), finish);

    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(`${initClass} ${activeClass} ${animation}`);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;
}(jQuery);

'use strict';

!function ($) {

  class Accordion {
    constructor(element, options) {
      this.$element = element;
      this.options = $.extend({}, Accordion.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Accordion');
      Foundation.Keyboard.register('Accordion', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_DOWN': 'next',
        'ARROW_UP': 'previous'
      });
    }

    _init() {
      this.$element.attr('role', 'tablist');
      this.$tabs = this.$element.children('[data-accordion-item]');

      this.$tabs.each(function (idx, el) {
        var $el = $(el),
            $content = $el.children('[data-tab-content]'),
            id = $content[0].id || Foundation.GetYoDigits(6, 'accordion'),
            linkId = el.id || `${id}-label`;

        $el.find('a:first').attr({
          'aria-controls': id,
          'role': 'tab',
          'id': linkId,
          'aria-expanded': false,
          'aria-selected': false
        });

        $content.attr({ 'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id });
      });
      var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
      if ($initActive.length) {
        this.down($initActive, true);
      }
      this._events();
    }

    _events() {
      var _this = this;

      this.$tabs.each(function () {
        var $elem = $(this);
        var $tabContent = $elem.children('[data-tab-content]');
        if ($tabContent.length) {
          $elem.children('a').off('click.zf.accordion keydown.zf.accordion').on('click.zf.accordion', function (e) {
            e.preventDefault();
            _this.toggle($tabContent);
          }).on('keydown.zf.accordion', function (e) {
            Foundation.Keyboard.handleKey(e, 'Accordion', {
              toggle: function () {
                _this.toggle($tabContent);
              },
              next: function () {
                var $a = $elem.next().find('a').focus();
                if (!_this.options.multiExpand) {
                  $a.trigger('click.zf.accordion');
                }
              },
              previous: function () {
                var $a = $elem.prev().find('a').focus();
                if (!_this.options.multiExpand) {
                  $a.trigger('click.zf.accordion');
                }
              },
              handled: function () {
                e.preventDefault();
                e.stopPropagation();
              }
            });
          });
        }
      });
    }

    toggle($target) {
      if ($target.parent().hasClass('is-active')) {
        this.up($target);
      } else {
        this.down($target);
      }
    }

    down($target, firstTime) {
      $target.attr('aria-hidden', false).parent('[data-tab-content]').addBack().parent().addClass('is-active');

      if (!this.options.multiExpand && !firstTime) {
        var $currentActive = this.$element.children('.is-active').children('[data-tab-content]');
        if ($currentActive.length) {
          this.up($currentActive.not($target));
        }
      }

      $target.slideDown(this.options.slideSpeed, () => {
        this.$element.trigger('down.zf.accordion', [$target]);
      });

      $(`#${$target.attr('aria-labelledby')}`).attr({
        'aria-expanded': true,
        'aria-selected': true
      });
    }

    up($target) {
      var $aunts = $target.parent().siblings(),
          _this = this;

      if (!this.options.allowAllClosed && !$aunts.hasClass('is-active') || !$target.parent().hasClass('is-active')) {
        return;
      }

      $target.slideUp(_this.options.slideSpeed, function () {
        _this.$element.trigger('up.zf.accordion', [$target]);
      });


      $target.attr('aria-hidden', true).parent().removeClass('is-active');

      $(`#${$target.attr('aria-labelledby')}`).attr({
        'aria-expanded': false,
        'aria-selected': false
      });
    }

    destroy() {
      this.$element.find('[data-tab-content]').stop(true).slideUp(0).css('display', '');
      this.$element.find('a').off('.zf.accordion');

      Foundation.unregisterPlugin(this);
    }
  }

  Accordion.defaults = {
    slideSpeed: 250,

    multiExpand: false,

    allowAllClosed: false
  };

  Foundation.plugin(Accordion, 'Accordion');
}(jQuery);

/**
 * @license
 * Copyright 2010 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function MarkerClusterer(map, opt_markers, opt_options) {
  this.extend(MarkerClusterer, google.maps.OverlayView);
  this.map_ = map;

  this.markers_ = [];

  this.clusters_ = [];

  this.sizes = [53, 56, 66, 78, 90];

  this.styles_ = [];

  this.ready_ = false;

  var options = opt_options || {};

  this.gridSize_ = options['gridSize'] || 60;

  this.minClusterSize_ = options['minimumClusterSize'] || 2;

  this.maxZoom_ = options['maxZoom'] || null;

  this.styles_ = options['styles'] || [];

  this.imagePath_ = options['imagePath'] || this.MARKER_CLUSTER_IMAGE_PATH_;

  this.imageExtension_ = options['imageExtension'] || this.MARKER_CLUSTER_IMAGE_EXTENSION_;

  this.zoomOnClick_ = true;

  if (options['zoomOnClick'] != undefined) {
    this.zoomOnClick_ = options['zoomOnClick'];
  }

  this.averageCenter_ = false;

  if (options['averageCenter'] != undefined) {
    this.averageCenter_ = options['averageCenter'];
  }

  this.setupStyles_();

  this.setMap(map);

  this.prevZoom_ = this.map_.getZoom();

  var that = this;
  google.maps.event.addListener(this.map_, 'zoom_changed', function () {
    var zoom = that.map_.getZoom();

    if (that.prevZoom_ != zoom) {
      that.prevZoom_ = zoom;
      that.resetViewport();
    }
  });

  google.maps.event.addListener(this.map_, 'idle', function () {
    that.redraw();
  });

  if (opt_markers && opt_markers.length) {
    this.addMarkers(opt_markers, false);
  }
}

MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_ = '../images/m';

MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_ = 'png';

MarkerClusterer.prototype.extend = function (obj1, obj2) {
  return function (object) {
    for (var property in object.prototype) {
      this.prototype[property] = object.prototype[property];
    }
    return this;
  }.apply(obj1, [obj2]);
};

MarkerClusterer.prototype.onAdd = function () {
  this.setReady_(true);
};

MarkerClusterer.prototype.draw = function () {};

MarkerClusterer.prototype.setupStyles_ = function () {
  if (this.styles_.length) {
    return;
  }

  for (var i = 0, size; size = this.sizes[i]; i++) {
    this.styles_.push({
      url: this.imagePath_ + (i + 1) + '.' + this.imageExtension_,
      height: size,
      width: size
    });
  }
};

MarkerClusterer.prototype.fitMapToMarkers = function () {
  var markers = this.getMarkers();
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0, marker; marker = markers[i]; i++) {
    bounds.extend(marker.getPosition());
  }

  this.map_.fitBounds(bounds);
};

MarkerClusterer.prototype.setStyles = function (styles) {
  this.styles_ = styles;
};

MarkerClusterer.prototype.getStyles = function () {
  return this.styles_;
};

MarkerClusterer.prototype.isZoomOnClick = function () {
  return this.zoomOnClick_;
};

MarkerClusterer.prototype.isAverageCenter = function () {
  return this.averageCenter_;
};

MarkerClusterer.prototype.getMarkers = function () {
  return this.markers_;
};

MarkerClusterer.prototype.getTotalMarkers = function () {
  return this.markers_.length;
};

MarkerClusterer.prototype.setMaxZoom = function (maxZoom) {
  this.maxZoom_ = maxZoom;
};

MarkerClusterer.prototype.getMaxZoom = function () {
  return this.maxZoom_;
};

MarkerClusterer.prototype.calculator_ = function (markers, numStyles) {
  var index = 0;
  var count = markers.length;
  var dv = count;
  while (dv !== 0) {
    dv = parseInt(dv / 10, 10);
    index++;
  }

  index = Math.min(index, numStyles);
  return {
    text: count,
    index: index
  };
};

MarkerClusterer.prototype.setCalculator = function (calculator) {
  this.calculator_ = calculator;
};

MarkerClusterer.prototype.getCalculator = function () {
  return this.calculator_;
};

MarkerClusterer.prototype.addMarkers = function (markers, opt_nodraw) {
  for (var i = 0, marker; marker = markers[i]; i++) {
    this.pushMarkerTo_(marker);
  }
  if (!opt_nodraw) {
    this.redraw();
  }
};

MarkerClusterer.prototype.pushMarkerTo_ = function (marker) {
  marker.isAdded = false;
  if (marker['draggable']) {
    var that = this;
    google.maps.event.addListener(marker, 'dragend', function () {
      marker.isAdded = false;
      that.repaint();
    });
  }
  this.markers_.push(marker);
};

MarkerClusterer.prototype.addMarker = function (marker, opt_nodraw) {
  this.pushMarkerTo_(marker);
  if (!opt_nodraw) {
    this.redraw();
  }
};

MarkerClusterer.prototype.removeMarker_ = function (marker) {
  var index = -1;
  if (this.markers_.indexOf) {
    index = this.markers_.indexOf(marker);
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        index = i;
        break;
      }
    }
  }

  if (index == -1) {
    return false;
  }

  marker.setMap(null);

  this.markers_.splice(index, 1);

  return true;
};

MarkerClusterer.prototype.removeMarker = function (marker, opt_nodraw) {
  var removed = this.removeMarker_(marker);

  if (!opt_nodraw && removed) {
    this.resetViewport();
    this.redraw();
    return true;
  } else {
    return false;
  }
};

MarkerClusterer.prototype.removeMarkers = function (markers, opt_nodraw) {
  var removed = false;

  for (var i = 0, marker; marker = markers[i]; i++) {
    var r = this.removeMarker_(marker);
    removed = removed || r;
  }

  if (!opt_nodraw && removed) {
    this.resetViewport();
    this.redraw();
    return true;
  }
};

MarkerClusterer.prototype.setReady_ = function (ready) {
  if (!this.ready_) {
    this.ready_ = ready;
    this.createClusters_();
  }
};

MarkerClusterer.prototype.getTotalClusters = function () {
  return this.clusters_.length;
};

MarkerClusterer.prototype.getMap = function () {
  return this.map_;
};

MarkerClusterer.prototype.setMap = function (map) {
  this.map_ = map;
};

MarkerClusterer.prototype.getGridSize = function () {
  return this.gridSize_;
};

MarkerClusterer.prototype.setGridSize = function (size) {
  this.gridSize_ = size;
};

MarkerClusterer.prototype.getMinClusterSize = function () {
  return this.minClusterSize_;
};

MarkerClusterer.prototype.setMinClusterSize = function (size) {
  this.minClusterSize_ = size;
};

MarkerClusterer.prototype.getExtendedBounds = function (bounds) {
  var projection = this.getProjection();

  var tr = new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getNorthEast().lng());
  var bl = new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getSouthWest().lng());

  var trPix = projection.fromLatLngToDivPixel(tr);
  trPix.x += this.gridSize_;
  trPix.y -= this.gridSize_;

  var blPix = projection.fromLatLngToDivPixel(bl);
  blPix.x -= this.gridSize_;
  blPix.y += this.gridSize_;

  var ne = projection.fromDivPixelToLatLng(trPix);
  var sw = projection.fromDivPixelToLatLng(blPix);

  bounds.extend(ne);
  bounds.extend(sw);

  return bounds;
};

MarkerClusterer.prototype.isMarkerInBounds_ = function (marker, bounds) {
  return bounds.contains(marker.getPosition());
};

MarkerClusterer.prototype.clearMarkers = function () {
  this.resetViewport(true);

  this.markers_ = [];
};

MarkerClusterer.prototype.resetViewport = function (opt_hide) {
  for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
    cluster.remove();
  }

  for (var i = 0, marker; marker = this.markers_[i]; i++) {
    marker.isAdded = false;
    if (opt_hide) {
      marker.setMap(null);
    }
  }

  this.clusters_ = [];
};

MarkerClusterer.prototype.repaint = function () {
  var oldClusters = this.clusters_.slice();
  this.clusters_.length = 0;
  this.resetViewport();
  this.redraw();

  window.setTimeout(function () {
    for (var i = 0, cluster; cluster = oldClusters[i]; i++) {
      cluster.remove();
    }
  }, 0);
};

MarkerClusterer.prototype.redraw = function () {
  this.createClusters_();
};

MarkerClusterer.prototype.distanceBetweenPoints_ = function (p1, p2) {
  if (!p1 || !p2) {
    return 0;
  }

  var R = 6371;
  var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
  var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

MarkerClusterer.prototype.addToClosestCluster_ = function (marker) {
  var distance = 40000;
  var clusterToAddTo = null;
  var pos = marker.getPosition();
  for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
    var center = cluster.getCenter();
    if (center) {
      var d = this.distanceBetweenPoints_(center, marker.getPosition());
      if (d < distance) {
        distance = d;
        clusterToAddTo = cluster;
      }
    }
  }

  if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
    clusterToAddTo.addMarker(marker);
  } else {
    var cluster = new Cluster(this);
    cluster.addMarker(marker);
    this.clusters_.push(cluster);
  }
};

MarkerClusterer.prototype.createClusters_ = function () {
  if (!this.ready_) {
    return;
  }

  var mapBounds = new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(), this.map_.getBounds().getNorthEast());
  var bounds = this.getExtendedBounds(mapBounds);

  for (var i = 0, marker; marker = this.markers_[i]; i++) {
    if (!marker.isAdded && this.isMarkerInBounds_(marker, bounds)) {
      this.addToClosestCluster_(marker);
    }
  }
};

function Cluster(markerClusterer) {
  this.markerClusterer_ = markerClusterer;
  this.map_ = markerClusterer.getMap();
  this.gridSize_ = markerClusterer.getGridSize();
  this.minClusterSize_ = markerClusterer.getMinClusterSize();
  this.averageCenter_ = markerClusterer.isAverageCenter();
  this.center_ = null;
  this.markers_ = [];
  this.bounds_ = null;
  this.clusterIcon_ = new ClusterIcon(this, markerClusterer.getStyles(), markerClusterer.getGridSize());
}

Cluster.prototype.isMarkerAlreadyAdded = function (marker) {
  if (this.markers_.indexOf) {
    return this.markers_.indexOf(marker) != -1;
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        return true;
      }
    }
  }
  return false;
};

Cluster.prototype.addMarker = function (marker) {
  if (this.isMarkerAlreadyAdded(marker)) {
    return false;
  }

  if (!this.center_) {
    this.center_ = marker.getPosition();
    this.calculateBounds_();
  } else {
    if (this.averageCenter_) {
      var l = this.markers_.length + 1;
      var lat = (this.center_.lat() * (l - 1) + marker.getPosition().lat()) / l;
      var lng = (this.center_.lng() * (l - 1) + marker.getPosition().lng()) / l;
      this.center_ = new google.maps.LatLng(lat, lng);
      this.calculateBounds_();
    }
  }

  marker.isAdded = true;
  this.markers_.push(marker);

  var len = this.markers_.length;
  if (len < this.minClusterSize_ && marker.getMap() != this.map_) {
    marker.setMap(this.map_);
  }

  if (len == this.minClusterSize_) {
    for (var i = 0; i < len; i++) {
      this.markers_[i].setMap(null);
    }
  }

  if (len >= this.minClusterSize_) {
    marker.setMap(null);
  }

  this.updateIcon();
  return true;
};

Cluster.prototype.getMarkerClusterer = function () {
  return this.markerClusterer_;
};

Cluster.prototype.getBounds = function () {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  var markers = this.getMarkers();
  for (var i = 0, marker; marker = markers[i]; i++) {
    bounds.extend(marker.getPosition());
  }
  return bounds;
};

Cluster.prototype.remove = function () {
  this.clusterIcon_.remove();
  this.markers_.length = 0;
  delete this.markers_;
};

Cluster.prototype.getSize = function () {
  return this.markers_.length;
};

Cluster.prototype.getMarkers = function () {
  return this.markers_;
};

Cluster.prototype.getCenter = function () {
  return this.center_;
};

Cluster.prototype.calculateBounds_ = function () {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
  this.bounds_ = this.markerClusterer_.getExtendedBounds(bounds);
};

Cluster.prototype.isMarkerInClusterBounds = function (marker) {
  return this.bounds_.contains(marker.getPosition());
};

Cluster.prototype.getMap = function () {
  return this.map_;
};

Cluster.prototype.updateIcon = function () {
  var zoom = this.map_.getZoom();
  var mz = this.markerClusterer_.getMaxZoom();

  if (mz && zoom > mz) {
    for (var i = 0, marker; marker = this.markers_[i]; i++) {
      marker.setMap(this.map_);
    }
    return;
  }

  if (this.markers_.length < this.minClusterSize_) {
    this.clusterIcon_.hide();
    return;
  }

  var numStyles = this.markerClusterer_.getStyles().length;
  var sums = this.markerClusterer_.getCalculator()(this.markers_, numStyles);
  this.clusterIcon_.setCenter(this.center_);
  this.clusterIcon_.setSums(sums);
  this.clusterIcon_.show();
};

function ClusterIcon(cluster, styles, opt_padding) {
  cluster.getMarkerClusterer().extend(ClusterIcon, google.maps.OverlayView);

  this.styles_ = styles;
  this.padding_ = opt_padding || 0;
  this.cluster_ = cluster;
  this.center_ = null;
  this.map_ = cluster.getMap();
  this.div_ = null;
  this.sums_ = null;
  this.visible_ = false;

  this.setMap(this.map_);
}

ClusterIcon.prototype.triggerClusterClick = function (event) {
  var markerClusterer = this.cluster_.getMarkerClusterer();

  google.maps.event.trigger(markerClusterer, 'clusterclick', this.cluster_, event);

  if (markerClusterer.isZoomOnClick()) {
    this.map_.fitBounds(this.cluster_.getBounds());
  }
};

ClusterIcon.prototype.onAdd = function () {
  this.div_ = document.createElement('DIV');
  if (this.visible_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.cssText = this.createCss(pos);
    this.div_.innerHTML = this.sums_.text;
  }

  var panes = this.getPanes();
  panes.overlayMouseTarget.appendChild(this.div_);

  var that = this;
  var isDragging = false;
  google.maps.event.addDomListener(this.div_, 'click', function (event) {
    if (!isDragging) {
      that.triggerClusterClick(event);
    }
  });
  google.maps.event.addDomListener(this.div_, 'mousedown', function () {
    isDragging = false;
  });
  google.maps.event.addDomListener(this.div_, 'mousemove', function () {
    isDragging = true;
  });
};

ClusterIcon.prototype.getPosFromLatLng_ = function (latlng) {
  var pos = this.getProjection().fromLatLngToDivPixel(latlng);

  if (typeof this.iconAnchor_ === 'object' && this.iconAnchor_.length === 2) {
    pos.x -= this.iconAnchor_[0];
    pos.y -= this.iconAnchor_[1];
  } else {
    pos.x -= parseInt(this.width_ / 2, 10);
    pos.y -= parseInt(this.height_ / 2, 10);
  }
  return pos;
};

ClusterIcon.prototype.draw = function () {
  if (this.visible_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.top = pos.y + 'px';
    this.div_.style.left = pos.x + 'px';
  }
};

ClusterIcon.prototype.hide = function () {
  if (this.div_) {
    this.div_.style.display = 'none';
  }
  this.visible_ = false;
};

ClusterIcon.prototype.show = function () {
  if (this.div_) {
    var pos = this.getPosFromLatLng_(this.center_);
    this.div_.style.cssText = this.createCss(pos);
    this.div_.style.display = '';
  }
  this.visible_ = true;
};

ClusterIcon.prototype.remove = function () {
  this.setMap(null);
};

ClusterIcon.prototype.onRemove = function () {
  if (this.div_ && this.div_.parentNode) {
    this.hide();
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  }
};

ClusterIcon.prototype.setSums = function (sums) {
  this.sums_ = sums;
  this.text_ = sums.text;
  this.index_ = sums.index;
  if (this.div_) {
    this.div_.innerHTML = sums.text;
  }

  this.useStyle();
};

ClusterIcon.prototype.useStyle = function () {
  var index = Math.max(0, this.sums_.index - 1);
  index = Math.min(this.styles_.length - 1, index);
  var style = this.styles_[index];
  this.url_ = style['url'];
  this.height_ = style['height'];
  this.width_ = style['width'];
  this.textColor_ = style['textColor'];
  this.anchor_ = style['anchor'];
  this.textSize_ = style['textSize'];
  this.backgroundPosition_ = style['backgroundPosition'];
  this.iconAnchor_ = style['iconAnchor'];
};

ClusterIcon.prototype.setCenter = function (center) {
  this.center_ = center;
};

ClusterIcon.prototype.createCss = function (pos) {
  var style = [];
  style.push('background-image:url(' + this.url_ + ');');
  var backgroundPosition = this.backgroundPosition_ ? this.backgroundPosition_ : '0 0';
  style.push('background-position:' + backgroundPosition + ';');

  if (typeof this.anchor_ === 'object') {
    if (typeof this.anchor_[0] === 'number' && this.anchor_[0] > 0 && this.anchor_[0] < this.height_) {
      style.push('height:' + (this.height_ - this.anchor_[0]) + 'px; padding-top:' + this.anchor_[0] + 'px;');
    } else if (typeof this.anchor_[0] === 'number' && this.anchor_[0] < 0 && -this.anchor_[0] < this.height_) {
      style.push('height:' + this.height_ + 'px; line-height:' + (this.height_ + this.anchor_[0]) + 'px;');
    } else {
      style.push('height:' + this.height_ + 'px; line-height:' + this.height_ + 'px;');
    }
    if (typeof this.anchor_[1] === 'number' && this.anchor_[1] > 0 && this.anchor_[1] < this.width_) {
      style.push('width:' + (this.width_ - this.anchor_[1]) + 'px; padding-left:' + this.anchor_[1] + 'px;');
    } else {
      style.push('width:' + this.width_ + 'px; text-align:center;');
    }
  } else {
    style.push('height:' + this.height_ + 'px; line-height:' + this.height_ + 'px; width:' + this.width_ + 'px; text-align:center;');
  }

  var txtColor = this.textColor_ ? this.textColor_ : 'black';
  var txtSize = this.textSize_ ? this.textSize_ : 11;

  style.push('cursor:pointer; top:' + pos.y + 'px; left:' + pos.x + 'px; color:' + txtColor + '; position:absolute; font-size:' + txtSize + 'px; font-family:Arial,sans-serif; font-weight:bold');
  return style.join('');
};

window['MarkerClusterer'] = MarkerClusterer;
MarkerClusterer.prototype['addMarker'] = MarkerClusterer.prototype.addMarker;
MarkerClusterer.prototype['addMarkers'] = MarkerClusterer.prototype.addMarkers;
MarkerClusterer.prototype['clearMarkers'] = MarkerClusterer.prototype.clearMarkers;
MarkerClusterer.prototype['fitMapToMarkers'] = MarkerClusterer.prototype.fitMapToMarkers;
MarkerClusterer.prototype['getCalculator'] = MarkerClusterer.prototype.getCalculator;
MarkerClusterer.prototype['getGridSize'] = MarkerClusterer.prototype.getGridSize;
MarkerClusterer.prototype['getExtendedBounds'] = MarkerClusterer.prototype.getExtendedBounds;
MarkerClusterer.prototype['getMap'] = MarkerClusterer.prototype.getMap;
MarkerClusterer.prototype['getMarkers'] = MarkerClusterer.prototype.getMarkers;
MarkerClusterer.prototype['getMaxZoom'] = MarkerClusterer.prototype.getMaxZoom;
MarkerClusterer.prototype['getStyles'] = MarkerClusterer.prototype.getStyles;
MarkerClusterer.prototype['getTotalClusters'] = MarkerClusterer.prototype.getTotalClusters;
MarkerClusterer.prototype['getTotalMarkers'] = MarkerClusterer.prototype.getTotalMarkers;
MarkerClusterer.prototype['redraw'] = MarkerClusterer.prototype.redraw;
MarkerClusterer.prototype['removeMarker'] = MarkerClusterer.prototype.removeMarker;
MarkerClusterer.prototype['removeMarkers'] = MarkerClusterer.prototype.removeMarkers;
MarkerClusterer.prototype['resetViewport'] = MarkerClusterer.prototype.resetViewport;
MarkerClusterer.prototype['repaint'] = MarkerClusterer.prototype.repaint;
MarkerClusterer.prototype['setCalculator'] = MarkerClusterer.prototype.setCalculator;
MarkerClusterer.prototype['setGridSize'] = MarkerClusterer.prototype.setGridSize;
MarkerClusterer.prototype['setMaxZoom'] = MarkerClusterer.prototype.setMaxZoom;
MarkerClusterer.prototype['onAdd'] = MarkerClusterer.prototype.onAdd;
MarkerClusterer.prototype['draw'] = MarkerClusterer.prototype.draw;

Cluster.prototype['getCenter'] = Cluster.prototype.getCenter;
Cluster.prototype['getSize'] = Cluster.prototype.getSize;
Cluster.prototype['getMarkers'] = Cluster.prototype.getMarkers;

ClusterIcon.prototype['onAdd'] = ClusterIcon.prototype.onAdd;
ClusterIcon.prototype['draw'] = ClusterIcon.prototype.draw;
ClusterIcon.prototype['onRemove'] = ClusterIcon.prototype.onRemove;

jQuery.noConflict();

(function ($, window, document, undefined) {
  $(document).foundation();

  function dd(variable, varName) {
    var varNameOutput;

    varName = varName || '';
    varNameOutput = varName ? varName + ':' : '';

    console.warn(varNameOutput, variable, ' (' + typeof variable + ')');
  }

  $(function () {
    $('.main-slider-container').slick({
      arrows: false,
      dots: true,
      adaptiveHeight: true
    });

    $('.video-button a').magnificPopup({
      type: 'iframe',
      disableOn: function () {
        if ($(window).width() < 600) {
          $('.video-button a').attr("target", "_blank");
          return false;
        }
        return true;
      },
      fixedContentPos: "auto"
    });

    $('.box-3-container').slick({
      arrows: false,
      dots: true,
      responsive: [{
        breakpoint: 700,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }]
    });

    jQuery.easing['jswing'] = jQuery.easing['swing'];
    jQuery.extend(jQuery.easing, {
      def: 'easeOutQuint',
      swing: function (x, t, b, c, d) {
        return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
      },
      easeOutQuint: function (x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
      }
    });

    $('.clear-search').click(function () {
      $(this).prev().val(' ');
    });

    $('.page-footer .section-footer_1 > a').bind('click', function (event) {
      var $anchor = $(this);
      $('html, body').stop().animate({
        scrollTop: 0
      }, 1000, 'easeOutQuint');
      event.preventDefault();
    });

    $('.searchandfilter input[type="checkbox"]').on('change', function () {
      if ($(this).attr("checked")) {
        $(this).parent().addClass('checked');
      } else {
        $(this).parent().removeClass('checked');
      }
    });

    $('.slider-articles').slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      responsive: [{
        breakpoint: 800,
        settings: {
          slidesToShow: 2
        }
      }, {
        breakpoint: 650,
        settings: {
          slidesToShow: 1,
          dots: true,
          arrows: false

        }
      }]
    });

    $('.slider-articles .box-1 figure, .slider-articles .slick-next').matchHeight(true);

    $('.welcome-video .columns').matchHeight(true);
    $('.main-slider-container .columns').matchHeight(true);

    $('.registration-form-event').hide();
    $('.registration-form-trigger').click(function (e) {
      e.preventDefault();

      $('.registration-form-event').slideDown(500, function () {}.bind(this));

      $(this).hide();
    });

    var $viewMoreContainer = $('.page-pagination'),
        $viewMoreButton = $viewMoreContainer.find('a');

    if ($viewMoreButton.length) {

      var $infinite = $('.js-infinite').infiniteScroll({
        append: '.js-article',
        status: '.scroller-status',

        path: '.page-pagination a',
        loadOnScroll: false
      });
      $viewMoreButton.on('click', function () {
        $infinite.infiniteScroll('loadNextPage');

        return false;
      });

      $infinite.on('last.infiniteScroll', function (event, response, path) {
        $viewMoreContainer.hide();
      });
    }

    function companies_scroll_to(el) {
      console.log(el);

      $('#companies-accordion').foundation('toggle', $('#dlc' + el));

      setTimeout(function () {
        $('html, body').stop().animate({
          scrollTop: $("#companies-accordion li[data-id='" + el + "']").offset().top
        }, 1000, 'swing');
      }, 150);
    }

    var $companiesViewMoreContainer = $('.companies-page-pagination'),
        $companiesViewMoreButton = $companiesViewMoreContainer.find('a');

    if ($companiesViewMoreButton.length) {
      var $companiesInfinite = $('.js-companies-infinite').infiniteScroll({
        append: '.js-companies-article',
        status: '.scroller-status',

        path: '.companies-page-pagination a',
        loadOnScroll: false,
        history: false
      });

      $companiesViewMoreButton.on('click', function () {
        $companiesInfinite.infiniteScroll('loadNextPage');

        return false;
      });

      $companiesInfinite.on('last.infiniteScroll', function (event, response, path) {
        $companiesViewMoreContainer.hide();
      });

      $companiesInfinite.on('append.infiniteScroll', function (event, response, path, items) {
        if (typeof companiesMap !== 'undefined') {
          $.each(items, function (index, value) {
            var companiesMapLatLng = new google.maps.LatLng($(value).data('lat'), $(value).data('lng'));
            var companiesMapMarker = new google.maps.Marker({
              position: companiesMapLatLng,
              customInfo: $(value).data('id')
            });
            companiesMapMarkers.push(companiesMapMarker);
            companiesMapBounds.extend(companiesMapLatLng);
            companiesMapMarkerCluster.addMarker(companiesMapMarker);

            google.maps.event.addListener(companiesMapMarker, 'click', function () {

              companies_scroll_to(this.customInfo);
            });
          });
        }

        Foundation.reInit(['accordion']);
      });

      $('.companies-accordion-close').click(function (e) {
        e.preventDefault();

        companies_scroll_to($(this).attr('href'));
      });
    }

    if ($('#companies-map').length && companies_markers) {
      var companiesMapOptions = {
        'zoom': 13,
        'mapTypeId': google.maps.MapTypeId.ROADMAP
      };

      var companiesMap = new google.maps.Map(document.getElementById("companies-map"), companiesMapOptions);

      var companiesMapMarkers = [];

      var companiesMapBounds = new google.maps.LatLngBounds();

      $.each(companies_markers, function (index, value) {

        var companiesMapLatLng = new google.maps.LatLng(value['lat'], value['lng']);
        var companiesMapMarker = new google.maps.Marker({ position: companiesMapLatLng, customInfo: value['id'] });
        companiesMapMarkers.push(companiesMapMarker);
        companiesMapBounds.extend(companiesMapLatLng);

        google.maps.event.addListener(companiesMapMarker, 'click', function () {

          companies_scroll_to(this.customInfo);
        });
      });

      companiesMap.fitBounds(companiesMapBounds);

      var companiesMapMarkerCluster = new MarkerClusterer(companiesMap, companiesMapMarkers, { imagePath: cht_wp.theme + "img/m" });
    }
  });
})(jQuery, window, document);
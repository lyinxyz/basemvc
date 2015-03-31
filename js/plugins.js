/**
 * [description]这边只是很简陋的实现了类的继承机制。如果对类的实现有兴趣可以参考文章"javascript oo实现"
 * @param  {[type]} ) var _mix [description]
 * @return {[type]}   [description]
 */
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function () {
    var initializing = false,
        fnTest = /xyz/.test(function () {
            xyz;
        }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    this.Class = function () {};
    // Create a new Class that inherits from this class
    Class.extend = function (prop) {
        var _super = this.prototype;
        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this._super;
                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];
                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, prop[name]) : prop[name];
        }
        // The dummy class constructor
        function Class() {
                // All construction is actually done in the init method
                if (!initializing && this.init)
                    this.init.apply(this, arguments);
            }
            // Populate our constructed prototype object
        Class.prototype = prototype;
        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;
        // And make this class extendable
        Class.extend = arguments.callee;
        return Class;
    };
})();
/**
 * [init description]
 * @param  {[type]} config)  {this.__config [description]
 * @param  {[type]} get:     function      (key) {return this.__config[key]} [description]
 * @param  {[type]} set:     function      (key, value) {this.__config[key] [description]
 * @param  {[type]} bind:    function      ()    {}   [description]
 * @param  {[type]} render:  function      ()    {}   [description]
 * @param  {[type]} destroy: function      ()    {}   [description]
 * @return {[type]}          [description]
 */
var Base = Class.extend({
    init: function (config) {
        //自动保存配置项
        this.__config = config
        this.bind()
        this.render()
    },
    //可以使用get来获取配置项
    get: function (key) {
        return this.__config[key]
    },
    //可以使用set来设置配置项
    set: function (key, value) {
        this.__config[key] = value
    },
    bind: function () {},
    render: function () {

    },
    //定义销毁的方法，一些收尾工作都应该在这里
    destroy: function () {

    }
});
/**
 * 主要做了两件事，一个就是事件的解析跟代理，全部代理到parentNode上面。
 * 另外就是把render抽出来，用户只需要实现setUp方法。
 * 如果需要模板支持就在setUp里面调用render来渲染模板，并且可以通过setChuckdata来刷新模板，实现单向绑定。
 * [init description]
 * @param  {[type]}   config)         { his.__config [description]
 * @param  {[type]}   _delegateEvent: function() {}
 * @param  {Function} fn              [description]
 * @param  {[type]}   select          [description]
 * @param  {[type]}   type            var parentNode [description]
 * @return {[type]}                   [description]
 */
var Class = Base.extend({
    EVENTS: {},
    template: '',
    init: function (config) {
        //存储配置项
        this.__config = config
            //解析代理事件
        this._delegateEvent()
        this.setUp()
    },
    //循环遍历EVENTS，使用jQuery的delegate代理到parentNode
    _delegateEvent: function () {
        var self = this
        var events = this.EVENTS || {}
        var eventObjs, fn, select, type
        var parentNode = this.get('parentNode') || $(document.body)

        for (select in events) {
            eventObjs = events[select]

            for (type in eventObjs) {
                fn = eventObjs[type]

                parentNode.delegate(select, type, function (e) {
                    fn.call(null, self, e)
                })
            }
        }
    },
    //支持underscore的极简模板语法
    //用来渲染模板，这边是抄的underscore的。非常简单的模板引擎，支持原生的js语法
    _parseTemplate: function (str, data) {
        /**
         * http://ejohn.org/blog/javascript-micro-templating/
         * https://github.com/jashkenas/underscore/blob/0.1.0/underscore.js#L399
         */
        var fn = new Function('obj',
            'var p=[],print=function(){p.push.apply(p,arguments);};' +
            'with(obj){p.push(\'' + str
            .replace(/[\r\t\n]/g, " ")
            .split("<%").join("\t")
            .replace(/((^|%>)[^\t]*)'/g, "$1\r")
            .replace(/\t=(.*?)%>/g, "',$1,'")
            .split("\t").join("');")
            .split("%>").join("p.push('")
            .split("\r").join("\\'") +
            "');}return p.join('');")
        return data ? fn(data) : fn
    },
    //提供给子类覆盖实现
    setUp: function () {
        this.render()
    },
    //用来实现刷新，只需要传入之前render时的数据里的key还有更新值，就可以自动刷新模板
    setChuckdata: function (key, value) {
        var self = this
        var data = self.get('__renderData')
            //更新对应的值
        data[key] = value
        if (!this.template) return;
        //重新渲染
        var newHtmlNode = $(self._parseTemplate(this.template, data))
            //拿到存储的渲染后的节点
        var currentNode = self.get('__currentNode')
        if (!currentNode) return;
        //替换内容
        currentNode.replaceWith(newHtmlNode)
        self.set('__currentNode', newHtmlNode)
    },
    //使用data来渲染模板并且append到parentNode下面
    render: function (data) {
        var self = this
            //先存储起来渲染的data,方便后面setChuckdata获取使用
        self.set('__renderData', data)
        if (!this.template) return;
        //使用_parseTemplate解析渲染模板生成html
        //子类可以覆盖这个方法使用其他的模板引擎解析
        var html = self._parseTemplate(this.template, data)
        var parentNode = this.get('parentNode') || $(document.body)
        var currentNode = $(html)
            //保存下来留待后面的区域刷新
            //存储起来，方便后面setChuckdata获取使用
        self.set('__currentNode', currentNode)
        parentNode.append(currentNode)
    },
    destroy: function () {
        var self = this
            //去掉自身的事件监听
        self.off()
            //删除渲染好的dom节点
        self.get('__currentNode').remove()
            //去掉绑定的代理事件
        var events = self.EVENTS || {}
        var eventObjs, fn, select, type
        var parentNode = self.get('parentNode')

        for (select in events) {
            eventObjs = events[select]

            for (type in eventObjs) {
                fn = eventObjs[type]
                parentNode.undelegate(select, type, fn)
            }
        }
    }
});
// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

;
(function($) {
    $.fn.focusPoint = function(options) {
        var settings = $.extend({
            //These are the defaults.
            reCalcOnWindowResize: true,
            throttleDuration: 17 //ms - set to 0 to disable throttling
        }, options);
        return this.each(function() {
            //Initial adjustments
            var container = $(this), isThrottled = false;
            //Replace basic css positioning with more accurate version
            container.removeClass('focus-left-top focus-left-center focus-left-bottom focus-center-top focus-center-center focus-center-bottom focus-right-top focus-right-center focus-right-bottom');
            //Focus image in container
            container.adjustFocus();
            if (settings.reCalcOnWindowResize) {
                //Recalculate each time the window is resized
                $(window).resize(function() {
                    //Throttle redraws
                    if (settings.throttleDuration > 0){
                        if (isThrottled) { return; }
                        isThrottled = true;
                        setTimeout(function () {
                            isThrottled = false;
                            container.adjustFocus();
                        }, settings.throttleDuration);
                    }
                    container.adjustFocus();
                });
            }
        });
    };
    $.fn.adjustFocus = function() {
        return this.each(function() {
            //Declare variables at top of scope
            var containerW,
                containerH,
                image,
                imageW,
                imageH,
                self,
                imageTmp,
                wR,
                hR,
                hShift,
                vShift,
                containerCenterX,
                focusFactorX,
                scaledImageWidth,
                focusX,
                focusOffsetX,
                xRemainder,
                containerXRemainder,
                containerCenterY,
                focusFactorY,
                scaledImageHeight,
                focusY,
                focusOffsetY,
                yRemainder,
                containerYRemainder;
            //Collect dimensions
            containerW = $(this).width();
            containerH = $(this).height();
            image = $(this).find('img').first();
            imageW = $(this).data('imageW');
            imageH = $(this).data('imageH');
            //Get image dimensions if not set on container
            if (!imageW || !imageH) {
                self = this;
                imageTmp = new Image();
                imageTmp.onload = function(){
                    $(self).data('imageW', this.width);
                    $(self).data('imageH', this.height);
                    $(self).adjustFocus(); //adjust once image is loaded - may cause a visible jump
                };
                imageTmp.src = image.attr('src');
                return false; //Don't proceed right now, will try again once image has loaded
            }
            if (!(containerW > 0 && containerH > 0 && imageW > 0 && imageH > 0)) {
                //Need dimensions to proceed
                return false;
            }
            //Which is over by more?
            wR = imageW / containerW;
            hR = imageH / containerH;
            //Minimise image while still filling space
            if (imageW > containerW && imageH > containerH) {
                if (wR > hR) {
                    image.css('max-width', '');
                    image.css('max-height', '100%');
                } else {
                    image.css('max-width', '100%');
                    image.css('max-height', '');
                }
            } else {
                image.css('max-width', '');
                image.css('max-height', '');
            }
            //Amount position will be shifted
            hShift = 0;
            vShift = 0;
            if (wR > hR) {
                //Container center in px
                containerCenterX = Math.floor(containerW / 2);
                //Focus point of resize image in px
                focusFactorX = (Number($(this).data('focus-x')) + 1) / 2;
                //Can't use width() as images may be display:none
                scaledImageWidth = Math.floor(imageW / hR);
                focusX = Math.floor(focusFactorX * scaledImageWidth);
                //Calculate difference beetween focus point and center
                focusOffsetX = focusX - containerCenterX;
                //Reduce offset if necessary so image remains filled
                xRemainder = scaledImageWidth - focusX;
                containerXRemainder = containerW - containerCenterX;
                if (xRemainder < containerXRemainder){
                    focusOffsetX -= containerXRemainder - xRemainder;
                }
                if (focusOffsetX < 0) {
                    focusOffsetX = 0;
                }
                //Shift to left
                hShift = focusOffsetX * -1;
            } else if (wR < hR) {
                //Container center in px
                containerCenterY = Math.floor(containerH / 2);
                //Focus point of resize image in px
                focusFactorY = (Number($(this).data('focus-y')) + 1) / 2;
                //Can't use width() as images may be display:none
                scaledImageHeight = Math.floor(imageH / wR);
                focusY = scaledImageHeight - Math.floor(focusFactorY * scaledImageHeight);
                //Calculate difference beetween focus point and center
                focusOffsetY = focusY - containerCenterY;
                //Reduce offset if necessary so image remains filled
                yRemainder = scaledImageHeight - focusY;
                containerYRemainder = containerH - containerCenterY;
                if (yRemainder < containerYRemainder) {
                    focusOffsetY -= containerYRemainder - yRemainder;
                }
                if (focusOffsetY < 0) {
                    focusOffsetY = 0;
                }
                //Shift to top
                vShift = focusOffsetY * -1;
            }
            image.css('left', hShift + 'px');
            image.css('top', vShift + 'px');
        });
    };
})(jQuery);

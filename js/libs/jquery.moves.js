/**
 * [description]
 * @param  {[type]} $        [description]
 * @param  {[type]} window   [description]
 * @param  {[type]} document [description]
 * @return {[type]}          [description]
 */
(function ($, window, document){
    
    $.fn.moves = function (options){
        $.fn.moves.init(this, $.extend({}, $.fn.moves.defaults, options));
        return this;
    };
    
    $.fn.moves.items = [];
    $.fn.moves.loaded = false;
    
    $.fn.moves.defaults = {
        offset: 150,
        opacity: 0,
        transition: "all 1s ease, opacity 1.5s ease",
        transformStyle: 'preserve-3d',
        transformOrigin: false,
        perspective: 1000
    };

    $.fn.moves.init = function (items, settings){
        items.each(function() {
            var $item = $(this),
                params = $item.params = $.extend({}, settings, $item.data());
                
            $item.params.opacity = $item.params.opacity / 100;
            $item.data('top', $item.offset().top);
                
            params.transition = crossBrowser('transition', params.transition, 'transform');
            $item.css(params.transition);
            
            $.fn.moves.items.push($item);
        });
        
        // function for adding vendor prefixes
        function crossBrowser(property, value, prefix) {
        
            function ucase(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }
            
            var vendor = ['webkit','moz','ms','o'],
                properties = {};
                
            for(var i = 0; i < vendor.length; i++) {
                if(prefix) {
                    value = value.replace(prefix, '-' + vendor[i] + '-' + prefix);
                }
                properties[ucase(vendor[i]) + ucase(property)] = value;
            }
            properties[property] = value;
            
            return properties;
        }
        
        // add event handlers
        if(!$.fn.moves.loaded) {
            $.fn.moves.loaded = true;
            
            var didScroll = false,
                oldScroll = 0,
                oldHeight = $(window).height(),
                oldWidth = $(window).width(),
                oldDocHeight = $(document).height(),
                resizing;
        
            // naughty way of avoiding vertical scrollbars when items slide in/out from the side
            if($('body').width() === $(window).width()) {
                $('body').css('overflow-x','hidden');
            }
                
            $(window).resize(function() {
                clearTimeout(resizing);
                resizing = setTimeout(function() {
                    var height = $(window).height(),
                        width = $(window).width(),
                        direction = (oldHeight > height) ? direction = 'up' : 'down',
                        items = $.fn.moves.items;
                    
                    oldHeight = height;
                    
                    // responsive support - reassign position values on resize
                    if(oldWidth !== width) {
                        for(var i = 0; i < items.length; i++) {
                            items[i].css(crossBrowser('transform', '')).css(crossBrowser('transition', ''));
                        }
                        
                        // wait for responsive magic to finish
                        var stillResizing = setInterval(function() {
                            var docHeight = $(document).height();
                            if(docHeight === oldDocHeight) {
                                window.clearInterval(stillResizing);
                                for(var i = 0; i < items.length; i++) {
                                    items[i].data('top', items[i].offset().top);
                                    items[i].css(items[i].params.transition);
                                }
                                movesIt(direction);
                            }
                            oldDocHeight = docHeight;
                        }, 500);
                    } 
                    else {
                        movesIt(direction);
                    }
                    oldWidth = width;
                }, 500);
            });
            
            $(window).on('load', function() {
                movesIt();
                
                // throttle scroll handler
                $(window).scroll(function() {
                    didScroll = true;
                });
                setInterval(function() {
                    if ( didScroll ) {
                        didScroll = false;
                        var scrolltop = $(window).scrollTop(),
                            direction = (scrolltop < oldScroll) ? direction = 'up' : 'down';
                        oldScroll = scrolltop;
                        movesIt(direction);
                    }
                }, 250);
            });
        }
        
        function movesIt(direction) {
            for(var i = 0; i < $.fn.moves.items.length; i++) {
                var $item = $.fn.moves.items[i],
                    params = $item.params,
                    height = $(window).height(),
                    // if direction isn't set, set offset to 0 to avoid hiding objects that are above the fold
                    offset = (!direction || direction === 'down' && $item.css('opacity') === '1') ? 0 : params.offset,
                    itemtop = $(window).scrollTop() + height - $item.data('top');
                    
                // offset in %
                if(typeof offset === 'string' && offset.indexOf('%')) {
                    offset = parseInt(offset) / 100 * height;
                }
                
                if(itemtop < offset) {
                    if(params.opacity !== false) {
                        $item.css({opacity: params.opacity});
                    }
                    
                    var transforms = [],
                        properties = ['move','move3D','moveX','moveY','moveZ','rotate','rotate3d','rotateX','rotateY','rotateZ','scale','scale3d','scaleX','scaleY','skew','skewX','skewY'];
                        
                    for(var p = 0; p < properties.length; p++) {
                        if(typeof params[properties[p]] !== "undefined") {
                            transforms[properties[p]] = params[properties[p]];
                        }
                    }
                    
                    var transform = '';
                    for(var t in transforms) {
                        transform += t.replace('move', 'translate') + '(' + transforms[t] + ') ';
                    }
                    if(transform) {
                        $item.css(crossBrowser('transform', transform));
                        $item.parent().css(crossBrowser('perspective', params.perspective));
                        //$item.parent().css(crossBrowser('transformStyle', params.transformstyle));
                    
                        if(params.transformOrigin) {
                            $item.css(crossBrowser('transformOrigin', params.transformOrigin));
                        }
                    }
                }
                else {
                    $item.css('opacity', 1).css(crossBrowser('transform', ''));
                }
            }
        }
    };

}( jQuery, window, document ));

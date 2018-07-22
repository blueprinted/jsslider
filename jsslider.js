(function(factory){
    factory(window.jQuery);
}(function($){
    'use strict';
    var slider;
    slider = function(element, options) {
        var self = this;
        self._slider = $(element);
        self.banItems; /* banner条目集 */
        self.navItems; /* 指示条集 */
        self.navWrap; /* 指示条容器 */
        self.navBgWrap; /* 透明背景容器 */
        self.prevOneBtn; /* 向前一个按钮 */
        self.nextOneBtn; /* 向后一个按钮 */
        self.prevPageBtn; /* 向前一页按钮 */
        self.nextPageBtn; /* 向后一页按钮 */
        self.length; /* banner条目数量 */
        self.curIndex; /* 当前索引 */
        self.curPage; /* 当前页 */
        self.pages; /* 总页数 */
        self.navItemWidth; /* 指示条元素宽 */
        self.opts; /* 参数集 */
        self.timer; /* 计时器 */
        self.timer2; /* 附加计时器 */
        self.offset; /* 指示条偏移值 */
        self.initialed = false; /* 初始化标识 */
        self.sliding = false; /* 滑动标识 */
        self.slideQueue = [];
        self.slideQueueLock = false;
        self.init(options);
        self.run();
    }
    slider.prototype = {
        constructor: slider,
        init: function (options) {
        var self = this;
        self.initialed = self._slider.attr('initialed');
        if(!self.initialed) {
            self.opts = $.extend($.fn.slider.defaults, options);/* 初始化参数 */
            self.setCurIndex(self.getCurIndex());/* 初始索引置0 */
            self.banItems = self._slider.find('.' + self.opts.banItemClass);
            self.navItems = self._slider.find('.' + self.opts.navItemClass);
            self.navWrap = self._slider.find('.' + self.opts.navWrapClass);
            self.navBgWrap = self._slider.find('.' + self.opts.navBgWrapClass);

            self.setLength(self.getLength());
            self.setNavItemWidth(self.getNavItemWidth());

            self.banItems.css('z-index', '1').eq(self.getCurIndex()).css('z-index','0');
            self.navWrap.css('z-index', '1');
            self.navBgWrap.css('z-index', '1');
            self.navItems.parent().css('position', 'relative').css('width', self.navItems.length*self.getNavItemWidth() - parseInt(self.navItems.eq(0).css('marginRight'))).css({height:self.navItems.eq(0).height()});
            self.navWrap.css({width:self.navItems.parent().width, height:self.navItems.eq(0).height()});
            self.navItems.css('position', 'absolute');
            self.navItems.each(function(){$(this).css({'top':0, 'left':$(this).index() * self.getNavItemWidth()})});
            self.navItems.eq(self.navItems.length - 1).css('margin-right', 0);

            self.prevOneBtn = self._slider.find('.' + self.opts.prevOneBtnClass);
            self.nextOneBtn = self._slider.find('.' + self.opts.nextOneBtnClass);
            self.prevPageBtn = self._slider.find('.' + self.opts.prevPageBtnClass);
            self.nextPageBtn = self._slider.find('.' + self.opts.nextPageBtnClass);

            /* 初始化分页 */
            self.setPages(self.setPages());
            self.setCurPage(self.getCurPage());/* 设置当前页码为1 */
            self.setOffset(self.getOffset());/* 设置当前偏移值为0 */

            /* 初始化显示 */
            self.banItems.hide();
            self.banItems.eq(self.getCurIndex()).show();
            self.navItems.removeClass(self.opts.curClass);
            self.navItems.eq(self.getCurIndex()).addClass(self.opts.curClass);

            if(self.opts.event == 'hover') {
                self.navItems.bind('mouseover',function() {
  					        self.stop();
  					        var _index = $(this).index();
                    self.slideQueueAdd(_index, false, self.getSlidTimeout()).slideQueueExec();
                });
  			    }
            self.navItems.bind('click',function(){
                self.stop();
                var _index = $(this).index();
                self.slideQueueAdd(_index, false, self.getSlidTimeout()).slideQueueExec();
            }).bind('mouseleave',function(){
                self.start();
            });

            self.prevOneBtn.mouseenter(function(){self.stop()}).mouseleave(function(){self.start()}).click(function(){
              self.slideQueueAdd(self.getPrevIndex(), false, self.getSlidTimeout()).slideQueueExec();
            });
            self.nextOneBtn.mouseenter(function(){self.stop()}).mouseleave(function(){self.start()}).click(function(){
              self.slideQueueAdd(self.getNextIndex(), false, self.getSlidTimeout()).slideQueueExec();
            });
            self.prevPageBtn.mouseenter(function(){self.stop()}).mouseleave(function(){self.start()}).click(function(){self.prevPage()});
            self.nextPageBtn.mouseenter(function(){self.stop()}).mouseleave(function(){self.start()}).click(function(){self.nextPage()});

            self._slider.attr('initialed','true');
            self.initialed = true;
        }
    },
    /* 设置长度 */
  	setLength: function(_length) {
        var self = this;
        self.length = _length;
        return self.length;
  	},
  	/* 获取长度 */
    getLength: function() {
        var self = this;
        return self.initialed ? self.length : self._slider.find('.' + self.opts.banItemClass).length;
  	},
  	/* 设置当前索引 */
  	setCurIndex: function(_index){
        var self = this;
        self.curIndex = _index;
        return self.curIndex;
  	},
  	/* 获取当前索引 */
  	getCurIndex: function(){
        var self = this;
        var _index = typeof self.curIndex == 'undefined' ? 0 : parseInt(self.curIndex);
        _index = isNaN(_index) ? 0 : _index;
        return _index;
  	},
  	/* (根据当前索引)获取上一个索引 */
  	getPrevIndex: function(){
        var self = this;
        var _preIndex;
        var _curIndex = self.getCurIndex();
        var _length = self.getLength();
        if(_curIndex < 1){
            _preIndex = _length - 1;
        }else{
            _preIndex = _curIndex - 1;
        }
        return _preIndex;
  	},
  	/* (根据当前索引)获取下一个索引 */
    getNextIndex: function() {
        var self = this;
        var _nextIndex;
        var _curIndex = self.getCurIndex();
        var _length = self.getLength();

        if(_curIndex >= _length - 1) {
            _nextIndex = 0;
        } else {
            _nextIndex = _curIndex + 1;
        }
        return _nextIndex;
  	},
  	/* 设置navItem的宽度 */
  	setNavItemWidth: function(_width) {
        var self = this;
        self.navItemWidth = _width;
        return self.navItemWidth;
  	},
  	/* 获取navItem的宽度 */
  	getNavItemWidth: function() {
        var self = this;
        if(self.initialed) {
  			    return self.navItemWidth;
        }
        if(!self.navItems) {
  			    self.navItems = self._slider.find('.' + self.opts.navItemClass);
        }
        var _width = $(self.navItems).eq(0).width();

        var _margin_left = parseFloat($(self.navItems).eq(0).css('margin-left'));
        _margin_left = isNaN(_margin_left) ? 0 : _margin_left;
        var _margin_right = parseFloat($(self.navItems).eq(0).css('margin-right'));
        _margin_right = isNaN(_margin_right) ? 0 : _margin_right;
        var _padding_left = parseFloat($(self.navItems).eq(0).css('padding-left'));
        _padding_left = isNaN(_padding_left) ? 0 : _padding_left;
        var _padding_right = parseFloat($(self.navItems).eq(0).css('padding-right'));
        _padding_right = isNaN(_padding_right) ? 0 : _padding_right;
        var _border_left_width = parseFloat($(self.navItems).eq(0).css('border-left-width'));
        _border_left_width = isNaN(_border_left_width) ? 0 : _border_left_width;
        var _border_right_width = parseFloat($(self.navItems).eq(0).css('border-right-width'));
        _border_right_width = isNaN(_border_right_width) ? 0 : _border_right_width;

        _width = _width + _margin_left + _margin_right + _padding_left + _padding_right + _border_left_width + _border_right_width;
        return _width;
    },
  	/* 获取navItem的偏移值 */
    getOffset: function() {
        var self = this;
        var _offset = typeof self.offset == 'undefined' ? 0 : parseInt(self.offset);
        _offset = isNaN(_offset) ? 0 : _offset;
        return _offset;
  	},
  	/* 设置navItem的偏移值 */
    setOffset: function(_offset) {
        var self = this;
        self.offset = _offset;
        return self.offset;
  	},
  	/* 获取总页数 */
  	getPages: function() {
        var self = this;
        return self.initialed ? self.pages : Math.ceil(self.getLength()/self.opts.perpage);
  	},
  	/* 设置总页数 */
  	setPages: function(_pages) {
        var self = this;
        self.pages = _pages;
        return self.pages;
  	},
  	/* 设置当前页 */
  	setCurPage: function(_page) {
        var self = this;
        self.curPage = _page;
        return self.curPage;
  	},
  	/* 获取当前页码 */
  	getCurPage: function() {
        var self = this;
        var _curPage = typeof self.curPage == 'undefined' ? 1 : parseInt(self.curPage);
        _curPage = isNaN(_curPage) ? 1 : _curPage;
        return _curPage;
  	},
  	/* 获取下一页码 */
  	getNextPage: function() {
        var self = this;
        var _curPage = self.getCurPage();
        return  _curPage < self.getPages() ? _curPage + 1 : 1;
  	},
  	/* 获取上一页码 */
  	getPrevPage: function() {
        var self = this;
        var _curPage = self.getCurPage();
        return  _curPage > 1 ? _curPage - 1 : self.getPages();
  	},
  	/* 跳转页面 */
  	page: function(_page, hasSilde) {
        var self = this;
        var hasSilde = typeof hasSilde == 'undefined' ? false : (hasSilde ? true : false);
        var _pages = self.getPages();/* 总页数 */
        var _curPage = self.getCurPage();/* 当前页 */
        var _navItemWidth = self.getNavItemWidth();
        var _offset = self.getOffset();/* 当前偏移值 */
        var r_offset = 0;/* 相对偏移(由页码差值确定),初始置0 */
        if(_page == _curPage || _page < 1 || _page > _pages || _pages < 2)
            return false;

        /* 确定偏移量 */
        r_offset = -1 * (_page - _curPage) * self.opts.perpage * _navItemWidth; /* 计算相对偏移 */
        _offset += r_offset;
        var maxOffset = 0, minOffset = -1 * (self.getLength() - self.opts.perpage) * _navItemWidth;
        _offset = _offset > maxOffset ? maxOffset : (_offset < minOffset ? minOffset : _offset); /* 防止偏移量溢出 */

        /* 翻页动作 */
        $(self.navItems).each(function(){$(this).css('left', _offset + $(this).index() * self.getNavItemWidth())});

        if(!hasSilde){
            /* 计算滑动到的索引 */
            var _index = 0;
            _index = parseInt(-1 * _offset / _navItemWidth);
            if(_page > _curPage && _index <= self.getCurIndex() || _page < _curPage && self.getCurIndex() - _index < opts.perpage)
  				      _index = self.getCurIndex();
            self.slideQueueAdd(_index, true, self.getSlidTimeout()).slideQueueExec();

  		  }

        self.setOffset(_offset);
        self.setCurPage(_page);
  	},
  	/* 翻至下一页 */
  	nextPage: function() {
        var self = this;
        self.page(self.getNextPage());
  	},
  	/* 翻至上一页 */
  	prevPage: function() {
        var self = this;
        self.page(self.getPrevPage());
  	},
  	/* 获取索引所在页码 */
  	getIndexInPage: function(_index) {
        var self = this;
        var _index = typeof _index == 'undefined' ? self.getCurIndex() : _index;
        var _indexInPage = 0;
        var _offset = self.getOffset();/* 当前偏移 */

        var leftOffset = 0;
        var leftIndex = 0;/* 当前索引的左临界偏移及左临界索引 */
        leftOffset = _offset + self.getCurIndex() * self.getNavItemWidth();
        leftIndex = self.getCurIndex() - Math.ceil(leftOffset/self.getNavItemWidth());
        if(_index >= leftIndex && _index < leftIndex + self.opts.perpage) {
            _indexInPage = self.getCurPage();
        } else if(_index < leftIndex) {
            _indexInPage = self.getCurPage() - Math.ceil((leftIndex - _index)/self.opts.perpage);
            _indexInPage = _indexInPage < 1 ? 1 : _indexInPage;
        } else {
            _indexInPage = self.getCurPage() + Math.ceil((_index - leftIndex - self.opts.perpage + 1)/self.opts.perpage);
            _indexInPage = _indexInPage > self.getPages() ? self.getPages() : _indexInPage;
        }

        return _indexInPage;
  	},
    getSlidTimeout: function() {
      var self = this;
      var timeout = 0;;
      if (self.opts.effect == 'fade') {
        timeout = 450;
      } else {
        timeout = 0;
      }
      return timeout;
    },
  	/* 滑动方法 */
  	slid: function(index, hasPage) {
        var self = this;
        var hasPage = typeof hasPage == 'undefined' ? false : (hasPage ? true : false);
        var index = typeof index == 'undefined' ? -1 : (index >= self.length || index < 0 ? -1 : index);

        var _curIndex = self.getCurIndex();/* 切换前的索引(当前索引) */
        var _currIndexInPage = self.getIndexInPage(_curIndex);/* 当索引所在页 */

        if(self.sliding) {
          return false;
        }
        self.sliding = true;

        /* 下一个索引 */
        var _nextIndex = 0;

        if(index >= 0){
            _nextIndex = index;
        }else{
            _nextIndex = self.getNextIndex();
        }

        if(_nextIndex == _curIndex) {
            self.sliding = false;
            return false;
        }
        /* console.log('_curIndex = ' + getCurIndex() + ', _nextIndex = ' + _nextIndex); */
        var _nextIndexInPage = self.getIndexInPage(_nextIndex);/* 下一个索引所在页 */
        /* console.log('_currIndexInPage = ' + _currIndexInPage + ', _nextIndexInPage = ' + _nextIndexInPage + '\r\n'); */
        var flipPage = false;/* 翻页标识 */
        if(_currIndexInPage != _nextIndexInPage && !hasPage) {/* 需要翻页 */
            self.page(_nextIndexInPage, true);
            flipPage = true;
        }

        self.navItems.removeClass(self.opts.curClass);
        self.navItems.eq(_nextIndex).addClass(self.opts.curClass);
        if(self.opts.effect == 'fade') {
            self.banItems.eq(_curIndex).css('z-index', 1);
            self.banItems.eq(_nextIndex).css('z-index', 0);
            self.banItems.eq(_nextIndex).show();
            self.banItems.eq(_curIndex).fadeOut(400, function(){self.sliding=false});// fast:200, slow:600, default:400
        }else{
            self.banItems.hide();
            self.banItems.eq(_nextIndex).show(0,function(){self.sliding=false});
        }
        self.setCurIndex(_nextIndex);
  	},
    slideQueueExec: function (callback, timeout) {
      var self = this;
      if (self.slideQueueLock) {
        return false;
      }
      self.slideQueueLock = true;
      var args = self.slideQueue.shift();
      if (args) {
        self.slid(args[0], args[1]);
        setTimeout(function(){
          self.slideQueueLock = false;
          self.slideQueueExec(callback, timeout)
        }, args[2]);
      } else {
        self.slideQueueLock = false;
        if (typeof callback == 'function') {
          var timeout = typeof timeout == 'undefined' ? 0 : timeout;
          setTimeout(function(){callback()}, timeout);
        }
      }
      return self;
    },
    slideQueueAdd: function (index, hasPage, timeout) {
      var self = this;
      self.slideQueue.push([index, hasPage, timeout]);
      return self;
    },
  	/* 开始 */
  	start: function() {
        var self = this;
        try{
            clearInterval(self.timer);
        }catch(e){}
        if (self.opts.speed > 0) {
          self.timer = setInterval(function(){
            self.slideQueueAdd(-1, false, 0).slideQueueExec();
          }, self.opts.speed);
        }
  	},
  	/* 停止 */
  	stop: function() {
        var self = this;
        try{
            clearInterval(self.timer);
        }catch(e){}
  	},
    /* 运行 */
  	run: function(){
        var self = this;
        self.start();
  	}
  }
  $.fn.slider = function (option) {
        var args = Array.apply(null, arguments), retvals = [];
        args.shift();
        this.each(function () {
            var self = $(this), data = self.data('slider'), options = typeof option === 'object' && option, opts;
            if (!data) {
                opts = $.extend($.fn.slider.defaults, options, self.data());
                data = new slider(this, opts);
                self.data('slider', data);
            }
            if (typeof option === 'string') {
                retvals.push(data[option].apply(data, args));
            }
        });
        switch (retvals.length) {
            case 0:
                return this;
            case 1:
                return retvals[0];
            default:
                return retvals;
        }
    };

    $.fn.slider.defaults = {
        banItemClass:'banItem', /* banner元素类名 */
        navItemClass:'navItem', /* banner指示条元素类名 */
        navWrapClass:'navWrap',
        navBgWrapClass:'navBg',
        prevOneBtnClass:'prevOneBtn',
        nextOneBtnClass:'nextOneBtn',
        prevPageBtnClass:'prevPageBtn',
        nextPageBtnClass:'nextPageBtn',
        perpage:4, /* 每页显示进度条条目数量 */
        curClass:'curr', /* 当前激活的指示条元素附加类名 */
        event:'hover', /* 切换事件,默认为鼠标经过切换,允许的值[hover:经过,click:单击] */
        effect:'none', /* 切换效果,默认值none,允许的值[none:无效果,fade:淡入淡出] */
        speed:5000 /* 切换速度(相邻banner间切换的时间间隔),单位:ms */
    }
    $.fn.slider.Constructor = slider;
}));

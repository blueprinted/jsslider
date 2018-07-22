$.fn.slider = function(options){
  var _slider = $(this);
  var banItems;/* banner条目集 */
	var navItems;/* 指示条集 */
	var navWrap;/* 指示条容器 */
	var navBgWrap;/* 透明背景容器 */
	var prevOneBtn;/* 向前一个按钮 */
	var nextOneBtn;/* 向后一个按钮 */
	var prevPageBtn;/* 向前一页按钮 */
	var nextPageBtn;/* 向后一页按钮 */
	var length;/* banner条目数量 */
	var curIndex;/* 当前索引 */
	var curPage;/* 当前页 */
	var pages;/* 总页数 */
	var navItemWidth;/* 指示条元素宽 */
	var opts;/* 参数集 */
	var timer;/* 计时器 */
	var timer2;/* 附加计时器 */
	var offset;/* 指示条偏移值 */
	var initialed = false;/* 初始化标识 */
	var sliding = false;/* 滑动标识 */

	/* 默认属性defaults */
	var defaults = {
		banItemClass:'banItem',/* banner元素类名 */
		navItemClass:'navItem',/* banner指示条元素类名 */
		navWrapClass:'navWrap',
		navBgWrapClass:'navBg',
		prevOneBtnClass:'prevOneBtn',
		nextOneBtnClass:'nextOneBtn',
		prevPageBtnClass:'prevPageBtn',
		nextPageBtnClass:'nextPageBtn',
		perpage:4,/* 每页显示进度条条目数量 */
		curClass:'curr',/* 当前激活的指示条元素附加类名 */
		event:'hover', /* 切换事件,默认为鼠标经过切换,允许的值[hover:经过,click:单击] */
		effect:'none',/* 切换效果,默认值none,允许的值[none:无效果,fade:淡入淡出] */
		speed:5000/* 切换速度(相邻banner间切换的时间间隔),单位:ms */
	};

  /* 设置长度 */
	var setLength = function(_length) {
		length = _length;
		return length;
	}

	/* 获取长度 */
	var getLength = function() {
		return initialed ? length : _slider.find('.' + opts.banItemClass).length;
	}

	/* 设置当前索引 */
	var setCurIndex = function(_index){
		curIndex = _index;
		return curIndex;
	}

	/* 获取当前索引 */
	var getCurIndex = function(){
		var _index = typeof curIndex == 'undefined' ? 0 : parseInt(curIndex);
		_index = isNaN(_index) ? 0 : _index;
		return _index;
	}

	/* (根据当前索引)获取上一个索引 */
	var getPrevIndex = function(){
		var _preIndex;
		var _curIndex = getCurIndex();
		var _length = getLength();
		if(_curIndex < 1){
			_preIndex = _length - 1;
		}else{
			_preIndex = _curIndex - 1;
		}
		return _preIndex;
	}

	/* (根据当前索引)获取下一个索引 */
	var getNextIndex = function() {
		var _nextIndex;
		var _curIndex = getCurIndex();
		var _length = getLength();

		if(_curIndex >= _length - 1) {
			_nextIndex = 0;
		} else {
			_nextIndex = _curIndex + 1;
		}
		return _nextIndex;
	}

	/* 设置navItem的宽度 */
	var setNavItemWidth = function(_width) {
		navItemWidth = _width;
		return navItemWidth;
	}

	/* 获取navItem的宽度 */
	var getNavItemWidth = function() {
		if(initialed) {
			return navItemWidth;
		}
		if(!navItems) {
			navItems = _slider.find('.' + opts.navItemClass);
		}
		var _width = $(navItems).eq(0).width();

		var _margin_left = parseFloat($(navItems).eq(0).css('margin-left'));
		_margin_left = isNaN(_margin_left) ? 0 : _margin_left;
		var _margin_right = parseFloat($(navItems).eq(0).css('margin-right'));
		_margin_right = isNaN(_margin_right) ? 0 : _margin_right;
		var _padding_left = parseFloat($(navItems).eq(0).css('padding-left'));
		_padding_left = isNaN(_padding_left) ? 0 : _padding_left;
		var _padding_right = parseFloat($(navItems).eq(0).css('padding-right'));
		_padding_right = isNaN(_padding_right) ? 0 : _padding_right;
		var _border_left_width = parseFloat($(navItems).eq(0).css('border-left-width'));
		_border_left_width = isNaN(_border_left_width) ? 0 : _border_left_width;
		var _border_right_width = parseFloat($(navItems).eq(0).css('border-right-width'));
		_border_right_width = isNaN(_border_right_width) ? 0 : _border_right_width;

		_width = _width + _margin_left + _margin_right + _padding_left + _padding_right + _border_left_width + _border_right_width;
		return _width;
	}

	/* 获取navItem的偏移值 */
	var getOffset = function() {
		var _offset = typeof offset == 'undefined' ? 0 : parseInt(offset);
		_offset = isNaN(_offset) ? 0 : _offset;
		return _offset;
	}

	/* 设置navItem的偏移值 */
	var setOffset = function(_offset) {
		offset = _offset;
		return offset;
	}

	/* 获取总页数 */
	var getPages = function() {
		return initialed ? pages : Math.ceil(getLength()/opts.perpage);
	}

	/* 设置总页数 */
	var setPages = function(_pages) {
		pages = _pages;
		return pages;
	}

	/* 设置当前页 */
	var setCurPage = function(_page) {
		curPage = _page;
		return curPage;
	}

	/* 获取当前页码 */
	var getCurPage = function() {
		var _curPage = typeof curPage == 'undefined' ? 1 : parseInt(curPage);
		_curPage = isNaN(_curPage) ? 1 : _curPage;
		return _curPage;
	}

	/* 获取下一页码 */
	var getNextPage = function() {
		var _curPage = getCurPage();
		return  _curPage < getPages() ? _curPage + 1 : 1;
	}

	/* 获取上一页码 */
	var getPrevPage = function() {
		var _curPage = getCurPage();
		return  _curPage > 1 ? _curPage - 1 : getPages();
	}

	/* 跳转页面 */
	var page = function(_page, hasSilde) {
		var hasSilde = typeof hasSilde == 'undefined' ? false : (hasSilde ? true : false);
		var _pages = getPages();/* 总页数 */
		var _curPage = getCurPage();/* 当前页 */
		var _navItemWidth = getNavItemWidth();
		var _offset = getOffset();/* 当前偏移值 */
		var r_offset = 0;/* 相对偏移(由页码差值确定),初始置0 */
		if(_page == _curPage || _page < 1 || _page > _pages || _pages < 2)
			return false;

		/* 确定偏移量 */
		r_offset = -1 * (_page - _curPage) * opts.perpage * _navItemWidth;/* 计算相对偏移 */
		_offset += r_offset;
		var maxOffset = 0, minOffset = -1 * (getLength() - opts.perpage) * _navItemWidth;
		_offset = _offset > maxOffset ? maxOffset : (_offset < minOffset ? minOffset : _offset);/* 防止偏移量溢出 */

		/* 翻页动作 */
		$(navItems).each(function(){$(this).css('left', _offset + $(this).index() * getNavItemWidth())});

		if(!hasSilde){
			/* 计算滑动到的索引 */
			var _index = 0;
			_index = parseInt(-1 * _offset / _navItemWidth);
			if(_page > _curPage && _index <= getCurIndex() || _page < _curPage && getCurIndex() - _index < opts.perpage)
				_index = getCurIndex();
			slid(_index, true);
		}

		setOffset(_offset);
		setCurPage(_page);
	}

	/* 翻至下一页 */
	var nextPage = function() {
		page(getNextPage());
	}

	/* 翻至上一页 */
	var prevPage = function() {
		page(getPrevPage());
	}

	/* 获取索引所在页码 */
	var getIndexInPage = function(_index) {
		var _index = typeof _index == 'undefined' ? getCurIndex() : _index;
		var _indexInPage = 0;
		var _offset = getOffset();/* 当前偏移 */

		var leftOffset = leftIndex = 0;/* 当前索引的左临界偏移及左临界索引 */
		leftOffset = _offset + getCurIndex() * getNavItemWidth();
		leftIndex = getCurIndex() - Math.ceil(leftOffset/getNavItemWidth());
		if(_index >= leftIndex && _index < leftIndex + opts.perpage) {
			_indexInPage = getCurPage();
		} else if(_index < leftIndex) {
			_indexInPage = getCurPage() - Math.ceil((leftIndex - _index)/opts.perpage);
			_indexInPage = _indexInPage < 1 ? 1 : _indexInPage;
		} else {
			_indexInPage = getCurPage() + Math.ceil((_index - leftIndex - opts.perpage + 1)/opts.perpage);
			_indexInPage = _indexInPage > getPages() ? getPages() : _indexInPage;
		}

		return _indexInPage;
	}

	/* 滑动方法 */
	var slid = function(index, hasPage) {
		var hasPage = typeof hasPage == 'undefined' ? false : (hasPage ? true : false);
		if(sliding) return false;
		sliding = true;
		var index = typeof index == 'undefined' ? -1 : parseInt(index);
		index = isNaN(index) ? -1 : (index >= length || index < 0 ? -1 : index);

		var _curIndex = getCurIndex();/* 切换前的索引(当前索引) */
		var _currIndexInPage = getIndexInPage(_curIndex);/* 当索引所在页 */

		/* 下一个索引 */
		var _nextIndex = 0;

		if(index >= 0){
			_nextIndex = index;
		}else{
			_nextIndex = getNextIndex();
		}

		if(_nextIndex == _curIndex) {
			sliding = false;
			return false;
		}
/* console.log('_curIndex = ' + getCurIndex() + ', _nextIndex = ' + _nextIndex); */
		var _nextIndexInPage = getIndexInPage(_nextIndex);/* 下一个索引所在页 */
/* console.log('_currIndexInPage = ' + _currIndexInPage + ', _nextIndexInPage = ' + _nextIndexInPage + '\r\n'); */
		var flipPage = false;/* 翻页标识 */
		if(_currIndexInPage != _nextIndexInPage && !hasPage) {/* 需要翻页 */
			page(_nextIndexInPage, true);
			flipPage = true;
		}

		navItems.removeClass(opts.curClass);
		navItems.eq(_nextIndex).addClass(opts.curClass);
		if(opts.effect == 'fade'){
			banItems.eq(_curIndex).css('z-index', 1);
			banItems.eq(_nextIndex).css('z-index', 0);
			banItems.eq(_nextIndex).show();
			banItems.eq(_curIndex).fadeOut('slow', function(){sliding=false});
		}else{
			banItems.hide();
			banItems.eq(_nextIndex).show(0,function(){sliding=false});
		}
		setCurIndex(_nextIndex);

	}

	/* 开始 */
	var start = function() {
		try{
			clearInterval(timer);
		}catch(e){}
		if (opts.speed > 0) {
      timer = setInterval(function(){slid()}, opts.speed);
    }
	}

	/* 停止 */
	var stop = function() {
    try{
			clearInterval(timer);
		}catch(e){}
	}

	/* 运行 */
	var run = function(){
		init();
		start();
	}

	/* 初始化方法 */
	var init = function() {
    initialed = _slider.attr('initialed');
		if(!initialed) {
			opts = $.extend(defaults, options);/* 初始化参数 */
			setCurIndex(getCurIndex());/* 初始索引置0 */
			banItems = _slider.find('.' + opts.banItemClass);
			navItems = _slider.find('.' + opts.navItemClass);
			navWrap = _slider.find('.' + opts.navWrapClass);
			navBgWrap = _slider.find('.' + opts.navBgWrapClass);

			setLength(getLength());
			setNavItemWidth(getNavItemWidth());

			banItems.css('z-index', '1').eq(getCurIndex()).css('z-index','0');
			navWrap.css('z-index', '1');
			navBgWrap.css('z-index', '1');
			navItems.parent().css('position', 'relative');
			navItems.css('position', 'absolute');
			navItems.each(function(){$(this).css({'top':0, 'left':$(this).index() * getNavItemWidth()})});

			prevOneBtn = _slider.find('.' + opts.prevOneBtnClass);
			nextOneBtn = _slider.find('.' + opts.nextOneBtnClass);
			prevPageBtn = _slider.find('.' + opts.prevPageBtnClass);
			nextPageBtn = _slider.find('.' + opts.nextPageBtnClass);

			/* 初始化分页 */
			setPages(getPages());
			setCurPage(getCurPage());/* 设置当前页码为1 */
			setOffset(getOffset());/* 设置当前偏移值为0 */

			/* 初始化显示 */
			banItems.hide();
			banItems.eq(getCurIndex()).show();
			navItems.removeClass(opts.curClass);
			navItems.eq(getCurIndex()).addClass(opts.curClass);

			if(opts.event == 'hover') {
				navItems.bind('mouseover',function(){
					stop();
					_index = $(this).index();
					slid(_index);
				})
			}
			navItems.bind('click',function(){
				stop();
				_index = $(this).index();
				slid(_index);
			}).bind('mouseleave',function(){
				start();
			});

			prevOneBtn.mouseenter(function(){stop()}).mouseleave(function(){start()}).click(function(){slid(getPrevIndex())});
			nextOneBtn.mouseenter(function(){stop()}).mouseleave(function(){start()}).click(function(){slid(getNextIndex())});
			prevPageBtn.mouseenter(function(){stop()}).mouseleave(function(){start()}).click(function(){prevPage()});
			nextPageBtn.mouseenter(function(){stop()}).mouseleave(function(){start()}).click(function(){nextPage()});

			_slider.attr('initialed','true');
			initialed = true;
		}
	}

	run();
}

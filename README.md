# jsslider
一款jquery轮播插件
# 使用方法
```html
<script type="text/javascript" src="//apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"></script>
<script type="text/javascript" src="../jsslider.js"></script>
```
```javascript
var slider1;
$(function(){
    slider1 = $('#banner_wrap').slider({
        'banItemClass': 'banner',
        'navItemClass': 'navLi',
        'navWrapClass': 'banner_nav',
        'perpage': 7,
        'effect': 'fade',
        'speed': 3000
    }).data('slider');
});
```
# 示例
[点此预览](https://bolatoo.com/h5/jsslider/demo/ "点此预览")

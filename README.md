Search-video
======
Search-video是基于原生`<video>`的封装，视频由百度转存，去掉了一些可配置的参数。

分别提供MIP版代码和普通版代码，分别用于MIP页和非MIP页。 

## 非MIP版
相比MIP版本，直接使用原生的video标签，在原生标签上进行改造升级。

## 使用示例
CDN：https://vdse.bdstatic.com//search-video.v1.min.js
```html
<html>
    <head>
        <script src="https://vdse.bdstatic.com//search-video.v1.min.js"></script>
    </head>
    <body>
        <div id="searchVideo"></div>
        <script>
            var player = new searchVideo({
                id: 'searchVideo'
                src: 'xxx.mp4',
                controls: true,
                poster: 'xxx.jpg',
                autoplay: true
            });
        </script>
    </body>
</html>
```

## 失效提示
对于不支持HTML5 video的环境，可以显示提示信息。
```html
<div id="searchVideo">
    您的浏览器不支持视频播放，可以从<a href="http://www.baidu.com" target="_blank">这里</a> 下载该视频。
</div>
```

## MIP版本

待发布

## 相关文档

[API文档](docs/api.md)

## 注意事项
+ 为防止视频加载造成页面抖动，指定视频的高度和宽度是一个好习惯。指定宽高是强制的。


## 相关链接 
[https://github.com/blueimp/JavaScript-MD5](https://github.com/blueimp/JavaScript-MD5)
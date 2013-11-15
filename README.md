# saber-router

简单`hash`路由控制，支持正则表达式路径控制，使用`~`添加查询条件

## Usage

```javascript
var router = require('saber-router');

// 添加路由规则
router.add(
    '/add',
    function (url, query) {
        ...
    }
);

// 开始路由监听
router.start();
```

## API

### .add( path, fn )

添加路由规则

* `path` `{string|RegExp}` 路由路径
* `fn` `{function(string, Object)}` 路由请求函数

### .remove( path )

### .redirect( url, force )

URL跳转

* `url` `{string}` url
* `force` `{boolean}` 是否强制跳转

删除路由规则

### .start()

启动路由监听

### .end()

停止路由监听

===

[![Saber](https://f.cloud.github.com/assets/157338/1485433/aeb5c72a-4714-11e3-87ae-7ef8ae66e605.png)](http://ecomfe.github.io/saber/)

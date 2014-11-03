#1.0.0 / 2014-11-03

* 添加默认处理器，如果没有找到匹配路径的处理器则会尝试使用默认处理器
* [redirect()](README.md#redirecturl-query-options)支持静默跳转
* [reset()](README.md#reseturl-query-options)支持静默重置

#0.2.4 / 2014-06-25

* 添加`.reset`方法，用于重置当前的路径，不会触发路由处理，具体请参考[文档](README.md#reset-url-query-)

#0.2.3 / 2014-06-23

* `.redirect`方法增加`options`参数，用于传递路由参数，具体请参考[文档](README.md#redirect-url-query-options-)

#0.2.2 / 2014-06-16

* 对`RESTful`风格的路径参数进行`URI`解码
* 修正`RESTful`风格路由越界问题

#0.2.1 / 2014-04-26

* 添加`.config(optinos)`方法进行全局配置，支持`index`、`path`属性配置

#0.2.0 / 2014-04-16

* `.redirect(url, query, force)` 添加`query`参数，支持以`Object`变量的方式提供查询条件

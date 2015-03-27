# basemvc
Base MVC

简介：

使用过 JavaScript框架（如 AngularJS, Backbone 或者Ember ）的人都很熟悉在UI（用户界面，前端）中mvc的工作机理。这些框架实现了MVC，使得在一个单页面中实现根据需要变化视图时更加轻松，而模型-视图-控制器（mvc）的核心概念就是：处理传入请求的控制器、显示信息的视图、表示业务规则和数据访问的模型
	
概念：

　　应用中的代码利用urls中的“#”实现MVC模式的导航。应用以一个缺省的url开始，基于哈希值的代码加载应用视图并且将对象-模型应用于视图模板。

　　url格式像下面这样：

　　http://Domain Name/index.html#/Route Name

　　视图内容必须以{{Property-Name}}的方式绑定对象模型的值和属性。代码会查找这个专门的模板格式并且代替对象模型中的属性值。

　　以ajax的方式异步加载的视图会被放置于页面的占位符中。视图占位符可以是任何的元素（理想的情况是div），但是它必须有一个专门的属性，代码根据这个专门的属性来定位它，这样同样有助于代码的实现。当url改变时，会重复这个场景，另外一个视图被加载。

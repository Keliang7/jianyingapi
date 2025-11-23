// controller: 控制器，用于处理请求 !! 只处理请求，不处理业务逻辑 放在以前这是router
// service: 服务，用于处理业务逻辑 !! 放在以前这是service
// module: 模块，用于组织控制器和服务
// provider: 提供者，用于提供服务
// decorator: 装饰器，用于修饰类、方法、参数等

生命周期

客户端=>中间件=>守卫=>拦截器pre=>管道=>控制器=>服务=>拦截器post=>过滤器=>响应

中间件：全局中间件=>模块中间件
守卫：全局守卫=>控制器守卫=>路由守卫
拦截器：全局拦截器pre=>控制器拦截器=>路由拦截器
管道：全局管道=>控制器管道=>路由管道=>路由参数管道
拦截器：路由拦截器post=>控制器拦截器post=>全局拦截器post（和前置拦截器反过来的，洋葱模型）
过滤器：路由=>控制器=>全局

DI容器 工作原理
1.组册所有有@Injectable装饰器的类
2.通过Constructor了解类与类之间的依赖关系
(1,2 所有@Injectable与Providers里面的类)
3.Nestjs自动创建@Injectable装饰器的实例
4.Nestjs自动创建依赖关系的实例5.将实例注入到需要的地方

    1.	Nest 按模块的注入器层级解析依赖：当 AppController 属于 AppModule 时，Nest 会先在 AppModule 的 provider 池里找对应的 token（通常 token 就是类本身 AppService）。
    2.	如果当前模块没有该 provider，会去查它 imports 的模块中被 export 出来的 providers。
    3.	如果当前模块自己有同名 provider（同 token）——本模块的优先。也就是说本模块注册的会覆盖从 imports 引入的同 token provider。
    4.	不能在 constructor 上指定“我要哪个模块的实例” —— 你只能通过模块的注册/导出/导入关系或改变 token 来控制具体注入哪个实现。

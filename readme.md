相关文档参考doc目录下


# 模块划分

- oldcode目录下放的是最早油猴脚本的文件，现在的代码是在那之上重构的，这里仅仅是保存，以后可删除
- common、filter、model、report、resource这几个目录都是服务于Jira上筛选和报告功能，另外根目录的几个文件也是服务这个功能的，其中
  - entryPoint.js是和Jira系统对接的入口（目前是和王泽宏约定），由于本地调试时需要有延时加载的需求，所以设置了3s延时。但通过git的忽略保证了这个延时不会上传
  - main.js是被entryPoint.js调用的，作为主函数的入口存在。一般我会在里面修改记录使用记录信息的位置
  - common目录保存的是Jira的筛选和报告功能的通用代码
  - model目录保存的是Jira的筛选和报告功能的数据定义部分
  - resource目录保存的是对第三方js和css的依赖
  - filter目录对应的是Jira的筛选功能
    - main.js是筛选功能的主入口
    - 各种View.js和VM.js共同构成了MVVM架构
    - viewConfig.js是显示配置
  - report目录对应的是Jira的报告功能
    - main.js是报告功能的主入口
    - 各种Report.js负责每种报告的Control部分的业务逻辑，他们的公共父类是abstractReport.js
    - enhancedReportFrame.js是整个报告页面的框架
    - reportFactory.js是工厂模式负责创建各种report
    - 各种View.js负责报告里的各种展示方式实现
- confPermission目录保存了一个油猴脚本，方便Confluence空间管理员批量设置页面的权限


# 开发时如何测试

在oldcode目录下有jiraEnhanceScriptrunnerInject.js。该文件是最早代码没有被纳入到Jira服务器里时（其实现在给Jira服务器的代码就是该文件里的代码），我在本地使用的入口。

1. 在VSCode中打开本项目Go Live，确保本地服务器地址是127.0.0.1:8087。该地址要和jiraEnhanceScriptrunnerInject.js里getScriptHost函数返回的一致
2. 在Jira页面打开F12控制台
3. 把jiraEnhanceScriptrunnerInject.js的内容全部拷贝到Console里并执行
4. 修改jiraEnhanceScriptrunnerInject.js的最后一句决定了执行不同的功能入口

# 如何同步给Jira服务器

测试结束后，可以联系公司Jira管理员（目前是王泽宏）。目前Jira上通过Script Runner把搜索问题页面上一个按钮和该脚本绑定起来。我需要提供给Jira管理员的就是jiraEnhanceScriptrunnerInject.js，并根据目前Jira服务器上对应脚本来补充新增加的功能。不用担心，Jira管理员那有相关文档。
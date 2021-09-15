# 数据流向

- Issue.js里定义了所有支持的字段，这里的说的“字段”是流程里的字段，并不是Jira里的具体到某个字段的名字。比如“研发提验时间”在结构项目可能对应Jira里的custom_123，但在BIM项目里对应的是custom_456
- IssueReadScheme.js里记录了各种项目的读取策略。由于目前公司没有统一的工作流，各个项目对于Issue.js里定义的相同的字段，读取的Jira里的位置可能不一致
- JiraIssueReader.js是读取工具，有了Issue.js和IssueReadScheme.js，就可以根据某个项目的配置来使用JiraIssueReader.js里的接口生成Issue的实例化


# 展示方式

- ViewConfig.js是显示配置，它定义了Issue.js里的各个字段：
  - 在chart、filter、grid中是否可以展示
  - 在grid展示中，标题如何显示，宽度如何，如何渲染（比如空值会被渲染为斜体的Empty Field）
- 程序一共有三种显示方式：chart、filter和grid，每种显示方式都是MVVM设计模式，比如
  - gridVM.js就是grid显示方式的ViewModel，负责在Model和gridView之间做桥梁
  - gridView.js负责整个grid的显示相关，包括消息响应，在页面上的id管理等
  - gridControl.js则是对w2ui grid的包装，它专心负责grid本身的操作，日后如果gridView内不仅有gridControl，还可以加入其他Control，共同完成gridVM的业务需求
# 考虑了哪些方面

## w2ui grid内直接修改是如何操作实现的

w2ui grid默认特性是：

- init时将某列的editable属性设置为{type : date}（也可以指定其他类型）
- 双击单元格即可inline edit，同时会弹出日期选择控件
- 修改中点击其他地方，会退出修改
- 修改值和原值不一致时，会记录在grid的每个records的changes中
- 可以通过mergeChanges函数把changes合并到grid的records中
- 可以通过删除每个records中的changes，并refresh grid来恢复到修改前
- 消息路径粗略如下：
  - click，两次click时间接近则会转为dblClick
  - dblClick
  - editField
  - editChange
- onChange消息响应的phase=before可以取消本次修改，我是利用这个时机判断某些字段是否可以修改（比如某些字段在结构的项目里不存在）

## grid在修改中，inline edit的input控件中如何显示

这部分我修改了w2ui的源码，使其对date类型做了特殊处理，显示成"2021-09-15"这样，而不是UTC的日期时间字符串表示

## grid修改后的值如何显示

grid会和最开始显示数据一样调用column的render函数

## 如何做到仅允许日期字段可以修改，而其他字段不可以

- issue.js里记录了所有合法的field，我把其中日期字段类拿出来做了个接口函数，允许外界询问
- 在初始化grid的columns时，判断每个column是不是日期字段，如果是才对editable属性赋值

## 修改后的数据如何同步到服务器

具体参见jira的rest api相关文档

## 服务器如果拒绝修改怎么办

根据http response的ok的true和false来判断本次修改服务器是否接受，如果不接受，则清空grid的所有change，恢复原貌


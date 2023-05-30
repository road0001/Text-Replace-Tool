# 文本批量替换工具

## 工具介绍

- 本工具用于按规则批量进行文本替换，支持配置多种规则、判断、循环、引用等。
- 本工具支持规则添加、排序、编辑、删除、导入导出功能。
- 本工具使用JSON格式进行规则配置，配置方法详见程序内说明。

## 规则序列说明

### 插入文本

```json
{
    "type": "insert",
    "location":"tail",
    "pos":0,
    "target":"文字内容"
}
// location：插入位置，可选head/tail（首部、尾部），可省略，默认为tail（文本内容尾部）
// pos：插入偏移位数，整数，可省略，默认为0
```

### 替换文本

```json
{
    "type": "replace",
    "all":true,
    "count":0,
    "begin":0,
    "origin":"替换前文字内容1||替换前文字内容2",
    "target":"替换后文字内容"
}
// all：是否全部替换，可选true/false，默认为true。
// count：非全部替换时替换数量，整数，可省略，默认为0，仅在all为false时生效。
// begin：非全部替换时从第几个关键词开始替换，整数，可省略，默认为0，仅在all为false时生效。
// origin中的“||”：多个查找文本的分隔符号，不可加空格。依次替换每个查找文本为替换后文字内容。

// 全部替换的场合，可简写为如下形式：
{
    "origin":"替换前文字内容",
    "target":"替换后文字内容"
}
{
    "origin":"替换前文字内容1||替换前文字内容2",
    "target":"替换后文字内容"
}
```

### 去除首尾空格

```json
{
    "type": "trim",
}
```

### 引用其他规则

```json
{
    "type": "@规则名",
}
```

### 条件判断

```json
{
    "if":"text|origin|target.includes('查找条件')",
    "type": "replace",
    "origin":"替换前文字内容",
    "target":"替换后文字内容"
}
// if：JS表达式，仅在表达式返回为true时才执行此规则。
// 此处规则为：判断目标字符串中是否包含“查找条件”，如果包含，则执行此规则，否则将跳过此规则。
// text、origin、target：分别代表替换前文字内容（text和origin一样）和替换后文字内容。
```

### 块级条件判断

```json
{
    "type":"condition",
    "if":"text|origin|target.includes('查找条件')",
    "rules": [
        // 嵌套上述规则块
    ]
}
// if：JS表达式，仅在表达式返回为true时才执行rules中的规则块。
// text、origin、target：分别代表替换前文字内容（text和origin一样）和替换后文字内容。
```

### 块级条件循环

```json
{
    "type":"condition",
    "while":"text|origin|target.count('查找条件') && count<10",
    "rules": [
        // 嵌套上述规则块
    ]
}
// if：JS表达式，仅在表达式返回为true时才循环执行rules中的规则块。
// text、origin、target：分别代表替换前文字内容（text和origin一样）和替换后文字内容。
// count为循环次数，从0开始，直到循环结束，依次累加。
// 最大循环次数为9999次。
```

### 自定义表达式

```json
{
    "type":"function",
    "function":"origin + ' ' + text"
}
// text、origin：分别代表替换前文字内容（text和origin一样）。
// 执行结果将直接返回，不需要return。
// 实验性项目，暂不稳定。
```


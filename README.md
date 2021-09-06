# pickup-element
提取 dom 元素

## 快速开始
```javascript
const e = new Layer({
  selector: 'body',
  selectedStyle: '2px solid orange',
  onSelectElement(r) {
    console.log('选中的元素: ', r)
  },
})

e.start() // 开启 canvas 遮罩

// 使用鼠标选中 | 退格键删除...

e.end() // 返回选中的所有元素
```

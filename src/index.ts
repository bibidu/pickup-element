import { IElementPosition, IPressEvent, ILayerWrapperStyle, ILayerConstructorProps } from './type'
import isMobile from 'ismobilejs'

const defaultWrapperStyle: ILayerWrapperStyle = {
  position: 'fixed',
  top: '0px',
  bottom: '0px',
  left: '0px',
  right: '0px',
  backgroundColor: 'rgba(238, 238, 238, 0.5)',
  zIndex: 9999,
}

export default class Layer{
  layerId: string = '__layer__'
  layer: null | HTMLCanvasElement
  _temporaryElement: HTMLElement = null
  _cacheElements: Element[] = []
  cacheDocumentOverflow: string = ''
  el: Element

  // props
  selector: string
  selectedStyle: string
  layerWrapperStyle: ILayerWrapperStyle
  onSelectElement: (el: Element[]) => void

  constructor({
    selector = 'body',
    selectedStyle = '2px solid orange',
    layerWrapperStyle = defaultWrapperStyle,
    onSelectElement,
  }: ILayerConstructorProps) {
    this.selector = selector
    this.el = this._safeQuerySelector(this.selector)

    this.selectedStyle = selectedStyle
    this.layerWrapperStyle = layerWrapperStyle
    this.onSelectElement = onSelectElement
  }

  _isMobile = () => {
    return isMobile(navigator.userAgent).any
  }

  _getPressEventName = (): IPressEvent => {
    if (this._isMobile()) {
      return { onStart: 'touchstart' }
    } else {
      return { onStart: 'mousedown' }
    }
  }

  _getPosition = (event) => {
    if (this._isMobile()) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      }
    } else {
      return {
        x: event.x,
        y: event.y,
      }
    }
  }

  _safeQuerySelector = (selector: string) => {
    const el = document.querySelector(selector)
    if (!el) {
      throw Error(`'${selector}' is invalid selector`)
    }
  
    return el
  }

  start = () => {

    // 创建canvas
    const canvas: HTMLCanvasElement = this.layer = this._createCanvasLayer()

    // 绑定滑动事件
    this._bindCanvasEvent(canvas)

    // 禁止页面随手指拖拽
    this.forbidPageOverflow()
  }

  forbidPageOverflow = () => {
    this.cacheDocumentOverflow = getComputedStyle(document.body).overflow

    document.body.style.overflow = 'hidden'
  }

  resetPageOverflow = () => {
    document.body.style.overflow = this.cacheDocumentOverflow
  }

  getElementByPoint = (x: number, y: number, realDocument?: Node): Element => {
    return (((realDocument || document) as Document).elementFromPoint(x, y) as Element)
  }

  _createCanvasLayer = (): HTMLCanvasElement => {
    const { top, left, height, width } = this._getElementPosition(this.el)

    const canvas = this._createCanvasElement(
      { 
        width, 
        height, 
        id: this.layerId,
      },
      this.layerWrapperStyle
    )
    
    this.el.appendChild(canvas)

    return canvas
  }

  _createCanvasElement = (attributes: Object, styles: Object): HTMLCanvasElement => {
    const canvas = document.createElement('canvas')

    Object.keys(styles).forEach(k => canvas.style[k] = styles[k])
    Object.keys(attributes).forEach(k => canvas[k] = attributes[k])

    return canvas
  }

  _bindCanvasEvent = (canvas: HTMLCanvasElement) => {
    const Event = this._getPressEventName()

    canvas.addEventListener(Event.onStart, this.onStart)
    document.addEventListener('keyup', this.onKeyup)
  }

  _unbindCanvasEvent = (canvas: HTMLCanvasElement) => {
    const Event = this._getPressEventName()

    canvas.removeEventListener(Event.onStart, this.onStart)
    document.removeEventListener('keyup', this.onKeyup)
  }

  _getElementPosition = (el: Element): IElementPosition => {
    return el.getBoundingClientRect()
  }

  end = (): Element[] => {
    if (this.layer) {
      this._unbindCanvasEvent(this.layer)
      this.layer.parentNode && this.layer.parentNode.removeChild(this.layer)
    }
    this._clearLastDrawRect()
    this.resetPageOverflow()

    return this._cacheElements
  }

  _drawRectBorder = (elementLocation: IElementPosition, element?: HTMLElement) => {
    if (elementLocation) {
      const canvas = this.layer
      const context = canvas.getContext('2d')

      const scrollHeight = document.documentElement.scrollTop
      const { width, height, left } = elementLocation
      let { top } = elementLocation
      top = top + scrollHeight

      context.strokeStyle = 'orange'
      context.moveTo(left, top)
      context.lineTo(left + width, top)
      context.lineTo(left + width, top + height)
      context.lineTo(left, top + height)
      context.lineTo(left, top)
      context.stroke()
    }
    if (element) {
      element.setAttribute('data-soutline', getComputedStyle(element).outline)
      element.style.outline = this.selectedStyle
    }
  }

  _drawElementBoundary = (x: number, y: number) => {
    this.layer.style.transform = 'translateX(1000px)'
    const element = this.getElementByPoint(x, y) as HTMLElement
    this.layer.style.transform = 'translateX(0px)'

    this._drawRectBorder(null, element) 
    this._temporaryElement = element
  }

  _clearLastDrawRect = () => {
    const el = this._temporaryElement
    if (el) {
      el.style.outline = el.getAttribute('data-soutline')
      el.removeAttribute('data-soutline')
      this._temporaryElement = null
    }
  }

  onKeyup = (event) => {
    // 回车键
    if (event.keyCode === 13) {
      this._temporaryElement && this._cacheElements.push(this._temporaryElement)
      const elementPosition = this._getElementPosition(this._temporaryElement)
      this._drawRectBorder(elementPosition)
      this.onSelectElement && this.onSelectElement(this._cacheElements)
    }

    // 退格键
    if (event.keyCode === 8) {
      this._clearLastDrawRect()
    }
  }

  onStart = (event) => {
    setTimeout(() => {
      this._clearLastDrawRect()
      const { x, y } = this._getPosition(event)
      this._drawElementBoundary(x, y)
    }, 200)
  }
}

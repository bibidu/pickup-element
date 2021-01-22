export interface IElementPosition {
  width: number;
  height: number;
  top: number;
  left: number;
}

export interface IPressEvent {
  onStart: string;
}

export interface ILayerWrapperStyle {
  position: 'absolute' | 'fixed';
  backgroundColor: string;
  top: string;
  bottom: string;
  left: string;
  right: string;
  zIndex: number;
}

export interface ILayerConstructorProps {
  selector?: string;
  selectedStyle?: string;
  layerWrapperStyle?: ILayerWrapperStyle;
  onSelectElement?: (el: Element[]) => void;
}
import { getCursorPosition } from './PlayBarUtil';
import { Controller } from '@controllers';

const mousemoveMarkerListener: Function = (element: HTMLElement, defaultStartX: number, mainWidth: number) => (e: Event): void => {
  if (!element) return;
  const cursorPosition = e.pageX;

  const [minute, second, milsecond, location] = getCursorPosition(defaultStartX, cursorPosition, mainWidth);

  if (minute < 0 && second < 0) return;
  Controller.changeCurrentPosition(location);
  Controller.changeCursorTime(minute.toString(), second.toString(), milsecond.toString());
};

const clickMarkerListener = (element: HTMLElement) => (e: Event): void => {
  if (!element) return;
  const currentPosition = Controller.getCurrentPosition();

  if (currentPosition < 0) return;
  element.style.left = `${currentPosition}px`;
};

export { mousemoveMarkerListener, clickMarkerListener };
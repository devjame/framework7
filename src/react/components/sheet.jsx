import React, { forwardRef, useRef, useImperativeHandle, useEffect } from 'react';
import { classNames, getDataAttrs, emit, getSlots } from '../utils/utils';
import { colorClasses } from '../utils/mixins';
import { f7ready, f7 } from '../utils/f7';
import { watchProp } from '../utils/watch-prop';

/* dts-imports
import { Sheet } from 'framework7/types';
*/

/* dts-props
  id?: string | number;
  className?: string;
  style?: React.CSSProperties;
  opened? : boolean
  top? : boolean
  bottom? : boolean
  position? : string
  backdrop? : boolean
  backdropEl? : string | Object
  closeByBackdropClick? : boolean
  closeByOutsideClick? : boolean
  closeOnEscape? : boolean
  push? : boolean
  swipeToClose? : boolean
  swipeToStep? : boolean
  swipeHandler? : string | Object
  COLOR_PROPS
  onSheetStepProgress? : (instance?: Sheet.Sheet, progress?: any) => void
  onSheetStepOpen? : (instance?: Sheet.Sheet) => void
  onSheetStepClose? : (instance?: Sheet.Sheet) => void
  onSheetOpen? : (instance?: Sheet.Sheet) => void
  onSheetOpened? : (instance?: Sheet.Sheet) => void
  onSheetClose? : (instance?: Sheet.Sheet) => void
  onSheetClosed? : (instance?: Sheet.Sheet) => void
*/

const Sheet = forwardRef((props, ref) => {
  const f7Sheet = useRef(null);
  const {
    className,
    id,
    style,
    top,
    bottom,
    position,
    push,
    opened,
    backdrop,
    backdropEl,
    closeByBackdropClick,
    closeByOutsideClick,
    closeOnEscape,
    swipeToClose,
    swipeToStep,
    swipeHandler,
  } = props;
  const dataAttrs = getDataAttrs(props);

  const elRef = useRef(null);

  const onStepProgress = (instance, progress) => {
    emit(props, 'sheetStepProgress', instance, progress);
  };
  const onStepOpen = (instance) => {
    emit(props, 'sheetStepOpen', instance);
  };
  const onStepClose = (instance) => {
    emit(props, 'sheetStepClose', instance);
  };
  const onOpen = (instance) => {
    emit(props, 'sheetOpen', instance);
  };
  const onOpened = (instance) => {
    emit(props, 'sheetOpened', instance);
  };
  const onClose = (instance) => {
    emit(props, 'sheetClose', instance);
  };
  const onClosed = (instance) => {
    emit(props, 'sheetClosed', instance);
  };
  const open = (animate) => {
    if (!f7Sheet.current) return undefined;
    return f7Sheet.current.open(animate);
  };
  const close = (animate) => {
    if (!f7Sheet.current) return undefined;
    return f7Sheet.current.close(animate);
  };

  useImperativeHandle(ref, () => ({
    el: elRef.current,
    f7Sheet: f7Sheet.current,
    open,
    close,
  }));

  const onMount = () => {
    if (!elRef.current) return;
    const sheetParams = {
      el: elRef.current,
      on: {
        open: onOpen,
        opened: onOpened,
        close: onClose,
        closed: onClosed,
        stepOpen: onStepOpen,
        stepClose: onStepClose,
        stepProgress: onStepProgress,
      },
    };

    if ('backdrop' in props && typeof backdrop !== 'undefined') sheetParams.backdrop = backdrop;
    if ('backdropEl' in props) sheetParams.backdropEl = backdropEl;
    if ('closeByBackdropClick' in props) sheetParams.closeByBackdropClick = closeByBackdropClick;
    if ('closeByOutsideClick' in props) sheetParams.closeByOutsideClick = closeByOutsideClick;
    if ('closeOnEscape' in props) sheetParams.closeOnEscape = closeOnEscape;
    if ('swipeToClose' in props) sheetParams.swipeToClose = swipeToClose;
    if ('swipeToStep' in props) sheetParams.swipeToStep = swipeToStep;
    if ('swipeHandler' in props) sheetParams.swipeHandler = swipeHandler;

    f7ready(() => {
      f7Sheet.current = f7.sheet.create(sheetParams);
      if (opened) {
        f7Sheet.current.open(false);
      }
    });
  };

  const onDestroy = () => {
    if (f7Sheet.current) {
      f7Sheet.current.destroy();
    }
    f7Sheet.current = null;
  };

  useEffect(() => {
    onMount();
    return onDestroy;
  }, []);

  watchProp(opened, (value) => {
    if (!f7Sheet.current) return;
    if (value) {
      f7Sheet.current.open();
    } else {
      f7Sheet.current.close();
    }
  });

  const slots = getSlots(props);
  const fixedList = [];
  const staticList = [];
  const fixedTags = 'navbar toolbar tabbar subnavbar searchbar messagebar fab list-index'
    .split(' ')
    .map((tagName) => `f7-${tagName}`);

  const slotsDefault = slots.default;

  if (slotsDefault && slotsDefault.length) {
    slotsDefault.forEach((child) => {
      if (typeof child === 'undefined') return;
      let isFixedTag = false;
      const tag = child.type && (child.type.displayName || child.type.name);
      if (!tag) {
        staticList.push(child);
        return;
      }
      if (fixedTags.indexOf(tag) >= 0) {
        isFixedTag = true;
      }

      if (isFixedTag) fixedList.push(child);
      else staticList.push(child);
    });
  }
  const innerEl = <div className="sheet-modal-inner">{staticList}</div>;

  let positionComputed = 'bottom';
  if (position) positionComputed = position;
  else if (top) positionComputed = 'top';
  else if (bottom) positionComputed = 'bottom';

  const classes = classNames(
    className,
    'sheet-modal',
    `sheet-modal-${positionComputed}`,
    {
      'sheet-modal-push': push,
    },
    colorClasses(props),
  );

  return (
    <div id={id} style={style} className={classes} ref={elRef} {...dataAttrs}>
      {fixedList}
      {innerEl}
    </div>
  );
});

Sheet.displayName = 'f7-sheet';

export default Sheet;
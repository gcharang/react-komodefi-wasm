import React from 'react';
import type { TooltipProps } from '../types/components';

function classBasedOnDir(dir: TooltipProps['dir']) {
  let classs = '';
  switch (dir) {
    case 'top':
      classs = 'bottom-full mb-2';
      break;
    case 'bottom':
      classs = 'top-full mt-2';
      break;
    case 'bottom-right':
      classs = 'top-full mt-2 left-full';
      break;
    default:
      break;
  }
  return classs;
}

const Tooltip = ({ label, dir = 'top', children }: TooltipProps) => {
  return (
    <div className="relative inline-block group">
      {children}
      <div
        className={`absolute pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200
          bg-primary-bg-800 text-text-primary text-xs rounded-md px-2 py-1 whitespace-nowrap
          ${classBasedOnDir(dir)}
          left-1/2 -translate-x-1/2`}
      >
        {label}
        <svg
          className="absolute text-primary-bg-800/95 h-3 w-full left-0 top-full"
          x="0px"
          y="0px"
          viewBox="0 0 255 255"
        >
          <polygon
            className={`fill-current ${dir === 'top' ? '' : 'hidden'}`}
            points="0,0 127.5,127.5 255,0"
          />
        </svg>
      </div>
    </div>
  );
};

export default Tooltip;

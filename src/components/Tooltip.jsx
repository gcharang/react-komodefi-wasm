import React from 'react';

const Tooltip = ({ label, dir = 'top', children }) => {
  return (
    <div className="group cursor-pointer relative text-center">
      {children}
      <div
        className={`transition opacity-0 shadow-md w-28 bg-primaryLighter text-slate-300 text-center text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 group-hover:-translate-y-[0.5rem] ${
          dir === 'top' ? 'bottom-full' : '-bottom-[200%]'
        } -translate-y-[1rem] left-1/2 -translate-x-1/2  pointer-events-none`}
      >
        {label}
        <svg
          className="absolute text-primaryLighter h-3 w-full left-0 top-full"
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

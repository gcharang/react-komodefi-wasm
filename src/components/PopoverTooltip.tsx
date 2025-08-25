import React, { useState, Fragment } from 'react';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';

interface PopoverTooltipProps {
  label: string;
  dir?: 'top' | 'bottom';
  children: React.ReactNode;
}

const PopoverTooltip: React.FC<PopoverTooltipProps> = ({ label, dir = 'top', children }) => {
  const [isOpen, setIsOpen] = useState(false);
  let timeoutId: NodeJS.Timeout;

  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setIsOpen(false);
    }, 100); // Small delay to prevent flicker
  };

  return (
    <Popover className="relative">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        <PopoverButton as={Fragment}>
          {children}
        </PopoverButton>
        
        <Transition
          show={isOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className={`absolute z-50 px-3 py-2 text-xs text-center text-text-primary bg-primary-bg-800/95 backdrop-blur-xl rounded-lg shadow-2xl ring-1 ring-accent/20 whitespace-nowrap ${
              dir === 'top' 
                ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' 
                : 'top-full mt-2 left-1/2 -translate-x-1/2'
            }`}
          >
            {label}
            {/* Arrow indicator */}
            <div
              className={`absolute w-3 h-3 bg-primary-bg-800/95 transform rotate-45 ${
                dir === 'top'
                  ? 'bottom-[-6px] left-1/2 -translate-x-1/2'
                  : 'top-[-6px] left-1/2 -translate-x-1/2'
              }`}
            />
          </PopoverPanel>
        </Transition>
      </div>
    </Popover>
  );
};

export default PopoverTooltip;
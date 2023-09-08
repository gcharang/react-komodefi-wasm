import React from "react";
import { PlayIcon, StopIcon } from "../components/IconComponents";

const Mm2LogsPanel = ({ mm2Logs }) => {
  const classes = [
    "text-blue-300",
    "text-violet-300",
    "text-red-300",
    "text-yellow-300",
    "text-neutral-300",
  ];
  return (
    <div className="w-1/2 grid grid-flow-row border-r border-r-gray-700">
      <div className="w-full p-2 flex-[0_0_auto] bg-[#11182f] text-[#a2a3bd] h-10 border-b border-b-gray-800">
        <div className="flex gap-3">
          <PlayIcon
            className="w-6 h-6 cursor-pointer hover:fill-green-500"
            title="Run MM2"
          />
          <StopIcon
            className="w-6 h-6 cursor-pointer hover:fill-red-500"
            title="Run MM2"
          />
        </div>
      </div>
      <div className="p-2 overflow-hidden overflow-y-auto break-words">
        {mm2Logs.map((message, index) => {
          return (
            <p
              key={index}
              className={`text-${message[1]}-300 text-base font-bold border-slate-700 border-b`}
            >
              {message[0]}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default Mm2LogsPanel;

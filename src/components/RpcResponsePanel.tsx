import React from "react";
import { PlayIcon, StopIcon } from "../components/IconComponents";
import { nanoid } from "nanoid";

const RpcResponsePanel = ({ rpcRequestResponse }) => {
  return (
    <div className="w-1/2 grid grid-flow-row">
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
      <div className="overflow-hidden overflow-y-auto">
        <p className="p-2 whitespace-pre">
          {/* {rpcRequestResponse} */}
          {`[
              {
                "result": "success",
                "address": "RCKfmv1X4oZHhGgb9mVD8XnkubAerWEcQ4",
                "balance": "1325.07276485",
                "unspendable_balance": "0",
                "coin": "RICK",
                "required_confirmations": 1,
                "requires_notarization": false,
                "mature_confirmations": 100
              },
              {
                "result": "success",
                "address": "RCKfmv1X4oZHhGgb9mVD8XnkubAerWEcQ4",
                "balance": "31.5467114",
                "unspendable_balance": "0",
                "coin": "MORTY",
                "required_confirmations": 1,
                "requires_notarization": false,
                "mature_confirmations": 100
              },
              {
                "result": "success",
                "address": "0xb49830900802A83a2c944184bF9D9F4546dEdca5",
                "balance": "0",
                "unspendable_balance": "0",
                "coin": "ETH",
                "required_confirmations": 3,
                "requires_notarization": false
              }
            ]`}
        </p>
      </div>
    </div>
  );
};

export default RpcResponsePanel;

import { atom, useRecoilState } from 'recoil';

import { atomKeys } from '../atomKeys.js';
import { rpcDefaultConfig } from '../staticData/index.js';

const rpcResponseAtom = atom({
  key: atomKeys.rpcResponse,
  default: {
    requestResponse: ``,
  },
});

export const useRpcPanelState = () => {
  const [rpcResponseState, setRpcResponseState] = useRecoilState(rpcResponseAtom);

  return {
    rpcResponseState,
    setRpcResponseState,
  };
};

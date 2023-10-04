import { atom, useRecoilState } from "recoil";
import { atomKeys } from "../atomKeys.js";
import { rpcDefaultConfig } from "../staticData/index.js";

const mm2PanelAtom = atom({
  key: atomKeys.rpcPanel,
  default: {
    config: rpcDefaultConfig,
    requestResponse: ``,
  },
});

export const useRpcPanelState = () => {
  const [rpcPanelState, setRpcPanelState] = useRecoilState(mm2PanelAtom);

  return {
    rpcPanelState,
    setRpcPanelState,
  };
};

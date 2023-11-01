import { atom, useRecoilState } from "recoil";
import { atomKeys } from "../atomKeys.js";

const rpcAtom = atom({
  key: atomKeys.methods,
  default: null,
});

export const useRpcMethods = () => {
  const [methods, setMethods] = useRecoilState(rpcAtom);

  return {
    methods,
    setMethods,
  };
};

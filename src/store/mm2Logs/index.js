import { atom, useRecoilState } from "recoil";
import { atomKeys } from "../atomKeys.js";

const mm2LogsPanelAtom = atom({
  key: atomKeys.mm2Logs,
  default: {
    outputMessages: [
      ["Once mm2 is run, daemon output is rendered here", "blue"],
    ],
  },
});

export const useMm2LogsPanelState = () => {
  const [mm2LogsPanelState, setMm2LogsPanelState] =
    useRecoilState(mm2LogsPanelAtom);

  return {
    mm2LogsPanelState,
    setMm2LogsPanelState,
  };
};

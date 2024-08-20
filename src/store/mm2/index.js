import { atom, useRecoilState } from 'recoil';

import { atomKeys } from '../atomKeys.js';
import { mm2DefaultConfig } from '../staticData/index.js';

const mm2panelAtom = atom({
  key: atomKeys.mm2panel,
  default: {
    mm2Running: false,
    startCommand: 'Run MM2',
    mm2UserPass: '',
    mm2Config: mm2DefaultConfig,
    dataHasErrors: false,
  },
});

export const useMm2PanelState = () => {
  const [mm2PanelState, setMm2PanelState] = useRecoilState(mm2panelAtom);

  return {
    mm2PanelState,
    setMm2PanelState,
  };
};

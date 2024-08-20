import { atom, useRecoilState } from 'recoil';

import { atomKeys } from '../atomKeys.js';

const genericModalAtom = atom({
  key: atomKeys.genericModal,
  default: {
    titleComponent: 'Hello, world!',
    messageComponent: (
      <p className="text-sm text-gray-400">
        Thanks for using our playground! Seems we forgot to pass a custom message here
      </p>
    ),
    proceedBtnMessage: 'I understand',
    cancelBtnMessage: 'Close',
    onProceed: null,
    onCancel: () => null,
  },
});

export const useGenericModal = () => {
  const [genericModalState, setGenericModalState] = useRecoilState(genericModalAtom);

  return {
    genericModalState,
    setGenericModalState,
  };
};

import { atom, useRecoilState } from "recoil";

import { atomKeys } from "../atomKeys";

const modalVisibilityState = atom({
  key: atomKeys.modalVisibility,
  default: [],
});

export const useVisibilityState = () => {
  const [visibleModals, setVisibleModals] =
    useRecoilState(modalVisibilityState);

  const hideModal = (id) => {
    setVisibleModals((currentValues) => {
      return currentValues.filter((visible) => id !== visible);
    });
  };

  const hidePreviousThenShowNext = (modalToHide, modalToShow, delay) => {
    hideModal(modalToHide);
    setTimeout(
      () => {
        showModal(modalToShow);
      },
      delay ? delay : 500
    );
  };

  const showModal = (id) => {
    if (!visibleModals.includes(id))
      setVisibleModals((currentValues) => {
        return [...currentValues, id];
      });
  };
  const imVisible = (id) => {
    return visibleModals.includes(id);
  };
  return {
    showModal,
    hideModal,
    visibleModals,
    setVisibleModals,
    imVisible,
    hidePreviousThenShowNext,
  };
};

import { atom, useRecoilState } from "recoil";
import { atomKeys } from "../atomKeys.js";

const defaultState = {
  id: "",
  sourceUrl: "",
  json: "{}",
  isComingFromDocsLink: false,
  response: "",
};
const externalDocsAtom = atom({
  key: atomKeys.externalDocs,
  default: defaultState,
});

export const useExternalDocsState = () => {
  const [externalDocsState, setExternalDocsState] =
    useRecoilState(externalDocsAtom);

  const resetState = () => {
    setExternalDocsState(defaultState);
  };

  return {
    externalDocsState,
    setExternalDocsState,
    resetState,
  };
};

import { useCallback, useEffect, useState } from "react";

export const useGetElementPosition = (elementSelector) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const getPosition = useCallback(() => {
    const element = document.querySelector(elementSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  });

  useEffect(() => {
    getPosition();
  }, [elementSelector]);

  useEffect(() => {
    window.addEventListener("resize", getPosition);
    return () => window.removeEventListener("resize", getPosition);
  }, [elementSelector]);

  return [position];
};

export default useGetElementPosition;

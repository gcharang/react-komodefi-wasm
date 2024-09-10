import Cookies from "js-cookie";
import React, { useEffect, useMemo, useRef, useState } from "react";
import useGetElementPosition from "../hooks/useGetElementPosition";
import { useExternalDocsState } from "../store/externalDocs/index.js";

export const DocsSpotlight = () => {
  const [position] = useGetElementPosition("#docs-selector");
  const { externalDocsState } = useExternalDocsState();
  const [shouldHideSpotlight, setShouldHideSpotlight] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const lastSpotlightTimestamp = +Cookies.get("lastSpotlightTimestamp");
    const currentTimestamp = new Date().getTime();

    // If the last display timestamp is not set or more than 24 hours have passed, show the modal
    if (
      !lastSpotlightTimestamp ||
      currentTimestamp - lastSpotlightTimestamp > 24 * 60 * 60 * 1000
    ) {
    } else {
      setShouldHideSpotlight(true);
    }
  }, []);

  const spotlightDocs = useMemo(() => {
    return (
      position.top && (
        <div
          onClick={() => {
            // Set a cookie with the current timestamp to record when the modal was last displayed
            Cookies.set("lastSpotlightTimestamp", new Date().getTime(), {
              expires: 1,
            }); // Expires in 1 day
            setShouldHideSpotlight(true);
          }}
          className={`${externalDocsState.response && !shouldHideSpotlight ? "block" : "hidden"} fixed top-0 left-0 w-full h-full z-10 bg-black/60`}
        >
          <div
            ref={contentRef}
            className="fixed text-white"
            style={{
              top: `${position.top}px`,
              left: `calc(${position.left}px - ${70}px)`,
            }}
          >
            <div className="flex flex-col items-center gap-6 w-56">
              <div className="rotate-180">
                <svg
                  width="103"
                  height="125"
                  viewBox="0 0 103 125"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M78.7892 14.9662C88.4244 19.2572 89.0034 35.3909 83.529 42.8299C75.0176 54.396 58.4013 61.0608 44.3909 56.7672C38.0194 54.8147 30.7116 51.4336 25.9008 46.8994C23.4258 44.5667 20.6398 39.9206 21.8516 36.8693C25.6512 27.3014 52.6298 34.7375 58.1841 37.0553C70.5006 42.195 87.7778 54.7552 85.4832 71.0466C83.1782 87.4122 73.3262 99.3825 62.7297 111.205C60.8755 113.274 58.4914 115.144 56.8518 117.32"
                    stroke="white"
                    stroke-width="4"
                    stroke-linecap="round"
                  />
                  <path
                    d="M61.4615 118.864L54.375 120.176L54.359 113.313"
                    stroke="white"
                    stroke-width="3"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <p className="">
                click this button to access docs and easily run commands in the
                playground
              </p>
            </div>
          </div>
        </div>
      )
    );
  }, [position, externalDocsState, shouldHideSpotlight]);

  return <>{spotlightDocs}</>;
};

export default DocsSpotlight;

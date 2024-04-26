"use client";

import React, { useEffect } from "react";

const page = () => {
  function listenOnEventsFromDocs(event) {
    if (event.origin !== "http://localhost:3000") {
      return;
    }
    let receivedData = event.data;
    localStorage.setItem("docs-code-rpc", JSON.stringify(receivedData));
  }

  useEffect(() => {
    window.addEventListener("message", listenOnEventsFromDocs);

    window.addEventListener("beforeunload", () => {
      localStorage.removeItem("docs-code-rpc");
      localStorage.removeItem("mm2-tab-open");
    });

    return () => {
      window.removeEventListener("message", listenOnEventsFromDocs);
    };
  }, []);

  function listenOnEventsFromMM2Response(event) {
    if (event.key === "mm2-tab-open") {
      if (event.newValue === null)
        window.parent.postMessage("mm2-tab-closing", "*");
      else window.parent.postMessage("mm2-tab-open", "*");
    }
    if (event.key === "docs-code-rpc-response") {
      // Handle the received data
      let receivedData = JSON.parse(event.newValue);

      window.parent.postMessage(receivedData, "*");
      localStorage.removeItem("docs-code-rpc");
    }
  }
  useEffect(() => {
    window.addEventListener("storage", listenOnEventsFromMM2Response);

    return () => {
      window.removeEventListener("storage", listenOnEventsFromMM2Response);
    };
  }, []);

  return null;
};

export default page;

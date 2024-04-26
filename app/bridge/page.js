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

    return () => {};
  }, []);

  function listenOnEventsFromMM2Response(event) {
    if (event.key !== "docs-code-rpc-response") return;
    // Handle the received data
    let receivedData = JSON.parse(event.newValue);

    window.parent.postMessage(receivedData, "*");
    localStorage.removeItem("docs-code-rpc");
  }
  useEffect(() => {
    window.addEventListener("storage", listenOnEventsFromMM2Response);

    return () => {
      window.removeEventListener("message", listenOnEventsFromMM2Response);
    };
  }, []);

  return null;
};

export default page;

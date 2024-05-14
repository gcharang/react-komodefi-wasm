"use client";

import { useEffect } from "react";

const docsBaseUrl = "http://localhost:3000";
// const docsBaseUrl =
//   "https://mm2-code-runner-from-docs.komodo-docs-revamp-2023.pages.dev";

const page = () => {
  function listenOnEventsFromDocs(event) {
    console.log("in event listener for message event in iframe ", event);
    // if (event.origin !== docsBaseUrl) {
    //   return;
    // }
    let receivedData = event.data;
    localStorage.setItem("docs-code-rpc", JSON.stringify(receivedData));
  }

  useEffect(() => {
    console.log("in message use Effect - iframe");

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
    console.log("IN iframe event listener for storage events", event);
    try {
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
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    console.log("in storage use Effect - iframe");
    window.addEventListener("storage", listenOnEventsFromMM2Response);

    return () => {
      window.removeEventListener("storage", listenOnEventsFromMM2Response);
    };
  }, []);

  return null;
};

export default page;

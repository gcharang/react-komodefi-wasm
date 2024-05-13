"use client";
import Head from "next/head";

import React, { useEffect } from "react";

const docsBaseUrl =
  "https://mm2-code-runner-from-docs.komodo-docs-revamp-2023.pages.dev";

const page = () => {
  function listenOnEventsFromDocs(event) {
    // if (event.origin !== docsBaseUrl) {
    //   return;
    // }
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

  // TODO: revisit reasons why next/head isn't injecting meta tags to <head> here
  return (
    <head>
      <meta name="robots" content="noindex,nofollow" />
      <meta http-equiv="Access-Control-Allow-Origin" content={docsBaseUrl} />
    </head>
  );
};

export default page;

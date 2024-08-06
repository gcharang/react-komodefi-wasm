"use client";
import React, { useEffect, useRef } from "react";
import { init_wasm } from "../../src/components/Mm2Panel";
import { mm2_main, mm2_rpc } from "../../src/js/mm2lib";
import { getBaseUrl } from "../../src/shared-functions/getBaseUrl";
import { updateUserPass } from "../../src/shared-functions/updateUserPassword";

// const domainA =
//   process.env.NODE_ENV === "production"
//     ? "https://domain-a.vercel.app"

const isAllowedDomain = (domain) => {
  const localDomains = ["http://localhost:3000", "http://localhost:3001"];
  if (localDomains.includes(domain)) return true;
  else if (
    domain.startsWith("https://") &&
    domain.endsWith(".komodo-docs-revamp-2023.pages.dev")
  )
    return true;
  else return;
};

const staticPassword = "2!CRawzBL";
const Page = () => {
  const wasmInit = useRef(false);

  async function listenOnEventsFromDocs(event) {
    if (!isAllowedDomain(event.origin)) return;

    // console.log("message from docs" + event.origin + " " + event.data);
    let receivedData = JSON.parse(event.data);

    if (wasmInit.current) {
      try {
        let updatedData = updateUserPass(receivedData, staticPassword);
        const response = await mm2_rpc(updatedData);
        // console.log("rpc response", response);
        event.source.postMessage(
          JSON.stringify({
            requestId: event.data,
            response: response,
          }),
          {
            targetOrigin: "*",
          }
        );
      } catch (error) {
        console.log("couldn't send rpc request", error);
      }
    }
  }

  function handle_log(level, line) {
    // log_level: 0, disables this
    console.log(level, line);
  }
  useEffect(() => {
    if (wasmInit.current) return;
    init_wasm().then(async () => {
      wasmInit.current = true;
      try {
        // default config from static data file
        const conf_js = {
          gui: "WASMTEST",
          mm2: 1,
          passphrase: "wasmtest",
          rpc_password: staticPassword,
          netid: 8762,
        };
        const baseUrl = getBaseUrl();
        let coinsUrl = new URL(baseUrl + "/coins");
        let coins = await fetch(coinsUrl);
        let coinsJson = await coins.json();
        conf_js.coins = coinsJson;
        console.log(conf_js);
        mm2_main(
          {
            conf: conf_js,
            log_level: 0,
          },
          handle_log
        );
      } catch (error) {
        console.error("Couldn't initialize MM2 Instance", error);
      }
    });
    return () => {};
  }, []);

  useEffect(() => {
    window.addEventListener("message", listenOnEventsFromDocs);

    return () => {
      window.removeEventListener("message", listenOnEventsFromDocs);
    };
  }, []);

  return null;
};

export default Page;

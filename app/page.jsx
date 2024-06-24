"use client";
import { RecoilRoot } from "recoil";
import dynamic from "next/dynamic";
// import App from '../src/App';
import { GenericModal } from "../src/components/GenericModal";
const App = dynamic(() => import("../src/App"), { ssr: false });

export default function Page() {
  return (
    <RecoilRoot>
      <GenericModal />
      <App />
    </RecoilRoot>
  );
}

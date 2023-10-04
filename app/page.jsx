"use client";
import { RecoilRoot } from "recoil";
import dynamic from "next/dynamic";
// import App from '../src/App';

const App = dynamic(() => import("../src/App"), { ssr: false });

export default function Page() {
  return (
    <RecoilRoot>
      <App />
    </RecoilRoot>
  );
}

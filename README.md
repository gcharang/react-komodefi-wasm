# react-atomicdex-wasm

## Pre-requisites

- NodejsV16 or newer. Recommendation: use `nvm`: https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/

## Build steps

- `npm ci` -> the first time
- `npm run dev` -> starts a server at http://localhost:1234/

## Misc notes

To change the mm2 bin being used, replace the file: `public/mm2_bg.wasm` with it

To keep multiple versions of mm2 bins in the public folder and test them one by one, make sure all of them have different names, then replace the name `mm2_bg.wasm` at https://github.com/gcharang/react-atomicdex-wasm/blob/master/src/App.jsx#L30

Might want to restart the dev server and hard refresh(shift + f5) the browser window when mm2 being used is changed in code or replaced with same name in the file system

Best to open/reopen the url: http://localhost:1234/ in a private/incognito window when testing code/mm2 changes, to be completely sure that cached mm2 bins/other code aren't interfering

To update the API version using a url to a zipfile, use `./update_wasm.sh $zipfile_url`

To update the `coins` file version using a url to a raw github data, use `./update_coins.sh https://raw.githubusercontent.com/KomodoPlatform/coins/master/coins`
# react-atomicdex-wasm

## Pre-requisites

- NodejsV16 or newer. Recommendation: use `nvm`: https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/

## Build steps

- `yarn` -> the first time
- `yarn dev` -> starts a server at http://localhost:3000/

## Misc notes

To change the mm2 bin being used, replace the file: `public/mm2lib_bg.wasm` with it

To keep multiple versions of mm2 bins in the public folder and test them one by one, make sure all of them have different names, then replace the name `mm2lib_bg.wasm` in https://github.com/gcharang/react-komodefi-wasm/blob/master/src/components/Mm2Panel.jsx

Might want to restart the dev server and hard refresh(shift + f5) the browser window when the mm2 binary being used is changed in code or replaced with same name in the file system

Best to open/reopen the url: http://localhost:3000/ in a private/incognito window when testing code/mm2 changes, to be completely sure that cached mm2 bins/other code aren't interfering

To update the API version using a url to a zipfile, use `./update_wasm.sh $zipfile_url`

To update the `coins` file version using a url to a raw github data, use `./update_coins.sh https://raw.githubusercontent.com/KomodoPlatform/coins/master/coins`

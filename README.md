# react-atomicdex-wasm

## Pre-requisites

- NodejsV16 or newer. Recommendation: use `nvm`: https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/
- `yarn`. once node and npm are installed, `npm install -g yarn`

## Build steps


- `yarn` -> the first time
- `yarn dev` -> starts a server at http://localhost:1234/

## Misc notes

To change the mm2 being used, replace the file: `public/mm2_bg.wasm` with it

To keep multiple versions of mm2 bin in the public folder and test them one by one, make sure all of them have different names, then replace the name `mm2_bg.wasm` at https://github.com/gcharang/react-atomicdex-wasm/blob/master/src/App.jsx#L30

might want to re start the dev server when mm2 being used is changed in code or replaced with same name in file system

best to open the url: http://localhost:1234/ in a private/incognito window when testing code/mm2 changes, to be completely sure that cached mm2 bins/other code aren't interfering

To update the API version using a url to a zipfile, use `./update_wasm.sh $zipfile_url`
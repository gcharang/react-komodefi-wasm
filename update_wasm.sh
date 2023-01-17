mkdir temp && cd temp
wget $1
unzip ${1##*/}
mv mm2lib_bg.wasm ../public/mm2_bg.wasm
mv mm2lib.js ../src/js/mm2.js
cp -r snippets/* ../src/js/snippets/
cd ..
rm -rf temp
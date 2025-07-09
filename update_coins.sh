set -ev

git submodule update --init --recursive
git submodule update --remote

cp -r coins/coins public/coins
cp coins/seed-nodes.json src/store/staticData/seed-nodes.json
mkdir -p src/store/staticData/electrums
cp coins/electrums/DOC src/store/staticData/electrums/DOC.json
cp coins/electrums/MARTY src/store/staticData/electrums/MARTY.json
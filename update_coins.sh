set -ev

git submodule update --init --recursive
git submodule update --remote

cp -r coins/coins public/coins
cp coins/seed-nodes.json src/staticData/seed-nodes.json

# Create electrums directories
mkdir -p src/staticData/electrums
mkdir -p public/electrums

cp coins/electrums/DOC src/staticData/electrums/DOC.json
cp coins/electrums/MARTY src/staticData/electrums/MARTY.json
cp coins/utils/coins_config_wss.json src/staticData/coins_config_wss.json

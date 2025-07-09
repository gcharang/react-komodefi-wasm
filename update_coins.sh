set -ev

git submodule update --init --recursive
git submodule update --remote

cp -r coins/coins public/coins
cp coins/seed-nodes.json src/store/staticData/seed-nodes.json
export async function fetchRpcMethods(collectionUrl) {
  const result = await fetch(
    collectionUrl
      ? collectionUrl
      : "https://raw.githubusercontent.com/KomodoPlatform/komodo-docs-mdx/postman-update/postman/collections/komodo_defi.postman_collection.json"
  );
  const json = await result.json();
  return json;
}

export const getRawValues = (arr) => {
  let rawValues = [];
  let levels = [];
  let bigData = {};
  const findRaw = (item, isLastIteration) => {
    if (item?.request?.body?.raw) {
      let rawData = item.request.body.raw.replace(
        /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
        (m, g) => (g ? "" : m)
      );
      bigData[levels.join(" > ")] = [
        ...(bigData[levels.join(" > ")] ?? []),
        JSON.parse(rawData),
      ];
      rawValues.push(JSON.parse(rawData));
    }
    if (item.item) {
      if (item.name) {
        levels.push(item.name);
      }
      item.item.forEach((data, index) => {
        findRaw(data, item.item.length === index + 1);
      });
    }
    if (isLastIteration) levels.pop();
  };

  arr.forEach((item) => {
    levels = [];
    findRaw(item);
  });

  return bigData;
};

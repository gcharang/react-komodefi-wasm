export async function fetchRpcMethods(collectionUrl?: string): Promise<any> {
  const result = await fetch(
    collectionUrl
      ? collectionUrl
      : "https://raw.githubusercontent.com/KomodoPlatform/komodo-docs-mdx/dev/postman/collections/komodo_defi.postman_collection.json"
  );
  const json = await result.json();
  return json;
}

export const getRawValues = (arr: any[]): Record<string, any[]> => {
  // let rawValues = [];
  let levels: string[] = [];
  let bigData: Record<string, any[]> = {};
  const findRaw = (item: any, isLastIteration?: boolean) => {
    if (item?.request?.body?.raw) {
      // get the stringified `raw` data
      let rawData = JSON.parse(
        item.request.body.raw.replace(
          /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
          (m: string, g: string) => (g ? "" : m)
        )
      );
      if (item?.name) {
        // This will be used as the method name in the dropdown
        rawData.name = item.name;
      }
      // This is where we store all the methods. bigData `key`s itself is gotten from the
      // `name` key in each level that gets us to the `raw` data. This can be found to be the identifier dropdown sections
      bigData[levels.join(" > ")] = [
        ...(bigData[levels.join(" > ")] ?? []),
        rawData,
      ];
      // rawValues.push(rawData);
    }
    if (item.item) {
      if (item.name) {
        // This is how we keep track of the levels using the `name` key
        levels.push(item.name);
      }
      item.item.forEach((data: any, index: number) => {
        findRaw(data, item.item.length === index + 1);
      });
    }
    // We wouldn't want to add previous levels to new iteration. So we start afresh here.
    if (isLastIteration) levels.pop();
  };

  arr.forEach((item) => {
    levels = [];
    findRaw(item);
  });

  return bigData;
};

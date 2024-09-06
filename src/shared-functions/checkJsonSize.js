const LINES_THRESHOLD = 10_000;
export function checkJSONSize(jsonObject) {
  // Convert JSON to string with 2-space indentation
  const stringified = JSON.stringify(JSON.parse(jsonObject), null, 2);

  // Count the number of lines
  const lineCount = stringified.split("\n").length;

  return {
    exceedsThreshold: lineCount > LINES_THRESHOLD,
    lineCount,
    stringifiedLength: stringified.length,
  };
}

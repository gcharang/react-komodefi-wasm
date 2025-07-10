export function highlightJSON(json) {
  if (!json) return { type: "string", value: "" };
  const parse = (data) => {
    if (typeof data === "string") {
      return { type: "string", value: data };
    }
    if (typeof data === "number") {
      return { type: "number", value: data };
    }
    if (typeof data === "boolean") {
      return { type: "boolean", value: data };
    }
    if (data === null) {
      return { type: "null", value: null };
    }
    if (Array.isArray(data)) {
      return { type: "array", value: data.map(parse) };
    }
    if (isPlainObject(data)) {
      const obj = {};
      for (const [key, value] of Object.entries(data)) {
        obj[key] = parse(value);
      }
      return { type: "object", value: obj };
    }
    throw new Error(`Unsupported JSON data type: ${typeof data}`);
  };

  const jsonObj = typeof json === "string" ? JSON.parse(json) : json;
  return parse(jsonObj);
}

export function renderHighlightedJSON(json, indentLevel = 0) {
  const indent = "  ".repeat(indentLevel);

  const renderValue = (value, level) => {
    switch (value.type) {
      case "string":
        return `<span class="text-green-500">"${value.value}"</span>`;
      case "number":
        return `<span class="text-blue-500">${value.value}</span>`;
      case "boolean":
        return `<span class="text-yellow-500">${value.value}</span>`;
      case "null":
        return '<span class="text-red-500">null</span>';
      case "array":
        return `[\n${value.value
          .map(
            (item) => `${"  ".repeat(level + 1)}${renderValue(item, level + 1)}`
          )
          .join(",\n")}\n${"  ".repeat(level)}]`;
      case "object":
        return `{\n${Object.entries(value.value)
          .map(
            ([key, val]) =>
              `${"  ".repeat(
                level + 1
              )}<span class="text-pink-500">"${key}"</span>: ${renderValue(
                val,
                level + 1
              )}`
          )
          .join(",\n")}\n${"  ".repeat(level)}}`;
      default:
        throw new Error(`Unknown type: ${value.type}`);
    }
  };

  return `${indent}${renderValue(json, indentLevel)}`;
}

function isPlainObject(value) {
  return (
    typeof value === "object" && value !== null && value.constructor === Object
  );
}

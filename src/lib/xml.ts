import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  allowBooleanAttributes: true,
  ignoreAttributes: false,
  attributeNamePrefix: "",
  preserveOrder: true,
  isArray: () => true,
});

export function parseXML(content: string) {
  const data = parser.parse(content);
  if (data.length != 1) {
    throw new Error(`Root contained ${data.length} elements, expected 1`);
  }

  return data[0];
}

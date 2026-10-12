import { resolvePath } from "./util";

export const DATA_WAK_VERSION = 0;

export function loadDataWak(buffer: Buffer, fileMap = new Map<string, Buffer>()) {
  let cursor = 0, read32le = () => buffer.readUint32LE((cursor += 4) - 4);

  const version = read32le();
  const fileCount = read32le();
  const _firstFile = read32le();
  const _padding = read32le();

  if (version != DATA_WAK_VERSION) {
    throw new Error(`data.wak has a different version (got ${version}, expected ${DATA_WAK_VERSION})`);
  }

  for (let i = 0; i < fileCount; i++) {
    const offset = read32le();
    const size = read32le();
    const nameLength = read32le();
    const name = buffer.subarray(cursor, cursor += nameLength).toString("utf8");
    const path = resolvePath(name);
    const content = buffer.subarray(offset, offset + size);

    fileMap.set(path, content);
  }

  return fileCount;
}

export function generateDataWak(fileMap: Map<string, Buffer>) {
  const files: { name: Buffer, content: Buffer, offset: number }[] = [];

  let listSize = 4 * 4;
  let contentSize = 0;
  fileMap.delete("data/data.wak");

  for (const [path, content] of fileMap) {
    const name = Buffer.from(path, "utf8");

    files.push({
      name, content,
      offset: contentSize
    });

    listSize += 3 * 4 + name.length;

    /*
      For some reason, I could not reproduce the identical vanilla data.wak with this,
      even though fileMap was in the same order, and only data/data.wak was loaded.

      After some debugging:
      - `data/biome/friend_1.xml`: 4398 bytes at 1375110
      - `data/biome/friend_2.xml`: 4398 bytes at 1379509
      - `data/biome/friend_3.xml`: 4398 bytes at 1383908

      (1379509-1375110) is 4399 instead of 4398

      So apparently there's a 0 byte after every single file
    */
    contentSize += content.length + 1;
  }

  const out = Buffer.alloc(listSize + contentSize);
  let cursor = 0, write32le = (n: number) => out.writeUint32LE(n, (cursor += 4) - 4);

  write32le(DATA_WAK_VERSION);
  write32le(files.length);
  write32le(listSize);
  write32le(0);

  for (const file of files) {
    const offset = file.offset + listSize;

    write32le(offset);
    write32le(file.content.length);
    write32le(file.name.length);

    out.set(file.name, cursor);
    cursor += file.name.length;

    out.set(file.content, offset);
  }

  return out;
}

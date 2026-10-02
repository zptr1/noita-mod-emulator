interface FileChange {
  action: "write" | "add_append" | "set_appends" | "image";
  at: number;
  mod: string;
  path: string;
  script?: string;
}

export const fileChangeLog: FileChange[] = [];

const MAX_BYTES = 1_800_000;

export async function filesToDataUrls(files: FileList | File[]): Promise<string[]> {
  const list = Array.from(files);
  const out: string[] = [];
  for (const file of list) {
    if (file.size > MAX_BYTES) {
      throw new Error(`File too large: ${file.name} (max ~${Math.round(MAX_BYTES / 1024)} KB)`);
    }
    const url = await readOneFile(file);
    out.push(url);
  }
  return out;
}

function readOneFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const v = r.result;
      if (typeof v === "string") resolve(v);
      else reject(new Error("Could not read file"));
    };
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });
}

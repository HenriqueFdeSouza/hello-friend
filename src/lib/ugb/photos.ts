import type { Photo } from "./types";

export const uid = (prefix = "id") =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const MAX_DIM = 1280;
const QUALITY = 0.72;

/** Redimensiona e comprime a imagem antes de armazenar no localStorage. */
export async function fileToPhoto(file: File): Promise<Photo> {
  const dataUrl = await compressImage(file);
  return {
    id: uid("photo"),
    src: dataUrl,
    caption: "",
    date: new Date().toISOString().slice(0, 10),
    system: "",
    local: "",
    phase: "unica",
    inPdf: true,
  };
}

export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler a imagem"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Imagem inválida"));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(String(reader.result));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const webp = canvas.toDataURL("image/webp", QUALITY);
        resolve(webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", QUALITY));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export const isLargeFile = (file: File) => file.size > 1_200_000;

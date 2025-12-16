export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // CORS sorunlarını önlemek için
    image.src = url;
  });

export function getRotationFixedImage(image: HTMLImageElement, rotation = 0) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const newWidth = image.width * Math.abs(Math.cos(rotation * Math.PI / 180)) + image.height * Math.abs(Math.sin(rotation * Math.PI / 180));
  const newHeight = image.height * Math.abs(Math.cos(rotation * Math.PI / 180)) + image.width * Math.abs(Math.sin(rotation * Math.PI / 180));

  canvas.width = newWidth;
  canvas.height = newHeight;

  if (!ctx) return null;

  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  return canvas;
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  // Döndürme işlemi varsa (şu an 0 kullanıyoruz ama ilerde lazım olabilir)
  const rotCanvas = getRotationFixedImage(image, rotation) || image;

  // Canvas boyutlarını kırpılan alan kadar ayarla
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Kırpılan alanı yeni canvas'a çiz
  ctx.drawImage(
    rotCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Canvas'ı Blob (dosya) olarak dışarı aktar
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg", 0.95); // JPEG formatında, %95 kalitede kaydet
  });
}
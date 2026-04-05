import { buildUrl } from 'cloudinary-build-url';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

export const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_preset'); // USER: Ensure this exists in your Cloudinary dashboard

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};

export const getOptimizedImage = (publicId: string) => {
  return buildUrl(publicId, {
    cloud: {
      cloudName: CLOUD_NAME,
    },
    transformations: {
      quality: 'auto',
      format: 'webp',
    }
  });
};

import { supabase } from '../lib/supabase';

export const storageService = {
  /**
   * Upload an image file to Supabase Storage
   * @param file - The image file to upload
   * @param bucket - The storage bucket name (default: 'company-images')
   * @param path - Optional path within the bucket
   * @returns The public URL of the uploaded image
   */
  async uploadImage(
    file: File,
    bucket: string = 'company-images',
    path?: string
  ): Promise<string> {
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  /**
   * Upload multiple images
   * @param files - Array of image files
   * @param bucket - The storage bucket name
   * @param path - Optional path within the bucket
   * @returns Array of public URLs
   */
  async uploadImages(
    files: File[],
    bucket: string = 'company-images',
    path?: string
  ): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, bucket, path));
    return Promise.all(uploadPromises);
  },

  /**
   * Delete an image from storage
   * @param url - The public URL of the image
   * @param bucket - The storage bucket name
   */
  async deleteImage(url: string, bucket: string = 'company-images'): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = url.split(`${bucket}/`);
      if (urlParts.length < 2) {
        throw new Error('Invalid image URL');
      }
      const filePath = urlParts[1];

      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  /**
   * Delete multiple images
   * @param urls - Array of public URLs
   * @param bucket - The storage bucket name
   */
  async deleteImages(urls: string[], bucket: string = 'company-images'): Promise<void> {
    const deletePromises = urls.map((url) => this.deleteImage(url, bucket));
    await Promise.all(deletePromises);
  },

  /**
   * Upload a voice note (audio file)
   * @param file - The audio file to upload
   * @param bucket - The storage bucket name (default: 'voice-notes')
   * @param path - Optional path within the bucket
   * @returns The public URL of the uploaded audio
   */
  async uploadVoiceNote(
    file: File,
    bucket: string = 'voice-notes',
    path?: string
  ): Promise<string> {
    return this.uploadImage(file, bucket, path);
  },

  /**
   * Get a signed URL for private files (if needed in the future)
   * @param filePath - The path to the file in storage
   * @param bucket - The storage bucket name
   * @param expiresIn - Expiration time in seconds (default: 3600)
   * @returns Signed URL
   */
  async getSignedUrl(
    filePath: string,
    bucket: string = 'company-images',
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      if (!data) throw new Error('No signed URL returned');

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  },

  /**
   * Compress an image before uploading
   * @param file - The image file to compress
   * @param maxWidth - Maximum width (default: 1024)
   * @param quality - Image quality 0-1 (default: 0.8)
   * @returns Compressed image as Blob
   */
  async compressImage(
    file: File,
    maxWidth: number = 1024,
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Could not compress image'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  },

  /**
   * Upload a compressed image
   * @param file - The image file to compress and upload
   * @param bucket - The storage bucket name
   * @param path - Optional path within the bucket
   * @returns The public URL of the uploaded image
   */
  async uploadCompressedImage(
    file: File,
    bucket: string = 'company-images',
    path?: string
  ): Promise<string> {
    try {
      const compressedBlob = await this.compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, {
        type: 'image/jpeg',
      });
      return this.uploadImage(compressedFile, bucket, path);
    } catch (error) {
      console.error('Error uploading compressed image:', error);
      throw error;
    }
  },
};

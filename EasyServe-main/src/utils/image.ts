import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { logger } from './logger';
export const imageUtils = {
  async compressImage(uri: string, quality: number = 0.7): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(uri, [], {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      return result.uri;
    } catch (error) {
      logger.error('ImageUtils', 'Compression failed', error);
      return uri;
    }
  },

  async pickImage(): Promise<string | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
      });

      if (!result.canceled && result.assets[0]) {
        return await this.compressImage(result.assets[0].uri);
      }
      return null;
    } catch (error) {
      logger.error('ImageUtils', 'Pick image failed', error);
      return null;
    }
  },

  getFileName(uri: string): string {
    return uri.split('/').pop() || 'image.jpg';
  },

  getFileSize(sizeInBytes: number): string {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  },
};
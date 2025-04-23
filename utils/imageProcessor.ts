/**
 * 图片处理工具函数
 */

// 文件大小限制（以字节为单位）
export const IMAGE_SIZE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 10MB
  COMPRESSION_THRESHOLD: 2 * 1024 * 1024, // 3MB
};

/**
 * 检查并处理图片
 * @param file 图片文件
 * @returns 处理后的DataURL或错误信息
 */
export async function processImage(file: File): Promise<{ dataUrl: string | null; error: string | null }> {
  // 检查文件大小是否超过最大限制
  if (file.size > IMAGE_SIZE_LIMITS.MAX_SIZE) {
    return { 
      dataUrl: null, 
      error: `图片过大（${(file.size / (1024 * 1024)).toFixed(2)}MB），请上传小于3MB的图片` 
    };
  }

  // 如果图片大于压缩阈值，则进行压缩
  if (file.size > IMAGE_SIZE_LIMITS.COMPRESSION_THRESHOLD) {
    try {
      const compressedDataUrl = await compressImage(file);
      return { dataUrl: compressedDataUrl, error: null };
    } catch (error) {
      console.error("图片压缩失败", error);
      // 压缩失败时返回原始图片
      return { dataUrl: await fileToDataUrl(file), error: null };
    }
  }

  // 文件大小合适，直接转换为DataURL
  return { dataUrl: await fileToDataUrl(file), error: null };
}

/**
 * 将文件转换为DataURL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 压缩图片
 */
async function compressImage(file: File): Promise<string> {
  // 先将文件转换为DataURL以便比较大小
  const originalDataUrl = await fileToDataUrl(file);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // 创建Canvas元素
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      
      // 计算最大尺寸，降低分辨率以提高压缩效果
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      
      // 设置画布尺寸
      canvas.width = width;
      canvas.height = height;
      
      // 绘制图像
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建canvas上下文'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // 确保使用与原始文件相同的MIME类型
      const mimeType = file.type || 'image/jpeg';
      
      // 根据文件大小调整压缩质量
      let quality = 0.7;
      if (file.size > 4 * 1024 * 1024) {
        quality = 0.6;
      }
      
      // 转换为DataURL
      const compressedDataUrl = canvas.toDataURL(mimeType, quality);
      
      // 比较压缩前后的大小
      const originalSize = originalDataUrl.length;
      const compressedSize = compressedDataUrl.length;
      
      // 如果压缩后反而变大，则返回原始DataURL
      if (compressedSize >= originalSize) {
        resolve(originalDataUrl);
      } else {
        resolve(compressedDataUrl);
      }
    };
    
    img.onerror = (err) => {
      reject(err);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 检查DataURL的大小
 */
export function checkDataUrlSize(dataUrl: string): { size: number; isOverLimit: boolean } {
  // 计算DataURL的大约字节大小（去掉头部信息）
  const base64 = dataUrl.split(',')[1];
  const sizeInBytes = Math.floor((base64.length * 3) / 4);
  
  return {
    size: sizeInBytes,
    isOverLimit: sizeInBytes > IMAGE_SIZE_LIMITS.MAX_SIZE
  };
} 
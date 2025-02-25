export const processImage = async (imageFile: File): Promise<any> => {
    // 示例：上传图像文件到后端API进行处理
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('/api/processImage', {
        method: 'POST',
        body: formData,
    });
    return response.json();
}; 


/**
 * Функция по преобразованию base64 в строку подходящую для src изображения.
 * @param base64 - Ссылка на изображение
 * @returns Объект изображения в формате base64 или пустая строка
 */
export function getMimeType(base64: string): string {
  const signatures = {
    '/9j/': 'image/jpeg',
    'iVBORw': 'image/png',
    'Qk2': 'image/bmp'
  };
  
  return Object.entries(signatures).find(([sig]) => 
    base64.startsWith(sig)
  )?.[1] || 'image/png';
};
const MAX_SYLLABUS_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Handles file upload validation and conversion to data URL
 * @param {File} file - The file to process
 * @param {number} maxSizeBytes - Maximum allowed file size in bytes
 * @returns {Promise<string>} - Data URL of the file
 * @throws {Error} - If file is too large or fails to read
 */
export const handleFileUpload = async (file, maxSizeBytes = MAX_SYLLABUS_FILE_SIZE_BYTES) => {
  if (!file) return null;

  // Validate file size
  if (file.size > maxSizeBytes) {
    const maxSizeMb = maxSizeBytes / (1024 * 1024);
    throw new Error(`File is too large. Please upload a file smaller than ${maxSizeMb} MB.`);
  }

  // Read file as data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      resolve(dataUrl);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read uploaded file"));
    };

    reader.readAsDataURL(file);
  });
};

export { MAX_SYLLABUS_FILE_SIZE_BYTES };

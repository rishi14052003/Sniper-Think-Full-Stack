export const helpers = {
  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate email
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Generate random ID
  generateId: () => {
    return Math.random().toString(36).substr(2, 9);
  },

  // Capitalize first letter
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Truncate text
  truncate: (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  },

  // Get file extension
  getFileExtension: (filename) => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  },

  // Check if file is supported
  isSupportedFileType: (file) => {
    const supportedTypes = ['application/pdf', 'text/plain'];
    return supportedTypes.includes(file.type);
  },

  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

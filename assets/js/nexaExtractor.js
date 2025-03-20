// Wrapper untuk nexaExtractor
export const initExtractor = async () => {
  if (window.nexaExtractor) {
    await window.nexaExtractor.init();
  } else {
    throw new Error('nexaExtractor tidak tersedia');
  }
};

export const extractElements = () => {
  if (window.nexaExtractor) {
    window.nexaExtractor.extract();
  } else {
    throw new Error('nexaExtractor tidak tersedia');
  }
}; 
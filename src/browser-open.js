let openModule;

/**
 * Gets the open module (lazy-loaded)
 * @returns {Promise<Function>} - the open function
 */
async function getOpen() {
  if (!openModule) {
    openModule = await import('open');
  }
  return openModule.default;
}

module.exports = { getOpen };

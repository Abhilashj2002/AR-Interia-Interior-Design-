// Backend API bootstrap layer.
// Keeps startup behavior unchanged while providing a structured backend entrypoint.

export const startBackendServer = async () => {
  // Legacy server initializes and starts listening as part of its module side effects.
  await import('../../../server/index.js');
};

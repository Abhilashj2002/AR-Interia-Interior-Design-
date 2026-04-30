// Structured backend entrypoint wrapper.
// Keeps runtime behavior intact while migration out of server/index.js is in progress.
import { startBackendServer } from './bootstrap.js';

void startBackendServer();

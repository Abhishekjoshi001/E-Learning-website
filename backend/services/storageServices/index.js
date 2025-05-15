
// services/storageService/index.js
// This file exports the currently active storage implementation
// If you switch providers in the future, you only need to change this file

import cloudStorage from "./wasabiStorage.js";

// Export the active storage service
export default cloudStorage;
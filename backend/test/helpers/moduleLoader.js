const Module = require("module");

const withPatchedModuleLoad = async (patchedLoad, action) => {
  const originalLoad = Module._load;
  Module._load = patchedLoad(originalLoad);

  try {
    return await action();
  } finally {
    Module._load = originalLoad;
  }
};

module.exports = {
  withPatchedModuleLoad,
};

// Tau Prolog 0.3.4 assigns these names without declaring them.
// Register them before its CommonJS entry runs in the strict worker bundle.
Object.assign(globalThis, {
  window: globalThis,
  prompt: () => "",
  tau_file_system: undefined,
  tau_user_input: undefined,
  tau_user_output: undefined,
  tau_user_error: undefined,
  nodejs_file_system: undefined,
  nodejs_user_input: undefined,
  nodejs_user_output: undefined,
  nodejs_user_error: undefined,
});

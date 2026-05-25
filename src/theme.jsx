// hne theme mta3 l app: alwen, tokens, w settings mta3 light mode w dark mode.
export const getDesignTokens = (mode) => ({
  palette: {
    mode,

    ...(mode === "light"
      ? {
          background: {
            default: "#f6f6f6",
            paper: "#ffffff",
          },
        }
      : {
          background: {
            default: "#0f172a",
            paper: "#111827",
          },
        }),
  },
});

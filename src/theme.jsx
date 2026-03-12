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
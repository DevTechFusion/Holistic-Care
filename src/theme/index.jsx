import { useMemo } from "react";
import { createTheme, CssBaseline, StyledEngineProvider, ThemeProvider } from "@mui/material";
import palette from "./palette";
import ComponentsOverride from "./components";
import breakpoints from "./breakpoints";

export default function ThemeConfig({ children }) {
  const themeOptions = useMemo(
    () => ({
      palette,
      breakpoints,
      typography: {
        fontFamily: `"Inter", sans-serif`,
        fontSize: 14,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
      },
    }),
    []
  );

  const theme = createTheme(themeOptions);
  theme.components = ComponentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4F46E5",
    },
    background: {
      default: "#F8FAFC",
    },
  },
  shape: {
    borderRadius: 10,
  },
});

export default theme;

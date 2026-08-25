import AppRoutes from "./routes";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App;

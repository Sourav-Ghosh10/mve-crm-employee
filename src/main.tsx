import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store/store";
import App from "./App";
import "./styles/global.css";
import "./lib/i18n";



// Initialize Mirage JS mock server in development
// DISABLED: Using real API instead of mock server
// async function enableMocking() {
//   // if (import.meta.env.DEV) {
//   //   const { makeServer } = await import("./mocks/server");
//   //   makeServer({ environment: "development" });
//   // }
// }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </Provider>
    </React.StrictMode>,
  );
// });

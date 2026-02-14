import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId = "137921510243-4hrhdr9atref9rj0198od8n528e7grkp.apps.googleusercontent.com" >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);

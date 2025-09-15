import React from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { HomePage } from "./components/HomePage";
import { NotFoundPage } from "./components/NotFoundPage";
import "./style.css";

interface AppConfig {
  appName: string;
  apiUrl: string;
  environment: string;
  version: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig;
  }
}

export const App: React.FC = () => {
  const location = useLocation();
  const config = window.__APP_CONFIG__;

  React.useEffect(() => {
    console.log("Hello World SPA initialized!", config);
  }, [config]);

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={location.pathname === "/about" ? "active" : ""}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={location.pathname === "/contact" ? "active" : ""}
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      <main id="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
};

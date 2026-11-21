import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Layout from "@/components/Layout.jsx";
import Home from "@/pages/Home.jsx";
import Services from "@/pages/Services.jsx";
import Book from "@/pages/Book.jsx";
import Portfolio from "@/pages/Portfolio.jsx";
import About from "@/pages/About.jsx";
import Reviews from "@/pages/Reviews.jsx";
import Contact from "@/pages/Contact.jsx";
import Faq from "@/pages/Faq.jsx";
import Appointments from "@/pages/Salon/Appointments.jsx";
import Setup from "@/pages/Salon/Setup.jsx";

import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/book" element={<Book />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/about" element={<About />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/salon" element={<Navigate to="/salon/appointments" replace />} />
            <Route path="/salon/appointments" element={<Appointments />} />
            <Route path="/salon/setup" element={<Setup />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

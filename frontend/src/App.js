import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./container/homepage";
import Login from "./container/login";
import Dashboard from "./container/Dashboard";
import Sample from "./container/Sample";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastProvider from "./components/ToastProvider";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sample"
          element={
            <ProtectedRoute>
              <Sample />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastProvider />
    </BrowserRouter>
  );
};

export default App;

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./container/homepage";
import Login from "./container/login";
import Dashboard from "./container/Dashboard";
import Sample from "./container/Sample";
import ProjectManagemet from "./container/ProjectManagement";
import CreateNewProject from "./container/create-new-project";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastProvider from "./components/ToastProvider";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import EditProject from "./container/edit-project";
import Clients from "./container/client";
import EditClient from "./container/edit-client";
import Editors from "./container/editors";
import EditEditors from "./container/edit-editor";

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

        <Route
          path="/projectmanagement"
          element={
            <ProtectedRoute>
              <ProjectManagemet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projectmanagement/create-project"
          element={
            <ProtectedRoute>
              <CreateNewProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projectmanagement/edit/:id"
          element={
            <ProtectedRoute>
              <EditProject />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client"
          element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/edit/:id"
          element={
            <ProtectedRoute>
              <EditClient />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editors"
          element={
            <ProtectedRoute>
              <Editors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editors/edit/:id"
          element={
            <ProtectedRoute>
              <EditEditors />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastProvider />
    </BrowserRouter>
  );
};

export default App;

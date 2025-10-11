import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./container/homepage";
import Login from "./container/login";
import Dashboard from "./container/Dashboard";
import Sample from "./container/Sample";
import Profile from "./container/profile";
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
import Customer from "./container/customer-service";
import CreateTicket from "./container/create-ticket";
import ViewTicket from "./container/view-ticket";
import FMPayouts from "./container/fm-payout";
import ViewPayouts from "./container/view-fmpayout";
import ApplicationData from "./container/application-data";
import OnlineStore from "./container/online-store";
import CustomizePage from "./container/os-customizepage";
import Preferences from "./container/preference";
import Home from "./container/cms-home";
import AddNewClient from "./container/add-new-client";
import AddNewEditor from "./container/add-new-editor";
import SendInvitation from "./container/SendInvitation";
import Settings from "./container/Settings";
import AddNewAdmin from "./container/new-admin-register";
import VideoEditors from "./container/video-editors";
import VideoGrapher from "./container/videographer";
import VideoEditorHomePage from "./container/videoeditorhomepage";
import VideoGrapherHomePage from "./container/videographerhomepage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/register"
          element={
            <ProtectedRoute>
              <AddNewAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sendinvitation"
          element={
            <ProtectedRoute>
              <SendInvitation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
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
          path="/projectmanagement/:id"
          element={
            <ProtectedRoute>
              <ApplicationData />
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

        <Route
          path="/customerservice"
          element={
            <ProtectedRoute>
              <Customer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customerservice/viewticket"
          element={
            <ProtectedRoute>
              <ViewTicket />
            </ProtectedRoute>
          }
        />

        <Route
          path="/createticket"
          element={
            <ProtectedRoute>
              <CreateTicket />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fmpayouts"
          element={
            <ProtectedRoute>
              <FMPayouts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fmpayouts/view/:project_id"
          element={
            <ProtectedRoute>
              <ViewPayouts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onlinestore"
          element={
            <ProtectedRoute>
              <OnlineStore />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customize"
          element={
            <ProtectedRoute>
              <CustomizePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/preferences"
          element={
            <ProtectedRoute>
              <Preferences />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cmshome"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/add-new-client"
          element={
            <ProtectedRoute>
              <AddNewClient />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/add-new-editors"
          element={
            <ProtectedRoute>
              <AddNewEditor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editors/video"
          element={
            <ProtectedRoute>
              <VideoEditors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editors/videographers"
          element={
            <ProtectedRoute>
              <VideoGrapher />
            </ProtectedRoute>
          }
        />

        <Route
          path="/videoeditorhomepage"
          element={
            <ProtectedRoute>
              <VideoEditorHomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/videographerhomepage"
          element={
            <ProtectedRoute>
              <VideoGrapherHomePage />
            </ProtectedRoute>
          }
        />

      </Routes>
      <ToastProvider />
    </BrowserRouter>
  );
};

export default App;
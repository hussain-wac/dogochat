import React from "react";
import { Provider } from "jotai";
import { useAtomValue } from "jotai";
import { globalState } from "./jotai/globalState";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import MainLayout from "./components/MainLayout";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Home from "./components/Home";
import NotFound from "./components/NotFound"; // ⬅️ Import it
import usePresence from "./hooks/usePresence";

function App() {
  const user = useAtomValue(globalState);

  usePresence();
  return (
    <div>
      <Provider>
        <Toaster />
        <Router>
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/home" /> : <Login />}
            />
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/home/:username" element={<Home />} />
            </Route>

            {/* Wildcard Route for 404 - Keep this at the end */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Provider>
    </div>
  );
}

export default App;

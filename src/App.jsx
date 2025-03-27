import React from 'react'
import { Provider } from "jotai";
import { useAtomValue } from "jotai";
import { globalState } from "./jotai/globalState";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import MainLayout from "./components/MainLayout";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './Login';
import Home from './components/Home'
function App() {
  const user = useAtomValue(globalState);

  return (
    <div>
       <Provider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/home" /> : <Login />} />
          <Route 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
                
            <Route path="/home" element={
              <ProtectedRoute>
              <Home />
              </ProtectedRoute> 
              } />
                    
          </Route>
        </Routes>
      </Router>
    </Provider>
    </div>
  )
}

export default App
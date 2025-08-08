import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Progress from "./pages/Progress";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { useState, useEffect, useMemo } from "react";
import Clarity from "@microsoft/clarity";
import InsightDetails from "./pages/InsightsDetails";
import { AuthProvider } from "./contexts/AuthContext";
import HeaderNavigation from "./components/HeaderNavigation";
import SavedInsights from "./pages/SavedInsights";
import Influencers from "./pages/Influencers";
import InsightsDetails from "./pages/InsightsDetails";
import SignUp from "./pages/SignUp";
import Smartlook from 'smartlook-client';
import Tools from "./pages/Tools";
import ToolDetails from "./pages/ToolDetails";

const queryClient = new QueryClient();
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem("adminToken") !== null && localStorage.getItem("adminToken") !== "";
  
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};


const App = () => {
   useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = "/lovable-uploads/favicon.ico";
    }
  }, []);

  const projectId = useMemo(() => "rolzayo9jx", []);
    const smartlookProjectId = useMemo(() => "c2407cdd2bac6d616f28410212491313aa3bab7e", []);


    const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';

useEffect(() => {
  if (isDebugMode) {
    console.log('Debug mode is ON - Skipping analytics initialization');
    return;
  }

  Clarity.init(projectId);
  Smartlook.init(smartlookProjectId);
}, [projectId]);

  const shouldShowHeader = useMemo(() => {
    const path = window.location.pathname;
    return !path.startsWith('/admin') && !path.startsWith('/bytes/');
  }, []);

 return ( 
   <QueryClientProvider client={queryClient}>
      <ThemeProvider>
          <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
           {shouldShowHeader && <HeaderNavigation />}

            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/tools/:slug" element={<ToolDetails />} />
              <Route path="/saved" element={<SavedInsights />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Admin Routes */}
              <Route path="/bytes/:videoId" element={<InsightDetails />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/posts" element={
                <ProtectedRoute>
                  <AdminDashboard activeTab="posts" />
                </ProtectedRoute>
              } />
              <Route path="/admin/prompts" element={
                <ProtectedRoute>
                  <AdminDashboard activeTab="prompts" />
                </ProtectedRoute>
              } />
              <Route path="/admin/influencers" element={
                <ProtectedRoute>
                  <AdminDashboard activeTab="influencers" />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
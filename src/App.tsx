import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import SavedBytes from "./pages/SavedInsights";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { useState, useEffect, useMemo } from "react";
import Clarity from "@microsoft/clarity";
import InsightDetails from "./pages/InsightsDetails";

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
  // Set favicon
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = "/lovable-uploads/favicon.ico";
    }
  }, []);

  const projectId = useMemo(() => "rolzayo9jx", []);

  useEffect(() => {
    Clarity.init(projectId);
  }, [projectId]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/saved" element={<SavedBytes />} />
              <Route path="/explore" element={<Explore />} />
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
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

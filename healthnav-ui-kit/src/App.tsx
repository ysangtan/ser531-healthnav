import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { CompareProvider } from "@/hooks/use-compare";
import { SavedProvider } from "@/hooks/use-saved";
import { CompareModal } from "@/components/compare/CompareModal";
import { CompareTray } from "@/components/compare/CompareTray";
import Search from "./pages/Search";
import Saved from "./pages/Saved";
import Providers from "./pages/Providers";
import Hospitals from "./pages/Hospitals";
import Settings from "./pages/Settings";
import Compare from "./pages/Compare";
import ProviderDetail from "./pages/ProviderDetail";
import HospitalDetail from "./pages/HospitalDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SavedProvider>
        <CompareProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/search" replace />} />
                <Route path="/search" element={<Search />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/providers" element={<Providers />} />
                <Route path="/provider/:id" element={<ProviderDetail />} />
                <Route path="/hospitals" element={<Hospitals />} />
                <Route path="/hospital/:id" element={<HospitalDetail />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/compare" element={<Compare />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CompareModal />
            <CompareTray />
          </BrowserRouter>
        </CompareProvider>
      </SavedProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

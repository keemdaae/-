
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Project, Profile, AppData } from './types';
import { INITIAL_PROJECTS, INITIAL_PROFILE, Icons } from './constants';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import ProjectDetail from './pages/ProjectDetail';

const AppContext = createContext<{
  data: AppData;
  updateData: (newData: AppData) => void;
} | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-grow p-6 md:p-[50px] flex flex-col">
        <header className="flex justify-between items-center mb-12 animate-fade-in">
          <Link to="/" className="text-2xl font-extrabold tracking-widest hover:opacity-70 transition-opacity">
            DAAEKEEM
          </Link>
          <nav className="flex items-center space-x-6 md:space-x-8 text-sm font-medium">
            <Link to="/" className={`hover:opacity-100 transition-opacity ${location.pathname === '/' ? 'opacity-100 underline underline-offset-4' : 'opacity-60'}`}>Home</Link>
            <Link to="/portfolio" className={`hover:opacity-100 transition-opacity ${location.pathname.startsWith('/portfolio') ? 'opacity-100 underline underline-offset-4' : 'opacity-60'}`}>Work</Link>
            <Link to="/about" className={`hover:opacity-100 transition-opacity ${location.pathname === '/about' ? 'opacity-100 underline underline-offset-4' : 'opacity-60'}`}>About</Link>
            <Link to="/contact" className={`hover:opacity-100 transition-opacity ${location.pathname === '/contact' ? 'opacity-100 underline underline-offset-4' : 'opacity-60'}`}>Contact</Link>
            <Link to="/admin" className="opacity-40 hover:opacity-100 transition-opacity">
              <Icons.Admin />
            </Link>
          </nav>
        </header>

        <main className="flex-grow animate-fade-in" key={location.pathname}>
          {children}
        </main>

        <footer className="mt-20 pt-10 border-t border-white/10 flex justify-between items-center text-xs opacity-50">
          <div>© {new Date().getFullYear()} DAAEKEEM. All rights reserved.</div>
          <div className="flex space-x-4">
            <a href="#" className="hover:opacity-100 transition-opacity"><Icons.Instagram /></a>
            <a href="#" className="hover:opacity-100 transition-opacity"><Icons.LinkedIn /></a>
          </div>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('daeekeem_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Basic validation to ensure we have valid data structure
        if (parsed.projects && parsed.profile) {
          return parsed;
        }
      } catch (e) {
        console.error("Storage parse error, resetting to defaults", e);
      }
    }
    return { projects: INITIAL_PROJECTS, profile: INITIAL_PROFILE };
  });

  const updateData = (newData: AppData) => {
    try {
      const dataString = JSON.stringify(newData);
      localStorage.setItem('daeekeem_data', dataString);
      setData(newData);
    } catch (e) {
      console.error("Storage error:", e);
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        alert("Storage Limit Exceeded: The data is too large for the browser's storage. Please use smaller images or URLs.");
      } else {
        alert("An unexpected error occurred while saving.");
      }
      throw e;
    }
  };

  return (
    <AppContext.Provider value={{ data, updateData }}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:id" element={<ProjectDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;

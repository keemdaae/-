
import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Icons } from '../constants';

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useApp();
  
  const project = data.projects.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link to="/portfolio" className="text-xs uppercase tracking-widest underline opacity-50 hover:opacity-100">Back to Portfolio</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4 mr-2 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        Back to Portfolio
      </button>

      {/* Hero Image */}
      <section className="relative w-full aspect-[21/9] overflow-hidden bg-white/5 border border-white/10">
        <img 
          src={project.imageUrl} 
          alt={project.title} 
          className="w-full h-full object-cover"
        />
      </section>

      {/* Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        {/* Title and Intro */}
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-30">{project.category}</span>
              <div className="w-12 h-[1px] bg-white/10"></div>
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-30">{project.year}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
              {project.title}
            </h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-xl md:text-2xl font-light leading-relaxed opacity-70 italic">
              {project.description || "A comprehensive study on visual elements and narrative structure through the lens of modern cinematic aesthetics. This project explores the boundaries between static imagery and dynamic storytelling, capturing fleeting moments that define our contemporary experience."}
            </p>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="lg:col-span-4 space-y-12">
          <div className="p-8 border border-white/10 bg-white/5 space-y-8">
            <h3 className="text-xs uppercase tracking-[0.4em] font-bold pb-4 border-b border-white/10">Project Details</h3>
            
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest opacity-30">Client</span>
                <p className="text-sm font-medium tracking-wide">{project.client || "Self-Initiated"}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest opacity-30">Camera & Gear</span>
                <p className="text-sm font-medium tracking-wide">{project.camera || "Leica M11 / 35mm Summilux"}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest opacity-30">Role</span>
                <p className="text-sm font-medium tracking-wide">Cinematography, Art Direction</p>
              </div>

              <div className="pt-4">
                <Link to="/contact" className="block text-center py-4 border border-white/20 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-all">
                  Inquire About Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Placeholder - In a real app we might have multiple images per project */}
      <section className="pt-24 space-y-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[4/5] bg-white/5 border border-white/10 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
            <img src={project.imageUrl} alt="Project context" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center space-y-8 p-12">
            <h3 className="text-2xl font-light tracking-widest uppercase">The Process</h3>
            <p className="text-sm opacity-50 leading-relaxed font-light">
              Every shot is meticulously planned to ensure that the visual narrative remains consistent with the project's overall emotional tone. From site scouting to post-production, the focus remains on authentic expression and technical precision.
            </p>
            <div className="w-16 h-[1px] bg-white/20"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetail;

import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';

const Portfolio: React.FC = () => {
  const { data } = useApp();

  return (
    <div className="space-y-20 animate-in fade-in duration-700">
      <div className="space-y-4 px-4 md:px-0">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter leading-tight">Selected Work</h1>
        <p className="text-base md:text-lg opacity-50 font-light">
          A comprehensive collection of motion design, cinematic edits, and visual narratives directed and edited by {data.profile.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.projects.map((project) => (
          <Link 
            key={project.id} 
            to={`/portfolio/${project.id}`}
            className="group relative overflow-hidden aspect-square cursor-pointer bg-white/5 border border-white/5"
          >
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-center p-8">
              <span className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-2">{project.category}</span>
              <h3 className="text-2xl font-bold tracking-widest uppercase mb-4">{project.title}</h3>
              <div className="w-8 h-[1px] bg-white/40 mb-4"></div>
              <div className="flex flex-col space-y-1 text-[10px] tracking-[0.2em] uppercase opacity-60">
                <span>{project.year}</span>
                {project.client && <span>For {project.client}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {data.projects.length === 0 && (
        <div className="py-32 text-center opacity-30 uppercase tracking-[0.5em]">
          No projects found.
        </div>
      )}
    </div>
  );
};

export default Portfolio;
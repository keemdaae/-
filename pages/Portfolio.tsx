
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';

const Portfolio: React.FC = () => {
  const { data } = useApp();

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-6xl font-extrabold tracking-tighter">Portfolio</h1>
        <p className="text-sm opacity-50 max-w-lg">
          A curated collection of photography spanning diverse subjects and styles, from expansive landscapes to intimate portraits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {data.projects.map((project) => (
          <Link 
            key={project.id} 
            to={`/portfolio/${project.id}`}
            className="group relative overflow-hidden aspect-[1/1] cursor-pointer"
          >
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-center p-6">
              <h3 className="text-xl font-bold tracking-widest uppercase mb-1">{project.title}</h3>
              <p className="text-[10px] tracking-widest uppercase opacity-70 mb-4">{project.category}</p>
              <div className="w-8 h-[1px] bg-white/40"></div>
              <p className="mt-4 text-[10px] tracking-widest">{project.year}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;

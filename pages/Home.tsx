import React, { useState } from 'react';
import { useApp } from '../App';
import { Icons } from '../constants';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { data } = useApp();
  const [showAll, setShowAll] = useState(false);
  
  const projectsToShow = showAll ? data.projects : data.projects.slice(0, 4);
  const heroImage = data.profile.heroImageUrl || data.profile.profileImageUrl;

  const creativeApproachParagraphs = data.profile.creativeApproach 
    ? data.profile.creativeApproach.split('\n\n') 
    : [];

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-50 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="relative z-10 space-y-4 px-6 w-full">
          <h1 className="text-4xl sm:text-6xl md:text-9xl font-extrabold tracking-[0.1em] md:tracking-[0.2em] animate-in fade-in zoom-in duration-1000 uppercase break-words">DAAEKEEM</h1>
          <p className="text-sm sm:text-lg md:text-xl tracking-widest uppercase opacity-70 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">Cinematic Visual Editor</p>
          <div className="max-w-xl mx-auto">
            <p className="text-[10px] md:text-sm opacity-50 animate-in fade-in duration-1000 delay-500 leading-relaxed">
              {data.profile.heroDescription || "Creating visual narratives that capture authentic moments and timeless stories through cutting-edge motion and light."}
            </p>
          </div>
        </div>

        <div className="absolute bottom-10 flex flex-col items-center space-y-2 opacity-50">
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <Icons.ChevronDown />
        </div>
      </section>

      {/* Creative Approach Section */}
      <section className="max-w-4xl mx-auto text-center space-y-16 px-6 md:px-0">
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-light tracking-wider uppercase opacity-40">Creative Approach</h2>
          <div className="w-12 h-px bg-white/10 mx-auto"></div>
        </div>
        
        <div className="text-xs md:text-sm leading-relaxed opacity-[0.65] font-light italic space-y-12">
          {creativeApproachParagraphs.map((paragraph, idx) => (
            <p key={idx} className="whitespace-pre-line break-keep md:break-normal">
              {paragraph}
            </p>
          ))}
        </div>
        
        <div className="pt-8">
          <Link 
            to="/about" 
            className="inline-flex items-center px-8 md:px-12 py-3 md:py-4 border border-white/10 rounded-full text-[10px] tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all duration-500 group"
          >
            more about <span className="inline-block transition-transform duration-300 group-hover:translate-x-1"><Icons.ArrowRight /></span>
          </Link>
        </div>
      </section>

      {/* Projects Section */}
      <section className="space-y-16 px-4 md:px-0">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-5xl font-light tracking-wider uppercase">{showAll ? "Portfolio" : "Featured Projects"}</h2>
          <div className="w-12 h-[1px] bg-white/20 mx-auto"></div>
          <p className="text-[10px] opacity-40 tracking-[0.4em] uppercase">
            {showAll ? `Archive — All ${data.projects.length} Works` : "Selected Works"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24 max-w-6xl mx-auto">
          {projectsToShow.map((project, idx) => (
            <Link 
              key={project.id} 
              to={`/portfolio/${project.id}`}
              className={`group relative flex flex-col ${idx % 2 !== 0 ? 'md:mt-32' : ''} animate-in fade-in slide-in-from-bottom-8 duration-1000`}
            >
              <div className="relative overflow-hidden aspect-square bg-white/[0.02] border border-white/5">
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
                />
                
                {/* Refined Bottom Cluster Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 md:p-8 text-left">
                   <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 space-y-1 md:space-y-2">
                     <span className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase opacity-40 font-medium block">{project.category}</span>
                     <h3 className="text-2xl md:text-4xl font-bold tracking-tight uppercase leading-none">{project.title}</h3>
                     <div className="flex items-center space-x-3 pt-1">
                        <span className="text-[9px] md:text-[10px] font-mono opacity-40 tracking-widest uppercase">{project.year}</span>
                        {project.client && (
                          <>
                            <div className="w-3 md:w-4 h-[1px] bg-white/10"></div>
                            <span className="text-[9px] md:text-[10px] opacity-40 tracking-[0.2em] uppercase">{project.client}</span>
                          </>
                        )}
                     </div>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!showAll && data.projects.length > 4 && (
          <div className="text-center mt-32">
            <button 
              onClick={() => setShowAll(true)}
              className="inline-flex flex-col items-center space-y-4 group"
            >
              <span className="text-[10px] tracking-[0.5em] uppercase opacity-40 group-hover:opacity-100 transition-all">View All Work</span>
              <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent group-hover:h-16 transition-all duration-500"></div>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
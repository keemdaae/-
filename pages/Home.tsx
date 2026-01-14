
import React, { useState } from 'react';
import { useApp } from '../App';
import { Icons } from '../constants';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { data } = useApp();
  const [showAll, setShowAll] = useState(false);
  
  // Initially show 4 projects, show all if showAll is true
  const projectsToShow = showAll ? data.projects : data.projects.slice(0, 4);

  const heroImage = data.profile.heroImageUrl || data.profile.profileImageUrl;

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
          <div className="absolute inset-0 bg-black/20"></div> {/* Extra overlay for readability */}
        </div>
        
        <div className="relative z-10 space-y-4">
          <h1 className="text-7xl md:text-9xl font-extrabold tracking-[0.2em] animate-in fade-in zoom-in duration-1000">DAAEKEEM</h1>
          <p className="text-lg md:text-xl tracking-widest uppercase opacity-70 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">Cinematic Visual Editor</p>
          <p className="max-w-xl mx-auto text-sm opacity-50 px-4 animate-in fade-in duration-1000 delay-500">
            Creating visual narratives that capture authentic moments and timeless stories through cutting-edge motion and light.
          </p>
        </div>

        <div className="absolute bottom-10 flex flex-col items-center space-y-2 opacity-50">
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <Icons.ChevronDown />
        </div>
      </section>

      {/* About My Work */}
      <section className="max-w-4xl mx-auto text-center space-y-12">
        <h2 className="text-3xl font-light tracking-wider">About My Work</h2>
        <p className="text-lg md:text-xl leading-relaxed opacity-70 font-light italic">
          "{data.profile.bio}"
        </p>
        <Link 
          to="/about" 
          className="inline-flex items-center px-8 py-3 border border-white/20 rounded-full text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
        >
          Learn More About Me <Icons.ArrowRight />
        </Link>
      </section>

      {/* Projects Section */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-light tracking-wider">{showAll ? "Portfolio" : "Featured Projects"}</h2>
          <p className="text-xs opacity-50 tracking-widest uppercase">
            {showAll ? `All ${data.projects.length} works` : "A selection of recent work"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
          {projectsToShow.map((project, idx) => (
            <Link 
              key={project.id} 
              to={`/portfolio/${project.id}`}
              className={`group relative overflow-hidden aspect-[4/3] ${idx % 2 !== 0 ? 'md:mt-24' : ''} animate-in fade-in slide-in-from-bottom-4 duration-700`}
            >
              <img 
                src={project.imageUrl} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                <span className="text-[10px] tracking-[0.3em] uppercase opacity-60 mb-2">{project.category}</span>
                <h3 className="text-2xl font-bold tracking-wider">{project.title}</h3>
                <p className="text-sm opacity-70">{project.year}</p>
              </div>
            </Link>
          ))}
        </div>

        {!showAll && data.projects.length > 4 && (
          <div className="text-center mt-24">
            <button 
              onClick={() => setShowAll(true)}
              className="inline-flex items-center text-xs tracking-[0.4em] uppercase opacity-40 hover:opacity-100 hover:tracking-[0.5em] transition-all duration-500 border-b border-white/20 pb-2"
            >
              View All Projects <Icons.ArrowRight />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

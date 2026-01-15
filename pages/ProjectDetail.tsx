import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';

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

  const isDirectVideo = (url: string) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    
    if (url.includes('<iframe')) {
      const srcMatch = url.match(/src=["']([^"']+)["']/);
      if (srcMatch) url = srcMatch[1];
    }
    
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    
    return (match && match[1]) ? match[1] : null;
  };

  const getVimeoId = (url: string) => {
    if (!url) return null;
    if (url.includes('<iframe')) {
      const srcMatch = url.match(/src=["']([^"']+)["']/);
      if (srcMatch) url = srcMatch[1];
    }
    const regExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : null;
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    const ytId = getYouTubeId(url);
    if (ytId) {
      return `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autohide=1&showinfo=0&controls=1`;
    }

    const vimeoId = getVimeoId(url);
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0`;
    }

    return url;
  };

  const rawVideoUrl = project.videoUrl || "";
  const isDirect = isDirectVideo(rawVideoUrl);
  const embedUrl = getEmbedUrl(rawVideoUrl);
  const ytId = getYouTubeId(rawVideoUrl);
  const vimeoId = getVimeoId(rawVideoUrl);
  
  const gallery = project.galleryImages || [];
  const hasGallery = gallery.length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-24 animate-in fade-in duration-700 pb-32 px-4 md:px-0">
      {/* Navigation */}
      <nav className="flex items-center justify-between pt-8">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4 mr-2 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          Back to Projects
        </button>
      </nav>

      {/* Hero Image */}
      <section className="relative w-full flex justify-center overflow-hidden">
        <img 
          src={project.imageUrl} 
          alt={project.title} 
          className="max-w-full h-auto max-h-[85vh] object-contain shadow-2xl"
        />
      </section>

      {/* Header Information */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-white/10 pb-20">
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-30">{project.category}</span>
              <div className="w-12 h-[1px] bg-white/10"></div>
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-30">{project.year}</span>
            </div>
            <h1 className="text-2xl md:text-6xl font-extrabold tracking-tighter leading-none break-words uppercase">
              {project.title}
            </h1>
          </div>

          <div className="max-w-2xl">
            <p className="text-[10px] md:text-sm font-light leading-relaxed opacity-60 italic whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 lg:border-l lg:border-white/10 lg:pl-12 flex flex-col justify-end space-y-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest opacity-30">Client</span>
              <p className="text-sm font-medium tracking-wide">{project.client || "Independent Project"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest opacity-30">Tools / Tech</span>
              <p className="text-sm font-medium tracking-wide">{project.tools || "Directorial Debut"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic Video Player */}
      {rawVideoUrl && (
        <section className="space-y-8">
          <div className="flex items-center space-x-4">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30">Motion & Film</span>
            <div className="flex-grow h-[1px] bg-white/10"></div>
          </div>
          
          <div className="space-y-6">
            <div className="relative w-full aspect-video bg-black shadow-2xl overflow-hidden border border-white/5 group">
                {isDirect ? (
                  <video 
                    src={rawVideoUrl} 
                    controls 
                    className="w-full h-full object-contain"
                    poster={project.imageUrl}
                  />
                ) : (
                  <iframe
                    src={embedUrl || ""}
                    title={`${project.title} Video Player`}
                    className="w-full h-full absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    frameBorder="0"
                  ></iframe>
                )}
            </div>
            
            {!isDirect && (ytId || vimeoId) && (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-[9px] md:text-[10px] opacity-20 uppercase tracking-widest text-center">Player not loading? Some videos are restricted to direct viewing.</p>
                <a 
                  href={rawVideoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all border border-white/10 px-8 py-4 rounded-full hover:bg-white hover:text-black"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    {ytId ? (
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    ) : (
                      <path d="M22.396 7.158c-.029 1.463-1.076 3.475-3.141 6.035-2.14 2.67-3.951 4.003-5.432 4.003-1.21 0-2.241-1.115-3.091-3.344l-1.144-4.195c-.534-1.996-1.117-2.993-1.748-2.993-.117 0-.525.242-1.226.727l-.707-.88c.78-.683 1.554-1.365 2.321-2.047 1.05-.918 1.838-1.402 2.365-1.45 1.238-.112 2.003.733 2.298 2.536.31 1.902.528 3.076.657 3.522.28 1.25.597 1.875.952 1.875.27 0 .703-.434 1.299-1.303.596-.869.91-1.523.944-1.963.073-.859-.224-1.289-.893-1.289-.313 0-.642.072-.988.216 1.272-4.162 3.702-6.142 7.292-5.941 2.646.148 3.9 1.764 3.763 4.849z"/>
                    )}
                  </svg>
                  <span>Open in {ytId ? 'YouTube' : 'Vimeo'} App</span>
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Vertical Gallery Section */}
      {hasGallery && (
        <section className="space-y-12">
          <div className="flex items-center space-x-4">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30">Gallery</span>
            <div className="flex-grow h-[1px] bg-white/10"></div>
          </div>
          
          <div className="flex flex-col items-center space-y-6 md:space-y-12">
            {gallery.map((img, i) => (
              <div 
                key={i} 
                className="w-full flex justify-center"
              >
                <img 
                  src={img} 
                  alt={`${project.title} Gallery Image ${i + 1}`} 
                  className="max-w-full max-h-[1000px] h-auto object-contain shadow-2xl transition-all duration-700"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer Navigation */}
      <section className="pt-32 flex justify-center border-t border-white/10">
        <Link to="/" className="text-[10px] uppercase tracking-[0.5em] opacity-40 hover:opacity-100 transition-all hover:tracking-[0.6em]">
          Return to Index
        </Link>
      </section>
    </div>
  );
};

export default ProjectDetail;
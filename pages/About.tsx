import React from 'react';
import { useApp } from '../App';
import { Icons } from '../constants';

const About: React.FC = () => {
  const { data } = useApp();

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 md:px-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* Profile Image & Socials */}
        <div className="md:sticky md:top-24 space-y-8">
          <div className="aspect-[3/4] overflow-hidden border border-white/10 bg-white/[0.02]">
            <img 
              src={data.profile.profileImageUrl} 
              alt={data.profile.name} 
              className="w-full h-full object-cover grayscale transition-transform duration-700 hover:scale-105"
            />
          </div>
          
          <div className="flex justify-center md:justify-start space-x-4">
             <a 
               href={data.profile.instagram} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="p-4 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all duration-300"
               aria-label="Instagram"
             >
               <Icons.Instagram />
             </a>
             <a 
               href={data.profile.linkedin} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="p-4 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all duration-300"
               aria-label="LinkedIn"
             >
               <Icons.LinkedIn />
             </a>
          </div>
        </div>

        {/* Biography Text */}
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-[10px] md:text-sm tracking-[0.4em] uppercase opacity-40">About</h1>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-tight">{data.profile.title}</h2>
          </div>

          <div className="space-y-8 text-base md:text-lg font-light leading-relaxed opacity-70">
            <h3 className="text-2xl md:text-3xl text-white font-bold tracking-widest uppercase">{data.profile.name}</h3>
            <div className="whitespace-pre-wrap space-y-6">
              {data.profile.bio.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
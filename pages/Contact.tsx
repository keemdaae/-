
import React from 'react';
import { useApp } from '../App';

const Contact: React.FC = () => {
  const { data } = useApp();

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-24">
      <div className="text-center space-y-4">
        <h1 className="text-7xl font-extrabold tracking-tighter">Get in Touch</h1>
        <p className="text-xl opacity-50">Let's discuss your next project</p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Contact Info */}
        <div className="space-y-12">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-wide">Contact Information</h2>
            <p className="text-sm opacity-50">Reach out directly via the address below.</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-16 rounded-lg flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center opacity-40 mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-2">Email</p>
            <a 
              href={`mailto:${data.profile.email}`} 
              className="text-2xl md:text-3xl font-bold hover:opacity-70 transition-all underline underline-offset-8 decoration-white/20 hover:decoration-white/50"
            >
              {data.profile.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

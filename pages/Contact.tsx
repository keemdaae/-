
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
            <p className="text-sm opacity-50">Reach out directly via the channels below.</p>
          </div>

          <div className="space-y-8 bg-white/5 border border-white/10 p-12 rounded-lg">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center opacity-40 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-40">Email</p>
                <a href={`mailto:${data.profile.email}`} className="text-xl hover:opacity-70 transition-opacity">{data.profile.email}</a>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center opacity-40 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-40">Phone</p>
                <p className="text-xl">{data.profile.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center opacity-40 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-40">Location</p>
                <p className="text-xl">{data.profile.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

import React from 'react';
import toast from 'react-hot-toast';
import { Bell, XCircle, CheckCircle } from 'lucide-react';

export const notifyNewBooking = (message) => {
  toast.custom((t) => (
    <div
      style={{
        background: '#fff',
        color: '#1a1a1a',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid #eee',
        animation: t.visible ? 'fadeInRight 0.3s ease' : 'fadeOutRight 0.3s ease',
      }}
    >
      <div className="ringing-bell">
        <Bell size={24} fill="#f4b400" />
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: '800', fontSize: '14px' }}>New Notification</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{message}</p>
      </div>
    </div>
  ), { position: 'top-right', duration: 4000 });
};

export const notifyEventCancelled = (message) => {
  toast.custom((t) => (
    <div
      style={{
        background: '#fff',
        color: '#1a1a1a',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid #fee2e2',
        animation: t.visible ? 'fadeInRight 0.3s ease' : 'fadeOutRight 0.3s ease',
      }}
    >
      <div className="shaking-x">
        <XCircle size={28} color="#ef4444" />
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: '800', fontSize: '14px' }}>Event Cancelled</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{message}</p>
      </div>
    </div>
  ), { position: 'top-right', duration: 4000 });
};

export const notifyServiceCreated = (message) => {
  toast.custom((t) => (
    <div
      style={{
        background: '#fff',
        color: '#1a1a1a',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderLeft: '8px solid #2dd4bf', 
        animation: t.visible ? 'fadeInRight 0.3s ease' : 'fadeOutRight 0.3s ease',
      }}
    >
      <div style={{ background: '#f0fdfa', padding: '8px', borderRadius: '10px' }}>
        <CheckCircle size={24} color="#2dd4bf" />
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: '800', fontSize: '14px' }}>Service Listed!</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{message}</p>
      </div>
    </div>
  ), { position: 'top-right', duration: 4000 });
};

export const notifySuccess = (message) => {
  toast.custom((t) => (
    <div
      style={{
        background: '#fff',
        color: '#1a1a1a',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderLeft: '8px solid #000', 
        animation: t.visible ? 'fadeInRight 0.3s ease' : 'fadeOutRight 0.3s ease',
      }}
    >
      <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '10px' }}>
        <CheckCircle size={24} color="#000" />
      </div>
      <div>
        <p style={{ margin: 0, fontWeight: '800', fontSize: '14px' }}>Success</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{message}</p>
      </div>
    </div>
  ), { position: 'top-right', duration: 4000 });
};
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, ShieldAlert, CheckCircle2, Paperclip, X } from 'lucide-react';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Modal state for zooming pictures
  
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/contacts-list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data);
        if (res.data.length > 0) setActiveContact(res.data[0]);
      } catch (err) {
        console.error("Error fetching contacts", err);
      }
    };
    fetchContacts();
  }, [token]);

  useEffect(() => {
    if (!activeContact?.id) return;

    const fetchConversationData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/messages/${activeContact.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.messages || []);
        setActiveBooking(res.data.booking || null);
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    };

    fetchConversationData();
    const interval = setInterval(fetchConversationData, 3000); 
    return () => clearInterval(interval);
  }, [activeContact?.id, token]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || userRole === 'admin' || !activeContact?.id) return;

    try {
      await axios.post('http://localhost:8000/api/messages', {
        receiver_id: activeContact.id,
        message: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewMessage('');
      
      const res = await axios.get(`http://localhost:8000/api/messages/${activeContact.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages || []);
      setActiveBooking(res.data.booking || null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send message. You must have an active booking with this user.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeBooking?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please choose a smaller picture or document.");
      return;
    }

    const formData = new FormData();
    formData.append('attachment', file);

    setUploading(true);
    try {
      const res = await axios.post(`http://localhost:8000/api/bookings/${activeBooking.id}/attach-document`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      let fileUrl = res.data.file_url;
      if (fileUrl.includes('/storage/')) {
        fileUrl = fileUrl.replace('/storage/attachments/', '/uploads/');
      }

      await axios.post('http://localhost:8000/api/messages', {
        receiver_id: activeContact.id,
        message: `[Attachment]: ${fileUrl}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const refreshRes = await axios.get(`http://localhost:8000/api/messages/${activeContact.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(refreshRes.data.messages || []);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to upload and attach file.");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 100px)', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', margin: '20px', position: 'relative' }}>
      
      {/* FULL-SCREEN IMAGE POPUP MODAL WITH 'X' BUTTON */}
      {selectedImage && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)'
        }}>
          <button 
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute', top: '25px', right: '25px', background: '#fff', border: 'none',
              borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10000
            }}
          >
            <X size={24} color="#000" />
          </button>
          <img 
            src={selectedImage} 
            alt="Enlarged Full Preview" 
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
          />
        </div>
      )}

      {/* LEFT SIDE: Conversations List */}
      <div style={{ width: '320px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>Messages</h2>
          <p style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>Unlocked via confirmed bookings</p>
          {userRole === 'admin' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#b91c1c', fontWeight: '700', marginTop: '4px' }}>
              <ShieldAlert size={14} /> Admin Read-Only Mode
            </span>
          )}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length > 0 ? conversations.map(contact => (
            <div 
              key={contact.id} 
              onClick={() => setActiveContact(contact)}
              style={{ 
                padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                background: activeContact?.id === contact.id ? '#e2e8f0' : 'transparent',
                borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#334155' }}>
                {contact.name.charAt(0)}
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>{contact.name}</h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>{contact.role}</p>
              </div>
            </div>
          )) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No booked conversations available.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Chat Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '15px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>{activeContact.name}</h3>
              <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', color: '#64748b' }}>{activeContact.role}</span>
            </div>

            {/* BOOKING STATUS BANNER */}
            {activeBooking && (
              <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', padding: '12px 25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={20} color="#15803d" />
                <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                  <span style={{ fontWeight: '800' }}>Booking Active: </span> 
                  This client has booked your service for <span style={{ fontWeight: '700' }}>{activeBooking.event_name}</span> on {activeBooking.event_date} (₱{parseFloat(activeBooking.budget || 0).toLocaleString()}). Status: <strong style={{ textTransform: 'uppercase' }}>{activeBooking.status}</strong>
                </div>
              </div>
            )}

            {/* Messages Feed */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8fafc' }}>
              {messages.map((msg) => {
                const isMe = msg.sender_id !== activeContact.id;
                const isAttachment = msg.message && msg.message.startsWith('[Attachment]:');
                let fileUrl = isAttachment ? msg.message.replace('[Attachment]:', '').trim() : '';
                
                if (fileUrl.includes('/storage/')) {
                  fileUrl = fileUrl.replace('/storage/attachments/', '/uploads/');
                }

                const isImage = fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i);

                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '60%' }}>
                    <div style={{ 
                      padding: '12px 16px', borderRadius: '16px', fontSize: '0.9rem',
                      background: isMe ? '#000' : '#ffffff', 
                      color: isMe ? '#fff' : '#0f172a',
                      border: isMe ? 'none' : '1px solid #e2e8f0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      {isAttachment ? (
                        <div style={{ marginTop: '5px' }}>
                          {isImage ? (
                            <div>
                              <img 
                                src={fileUrl} 
                                alt="Attachment Thumbnail" 
                                onClick={() => setSelectedImage(fileUrl)}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                                style={{ maxWidth: '220px', maxHeight: '160px', borderRadius: '8px', display: 'block', objectFit: 'cover', cursor: 'pointer' }} 
                                title="Click to open full-screen view"
                              />
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: isMe ? '#93c5fd' : '#2563eb', display: 'block', marginTop: '4px' }}>
                                Open Image in New Tab
                              </a>
                            </div>
                          ) : (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: isMe ? '#93c5fd' : '#2563eb', textDecoration: 'underline', wordBreak: 'break-all' }}>
                              📎 View Attached Document
                            </a>
                          )}
                        </div>
                      ) : (
                        msg.message
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Box with File Attachment */}
            {userRole !== 'admin' ? (
              <form onSubmit={handleSend} style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', background: '#fff', alignItems: 'center' }}>
                <input 
                  type="file" 
                  id="chat-file-upload" 
                  style={{ display: 'none' }} 
                  accept="image/png, image/jpeg, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="chat-file-upload" 
                  style={{ cursor: 'pointer', padding: '10px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '12px' }}
                  title="Attach picture or document (Max 5MB)"
                >
                  <Paperclip size={20} />
                </label>

                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder={uploading ? "Uploading attachment..." : "Type a message regarding the booking..."} 
                  disabled={uploading}
                  style={{ flex: 1, padding: '14px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                />
                <button type="submit" disabled={uploading} style={{ padding: '0 20px', height: '48px', background: '#000', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <div style={{ padding: '15px', textAlign: 'center', background: '#fef2f2', color: '#991b1b', fontSize: '0.85rem', fontWeight: '600', borderTop: '1px solid #fecaca' }}>
                You are viewing this chat in Admin Read-Only mode. Typing is disabled.
              </div>
            )}
          </>
        ) : (
          <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Select a conversation to start messaging
          </div>
        )}
      </div>

    </div>
  );
};

export default Messages;
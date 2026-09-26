import React, { useState, useEffect } from 'react';
import api from '../api';
import { Send, ShieldAlert, CheckCircle2, XCircle, Paperclip, X, Clock, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.get('/contacts-list');
        setConversations(res.data);
        if (res.data.length > 0) setActiveContact(res.data[0]);
      } catch (err) {
        console.error("Error fetching contacts", err);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!activeContact?.id) return;

    const fetchConversationData = async () => {
      try {
        const res = await api.get(`/messages/${activeContact.id}`);
        setMessages(res.data.messages || []);
        setActiveBooking(res.data.booking || null);
      } catch (err) {
        console.error("Error fetching messages", err);
      }
    };

    fetchConversationData();
    const interval = setInterval(fetchConversationData, 3000); 
    return () => clearInterval(interval);
  }, [activeContact?.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || userRole === 'admin' || !activeContact?.id) return;

    try {
      await api.post('/messages', {
        receiver_id: activeContact.id,
        message: newMessage
      });
      setNewMessage('');
      
      const res = await api.get(`/messages/${activeContact.id}`);
      setMessages(res.data.messages || []);
      setActiveBooking(res.data.booking || null);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send message. You must have an active booking with this user.");
    }
  };

  const handleBookingAction = async (statusAction) => {
    if (!activeBooking?.id) return;
    const actionLabel = statusAction === 'accepted' ? 'accept' : 'decline';
    if (!window.confirm(`Are you sure you want to ${actionLabel} this booking request?`)) return;

    try {
      // Endpoint handles status updates (e.g., accepted or rejected/declined)
      await api.patch(`/bookings/${activeBooking.id}/verify`, { status: statusAction });
      toast.success(`Booking successfully ${statusAction}ed!`);

      // Refresh data
      const res = await api.get(`/messages/${activeContact.id}`);
      setActiveBooking(res.data.booking || null);
    } catch (err) {
      console.error("Action error:", err);
      toast.error(err.response?.data?.message || "Failed to update booking status.");
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
      const res = await api.post(`/bookings/${activeBooking.id}/attach-document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      let fileUrl = res.data.file_url;
      if (fileUrl.includes('/storage/')) {
        fileUrl = fileUrl.replace('/storage/attachments/', '/uploads/');
      }

      await api.post('/messages', {
        receiver_id: activeContact.id,
        message: `[Attachment]: ${fileUrl}`
      });

      const refreshRes = await api.get(`/messages/${activeContact.id}`);
      setMessages(refreshRes.data.messages || []);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to upload and attach file.");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', background: '#fff', borderRadius: '24px', border: '1px solid #eaeaea', overflow: 'hidden', margin: '30px 40px', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
      
      {/* FULL-SCREEN IMAGE POPUP MODAL */}
      {selectedImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
          <button 
            onClick={() => setSelectedImage(null)}
            style={{ position: 'absolute', top: '25px', right: '25px', background: '#fff', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10000 }}
          >
            <X size={24} color="#000" />
          </button>
          <img src={selectedImage} alt="Enlarged Preview" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
        </div>
      )}

      {/* LEFT SIDE: Conversations List */}
      <div style={{ width: '340px', borderRight: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #eaeaea' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#000', margin: 0 }}>Message Requests</h2>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontWeight: '600' }}>Inbox & Booking Inquiries</p>
          {userRole === 'admin' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#b91c1c', fontWeight: '800', marginTop: '6px' }}>
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
                padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer',
                background: activeContact?.id === contact.id ? '#ffffff' : 'transparent',
                borderBottom: '1px solid #f0f0f0', borderLeft: activeContact?.id === contact.id ? '4px solid #000' : '4px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.9rem' }}>
                {contact.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '900', color: '#000', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.name}</h4>
                <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', margin: 0 }}>{contact.role}</p>
              </div>
            </div>
          )) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>
              No message requests available.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Chat Window & Request Hub */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '20px 30px', borderBottom: '1px solid #eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#000', margin: '0 0 2px 0' }}>{activeContact.name}</h3>
                <span style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', color: '#475569', fontWeight: '800', textTransform: 'uppercase' }}>{activeContact.role}</span>
              </div>
            </div>

            {/* MESSENGER/GMAIL STYLE BOOKING REQUEST ACTION BANNER */}
            {activeBooking && (
              <div style={{ background: '#f8fafc', borderBottom: '1px solid #eaeaea', padding: '16px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#e2e8f0', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                    <Clock size={20} color="#000" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#000' }}>
                      Inquiry for "{activeBooking.event_name}" ({activeBooking.event_date})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                      Budget: ₱{parseFloat(activeBooking.budget || 0).toLocaleString()} • Status: <strong style={{ textTransform: 'uppercase', color: activeBooking.status === 'accepted' ? '#047857' : '#d97706' }}>{activeBooking.status}</strong>
                    </div>
                  </div>
                </div>

                {/* VENDOR ACCEPT / DECLINE ACTIONS */}
                {userRole === 'vendor' && activeBooking.status !== 'accepted' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleBookingAction('accepted')}
                      style={{ background: '#047857', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Check size={14} /> Accept Request
                    </button>
                    <button 
                      onClick={() => handleBookingAction('rejected')}
                      style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '10px 18px', borderRadius: '10px', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <XCircle size={14} /> Decline
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Messages Feed */}
            <div style={{ flex: 1, padding: '24px 30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: '#ffffff' }}>
              {messages.map((msg) => {
                const isMe = msg.sender_id !== activeContact.id;
                const isAttachment = msg.message && msg.message.startsWith('[Attachment]:');
                let fileUrl = isAttachment ? msg.message.replace('[Attachment]:', '').trim() : '';
                
                if (fileUrl.includes('/storage/')) {
                  fileUrl = fileUrl.replace('/storage/attachments/', '/uploads/');
                }

                const isImage = fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i);

                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '65%' }}>
                    <div style={{ 
                      padding: '14px 18px', borderRadius: '18px', fontSize: '0.92rem', fontWeight: '500',
                      background: isMe ? '#000000' : '#f1f5f9', 
                      color: isMe ? '#ffffff' : '#0f172a',
                      border: isMe ? 'none' : '1px solid #e2e8f0',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                    }}>
                      {isAttachment ? (
                        <div style={{ marginTop: '5px' }}>
                          {isImage ? (
                            <div>
                              <img 
                                src={fileUrl} 
                                alt="Attachment Thumbnail" 
                                onClick={() => setSelectedImage(fileUrl)}
                                style={{ maxWidth: '240px', maxHeight: '180px', borderRadius: '10px', display: 'block', objectFit: 'cover', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }} 
                              />
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: isMe ? '#93c5fd' : '#2563eb', display: 'block', marginTop: '6px', fontWeight: '700' }}>
                                Open Full Image ↗
                              </a>
                            </div>
                          ) : (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: isMe ? '#93c5fd' : '#2563eb', textDecoration: 'underline', fontWeight: '700' }}>
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
              <form onSubmit={handleSend} style={{ padding: '20px 30px', borderTop: '1px solid #eaeaea', display: 'flex', gap: '12px', background: '#fff', alignItems: 'center' }}>
                <input 
                  type="file" 
                  id="chat-file-upload" 
                  style={{ display: 'none' }} 
                  accept="image/png, image/jpeg, application/pdf"
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="chat-file-upload" 
                  style={{ cursor: 'pointer', padding: '12px', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '14px', border: '1px solid #eaeaea' }}
                  title="Attach file"
                >
                  <Paperclip size={20} />
                </label>

                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder={uploading ? "Uploading attachment..." : "Type a message regarding this booking request..."} 
                  disabled={uploading}
                  style={{ flex: 1, padding: '14px 20px', borderRadius: '14px', border: '2px solid #eaeaea', outline: 'none', fontSize: '0.95rem', fontWeight: '600', backgroundColor: '#f8fafc' }}
                />
                <button type="submit" disabled={uploading} style={{ padding: '0 24px', height: '50px', background: '#000', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <div style={{ padding: '15px', textAlign: 'center', background: '#fef2f2', color: '#991b1b', fontSize: '0.85rem', fontWeight: '800', borderTop: '1px solid #fecaca' }}>
                Admin Read-Only Mode. Typing is disabled.
              </div>
            )}
          </>
        ) : (
          <div style={{ flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: '700' }}>
            Select a message request to review inquiry.
          </div>
        )}
      </div>

    </div>
  );
};

export default Messages;
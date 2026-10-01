import React, { useEffect, useState } from 'react';
import api from '../api';
import { User, Mail, Phone, ShieldCheck, Camera, MapPin, Clock, AlertCircle, FileText, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingPermit, setUploadingPermit] = useState(false);
  const [permitFile, setPermitFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    contact_number: "",
    address: "",
    verification_status: "pending",
    permit_path: null
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user');
        setUserData({
          ...response.data,
          contact_number: response.data.contact_number || "",
          address: response.data.address || "",
          verification_status: response.data.verification_status || "pending",
          permit_path: response.data.permit_path || null
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEditToggle = async () => {
    if (isEditing) {
      const loadingToast = toast.loading("Updating profile...");
      try {
        await api.put('/user/update', userData);
        localStorage.setItem('userName', userData.name); 
        toast.success("Profile updated successfully!", { id: loadingToast });
      } catch (error) {
        console.error("Update failed:", error);
        toast.error("Update failed. Please check your connection.", { id: loadingToast });
      }
    }
    setIsEditing(!isEditing);
  };

  const handlePermitUpload = async (e) => {
    e.preventDefault();
    if (!permitFile) {
      toast.error("Please select a file first.");
      return;
    }

    setUploadingPermit(true);
    const formData = new FormData();
    formData.append('permit', permitFile);

    try {
      const res = await api.post('/vendor/upload-permit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(res.data.message || "Permit uploaded successfully!");
      setUserData(prev => ({ ...prev, verification_status: 'pending', permit_path: res.data.path }));
      setPermitFile(null);
    } catch (err) {
      console.error("Permit upload error:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to upload permit.");
    } finally {
      setUploadingPermit(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'verified':
        return { text: 'Verified', color: '#22c55e', icon: <ShieldCheck size={16} color="#22c55e" /> };
      case 'rejected':
        return { text: 'Rejected (Please resubmit valid permit)', color: '#ef4444', icon: <AlertCircle size={16} color="#ef4444" /> };
      default:
        return { text: 'Pending Admin Verification', color: '#f59e0b', icon: <Clock size={16} color="#f59e0b" /> };
    }
  };

  const statusInfo = getStatusDisplay(userData.verification_status);

  const styles = {
    container: { padding: isMobile ? '20px 3%' : '50px 5%', backgroundColor: '#fcfcfd', minHeight: '100vh', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' },
    mainWrapper: { maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '15px' : '0', marginBottom: '30px' },
    profileHero: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
    bigAvatar: { width: '80px', height: '80px', borderRadius: '24px', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: '800', position: 'relative', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
    cameraIcon: { position: 'absolute', bottom: '-5px', right: '-5px', backgroundColor: '#fff', padding: '6px', borderRadius: '50%', border: '1px solid #eee', color: '#1a1a1a', display: 'flex' },
    card: { backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #f0f0f0', padding: isMobile ? '20px' : '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginBottom: '30px', boxSizing: 'border-box' },
    infoGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' },
    infoGroup: { marginBottom: '15px', overflow: 'hidden' },
    label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#999', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' },
    value: { fontSize: '1.05rem', color: '#1a1a1a', fontWeight: '600', paddingLeft: '22px', wordBreak: 'break-word' },
    input: { width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none', backgroundColor: '#f9fafb', boxSizing: 'border-box' },
    editBtn: { padding: '12px 25px', backgroundColor: isEditing ? '#22c55e' : '#1a1a1a', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s ease', width: isMobile ? '100%' : 'auto' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' },
    modalContent: { position: 'relative', maxWidth: '100%', maxHeight: '90vh', backgroundColor: '#fff', padding: '15px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', boxSizing: 'border-box' },
    modalImage: { maxWidth: '100%', maxHeight: '75vh', display: 'block', borderRadius: '8px', objectFit: 'contain' },
    closeBtn: { position: 'absolute', top: '10px', right: '10px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 1010 }
  };

  if (loading) return <div style={styles.container}>Loading Profile...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.mainWrapper}>
        <div style={styles.header}>
          <div>
            <h1 style={{ fontWeight: '900', color: '#1a1a1a', fontSize: isMobile ? '1.8rem' : '2.5rem', margin: 0 }}>Account Settings</h1>
            <p style={{ color: '#666', marginTop: '5px', fontSize: '0.9rem' }}>Manage your personal information and credentials.</p>
          </div>
          <button style={styles.editBtn} onClick={handleEditToggle}>
            {isEditing ? 'SAVE CHANGES' : 'EDIT PROFILE'}
          </button>
        </div>

        <div style={styles.profileHero}>
          <div style={styles.bigAvatar}>
            {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            <div style={styles.cameraIcon}><Camera size={14} /></div>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: '800', wordBreak: 'break-word' }}>{userData.name}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#6b6382', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              {userData.role} Account
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.infoGrid}>
            <div style={styles.infoGroup}>
              <span style={styles.label}><User size={14} /> Full Name</span>
              {isEditing ? (
                <input style={styles.input} value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} />
              ) : (
                <span style={styles.value}>{userData.name || "N/A"}</span>
              )}
            </div>

            <div style={styles.infoGroup}>
              <span style={styles.label}><Phone size={14} /> Contact Number</span>
              {isEditing ? (
                <input style={styles.input} value={userData.contact_number} onChange={(e) => setUserData({...userData, contact_number: e.target.value})} />
              ) : (
                <span style={styles.value}>{userData.contact_number || "Not provided"}</span>
              )}
            </div>

            <div style={{...styles.infoGroup, gridColumn: isMobile ? 'span 1' : 'span 2'}}>
              <span style={styles.label}><MapPin size={14} /> Home Address</span>
              {isEditing ? (
                <input style={styles.input} value={userData.address} onChange={(e) => setUserData({...userData, address: e.target.value})} />
              ) : (
                <span style={styles.value}>{userData.address || "No address set"}</span>
              )}
            </div>

            <div style={styles.infoGroup}>
              <span style={styles.label}><Mail size={14} /> Email Address</span>
              <span style={{...styles.value, color: '#888'}}>{userData.email}</span>
            </div>

            {userData.role === 'vendor' && (
              <div style={styles.infoGroup}>
                <span style={styles.label}><ShieldCheck size={14} /> Account Status</span>
                <span style={{ ...styles.value, color: statusInfo.color, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {statusInfo.icon} {statusInfo.text}
                </span>
              </div>
            )}
          </div>
        </div>

        {userData.role === 'vendor' && (
          <div style={styles.card}>
            <h3 style={{ fontWeight: '900', fontSize: '1.2rem', marginBottom: '10px' }}>Business Permit & Verification</h3>
            
            {userData.verification_status === 'verified' ? (
              <div style={{ 
                backgroundColor: '#f0fdf4', 
                border: '1px solid #bbf7d0', 
                padding: '15px', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px',
                color: '#166534',
                marginTop: '15px',
                boxSizing: 'border-box'
              }}>
                <ShieldCheck size={24} color="#22c55e" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: 0, fontWeight: '800', fontSize: '0.95rem' }}>Permit Fully Verified</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#15803d' }}>
                    Your business permit has been reviewed and approved by the admin. You have full access to publish and manage your services.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Upload your official business permit or document to get verified by the admin and display the trust badge on your services.
                </p>

                <form onSubmit={handlePermitUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '16px', border: '2px dashed #cbd5e1', boxSizing: 'border-box' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', color: '#0f172a' }}>
                      <FileText size={14} /> Select Permit File (PDF, JPG, PNG)
                    </label>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setPermitFile(e.target.files[0])}
                      style={{ width: '100%', fontSize: '0.85rem', cursor: 'pointer' }} 
                    />
                  </div>

                  {userData.permit_path && (
                    <div style={{ fontSize: '0.85rem', color: '#0f172a', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' }}>
                      <span style={{ fontWeight: '700' }}>Current Document:</span> 
                      
                      {(() => {
                        const permitUrl = userData.permit_path.startsWith('http') 
                          ? userData.permit_path 
                          : `https://eventease-backend.onrender.com/storage/${userData.permit_path}`;

                        const isImage = /\.(jpg|jpeg|png|webp)$/i.test(permitUrl);

                        return (
                          <div>
                            {isImage && (
                              <div style={{ marginBottom: '10px' }}>
                                <img 
                                  src={permitUrl} 
                                  alt="Business Permit Preview" 
                                  onClick={() => setPreviewImage(permitUrl)}
                                  style={{ maxWidth: '100%', width: '180px', maxHeight: '140px', borderRadius: '10px', border: '1px solid #cbd5e1', objectFit: 'cover', display: 'block', cursor: 'pointer' }} 
                                  title="Click to preview"
                                />
                              </div>
                            )}

                            {isImage ? (
                              <button 
                                type="button" 
                                onClick={() => setPreviewImage(permitUrl)}
                                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '700', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                              >
                                Preview Image on Screen 🔍
                              </button>
                            ) : (
                              <a 
                                href={permitUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }}
                              >
                                View PDF Document ↗
                              </a>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={uploadingPermit}
                    style={{ background: '#000', color: '#fff', border: 'none', padding: '14px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', width: isMobile ? '100%' : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', boxSizing: 'border-box' }}
                  >
                    <Upload size={16} /> {uploadingPermit ? 'UPLOADING...' : 'UPLOAD / UPDATE PERMIT'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {previewImage && (
        <div style={styles.modalOverlay} onClick={() => setPreviewImage(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setPreviewImage(null)}>
              <X size={20} />
            </button>
            <img src={previewImage} alt="Enlarged Permit Preview" style={styles.modalImage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
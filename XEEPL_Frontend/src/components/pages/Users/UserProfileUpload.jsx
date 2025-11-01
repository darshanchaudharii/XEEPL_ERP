import React, { useState } from 'react';
import './UserProfileUpload.css';

export default function UserProfileUpload({ onFileSelected }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
    if (onFileSelected) onFileSelected(f);
  };

  return (
    <div className="profile-upload">
      <div className="preview">
        <img src={preview || '/assets/placeholder-avatar.png'} alt="preview" />
      </div>
      <div className="file-select">
        <input id="photoInput" type="file" accept="image/*" onChange={handleFile} />
        <label htmlFor="photoInput" className="btn">Choose File</label>
        <div className="filename">{fileName || 'No file chosen'}</div>
      </div>
    </div>
  );
}

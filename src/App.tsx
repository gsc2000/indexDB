import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [videoFile, setVideoFile] = useState<string | null>(null);

  useEffect(() => {
    const openDB = indexedDB.open('videoDB', 1);
    openDB.onupgradeneeded = () => {
      const db = openDB.result;
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos');
      }
    };
    openDB.onsuccess = () => {
      const db = openDB.result;
      const transaction = db.transaction('videos', 'readonly');
      const store = transaction.objectStore('videos');
      const getRequest = store.get('videoFile');
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          setVideoFile(getRequest.result);
        }
      };
    };
  }, []);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const videoData = reader.result as string;
        setVideoFile(videoData);
        
        const openDB = indexedDB.open('videoDB', 1);
        openDB.onsuccess = () => {
          const db = openDB.result;
          const transaction = db.transaction('videos', 'readwrite');
          const store = transaction.objectStore('videos');
          store.put(videoData, 'videoFile');
          transaction.oncomplete = () => {
            setVideoFile(videoData); // Ensure UI updates immediately
          };
        };
      };
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Video Upload</h1>
        <input type="file" accept="video/*" onChange={handleVideoUpload} />
        {videoFile && (
          <video key={videoFile} controls width="400">
            <source src={videoFile} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </header>
    </div>
  );
}

export default App;

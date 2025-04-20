import { useState } from 'react';
import CryptoJS from 'crypto-js';
import Globe from 'react-globe.gl';

function hashToCoords(name) {
  const hash = CryptoJS.SHA256(name).toString();
  const latSegment = parseInt(hash.slice(0, 8), 16);
  const lonSegment = parseInt(hash.slice(8, 16), 16);
  const lat = (latSegment / 0xffffffff) * 180 - 90;
  const lon = (lonSegment / 0xffffffff) * 360 - 180;
  return { lat, lon };
}

function App() {
  const [name, setName] = useState('');
  const [coords, setCoords] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const location = hashToCoords(name);
    setCoords(location);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Name to Location 🌍 (3D Globe)</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
        />
        <button type="submit">Find My Spot</button>
      </form>

      {coords && (
        <div style={{ height: '600px', marginTop: 20 }}>
          <Globe
            globeImageUrl="https://raw.githubusercontent.com/iamdanfox/earth-textures/main/earth-day.jpg"
            pointsData={[coords]}
            pointLat="lat"
            pointLng="lon"
            pointColor={() => 'red'}
            pointAltitude={() => 0.02}
          />
        </div>
      )}
    </div>
  );
}

export default App;

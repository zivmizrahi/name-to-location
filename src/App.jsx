import { useState } from 'react';
import CryptoJS from 'crypto-js';
import Globe from 'react-globe.gl';

function hashToCoords(name) {
  const hash = CryptoJS.SHA256(name).toString();
  const latSegmentHex = hash.slice(0, 8);
  const lonSegmentHex = hash.slice(8, 16);

  const latSegment = parseInt(latSegmentHex, 16);
  const lonSegment = parseInt(lonSegmentHex, 16);

  const lat = (latSegment / 0xffffffff) * 180 - 90;
  const lon = (lonSegment / 0xffffffff) * 360 - 180;

  return {
    lat: parseFloat(lat.toFixed(4)),
    lon: parseFloat(lon.toFixed(4)),
    hash,
    latSegmentHex,
    lonSegmentHex,
    latSegment,
    lonSegment
  };
}

function App() {
  const [name, setName] = useState('');
  const [coords, setCoords] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const result = hashToCoords(name);
    setCoords(result);
    setCopied(false);
  };

  const copyHash = () => {
    if (!coords) return;
    navigator.clipboard.writeText(coords.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Name to Location 🌍 (3D Globe)</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          style={{ padding: 10, fontSize: 16, width: '300px', marginRight: 10 }}
        />
        <button type="submit" style={{ padding: '10px 20px', fontSize: 16 }}>
          Find My Spot
        </button>
      </form>

      {coords && (
        <>
          <div style={{ height: 500, marginBottom: 40, position: 'relative', zIndex: 1 }}>
            <Globe
              globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              pointsData={[coords]}
              pointLat="lat"
              pointLng="lon"
              pointColor={() => 'red'}
              pointAltitude={() => 0.02}
              atmosphereColor="skyblue"
              atmosphereAltitude={0.25}
            />
          </div>

          <div
            style={{
              marginTop: 20,
              padding: 20,
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              fontFamily: 'monospace',
              position: 'relative',
              zIndex: 0
            }}
          >
            <h2>🧠 Hash Breakdown</h2>
            <p><strong>Entered Name:</strong> {name}</p>
            <p style={{ wordBreak: 'break-all' }}>
              <strong>SHA-256 Hash:</strong> {coords.hash}
              <button
                onClick={copyHash}
                style={{
                  marginLeft: 10,
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </p>
            <p><strong>Latitude Segment:</strong> {coords.latSegmentHex} → {coords.latSegment}</p>
            <p><strong>Longitude Segment:</strong> {coords.lonSegmentHex} → {coords.lonSegment}</p>
            <p><strong>Normalized Latitude:</strong> {coords.lat}°</p>
            <p><strong>Normalized Longitude:</strong> {coords.lon}°</p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

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
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const location = hashToCoords(name);
    setCoords(location);
    setShowDetails(true);
    setCopied(false);
  };

  const copyHash = () => {
    navigator.clipboard.writeText(coords.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Name to Location 🌍 (3D Globe)</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          style={{
            padding: '10px',
            fontSize: '16px',
            marginRight: '10px',
            width: '300px'
          }}
        />
        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px' }}>
          Find My Spot
        </button>
      </form>

      {coords && (
        <>
          <div style={{ height: '600px' }}>
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

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => setShowDetails((prev) => !prev)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showDetails ? 'Hide Calculation' : 'See How It Works'}
            </button>
          </div>

          {showDetails && (
            <div
              style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                fontFamily: 'monospace'
              }}
            >
              <h2>🧠 Hash Breakdown</h2>
              <p><strong>Entered Name:</strong> {name}</p>
              <p style={{ display: 'flex', alignItems: 'center' }}>
                <strong>Full SHA-256 Hash:</strong>
                <span style={{ marginLeft: '10px', wordBreak: 'break-all' }}>{coords.hash}</span>
                <button
                  onClick={copyHash}
                  style={{
                    marginLeft: '10px',
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
          )}
        </>
      )}
    </div>
  );
}

export default App;

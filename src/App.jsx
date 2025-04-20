import { useState, useRef, useEffect } from 'react';
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
    name,
    hash,
    latSegmentHex,
    lonSegmentHex,
    latSegment,
    lonSegment
  };
}

function App() {
  const [name, setName] = useState('');
  const [coordsList, setCoordsList] = useState([]);
  const [copied, setCopied] = useState(false);
  const globeEl = useRef();

  useEffect(() => {
    if (globeEl.current && coordsList.length > 0) {
      const last = coordsList[coordsList.length - 1];
      globeEl.current.pointOfView({ lat: last.lat, lng: last.lon, altitude: 1.5 }, 1500);
    }
  }, [coordsList]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const result = hashToCoords(name);
    setCoordsList((prev) => [...prev, result]);
    setCopied(false);
  };

  const copyHash = () => {
    if (coordsList.length === 0) return;
    const last = coordsList[coordsList.length - 1];
    navigator.clipboard.writeText(last.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadScreenshot = () => {
    if (!globeEl.current) return;
    requestAnimationFrame(() => {
      const canvas = globeEl.current.renderer().domElement;
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'my-location-globe.png';
      link.click();
    });
  };

  const clearNames = () => {
    setCoordsList([]);
    setCopied(false);
  };

  const last = coordsList[coordsList.length - 1];

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: 16,
    margin: '5px 10px 5px 0',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#007BFF',
    color: '#fff',
    cursor: 'pointer',
    flexShrink: 0
  };

  const inputStyle = {
    padding: '10px 15px',
    fontSize: 16,
    width: '100%',
    maxWidth: '300px',
    marginRight: 10,
    borderRadius: '6px',
    border: '1px solid #ccc',
    flexShrink: 1
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Name to Location 🌍 (3D Globe)</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Find My Spot
        </button>
        {coordsList.length > 0 && (
          <>
            <button onClick={downloadScreenshot} style={buttonStyle} type="button">
              Download Image
            </button>
            <button onClick={clearNames} style={buttonStyle} type="button">
              Clear Names
            </button>
          </>
        )}
      </form>

      {coordsList.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            alignItems: 'center'
          }}
        >
          <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            <Globe
              ref={globeEl}
              width={window.innerWidth < 600 ? 350 : 600}
              height={window.innerWidth < 600 ? 350 : 600}
              globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              labelsData={coordsList}
              labelLat="lat"
              labelLng="lon"
              labelText={(d) => d.name}
              labelSize={1.2}
              labelDotRadius={0.4}
              labelColor={() => 'rgba(255, 0, 0, 0.75)'}
              labelAltitude={0.01}
              atmosphereColor="skyblue"
              atmosphereAltitude={0.25}
            />
          </div>

          <div
            style={{
              width: '100%',
              padding: 20,
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              fontFamily: 'monospace',
              boxSizing: 'border-box'
            }}
          >
            <h2>🧠 Hash Breakdown</h2>
            <p><strong>Entered Name:</strong> {last.name}</p>
            <p style={{ wordBreak: 'break-word' }}>
              <strong>SHA-256 Hash:</strong> {last.hash}
              <button
                onClick={copyHash}
                style={{
                  marginLeft: 10,
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  backgroundColor: '#28a745',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff'
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </p>
            <p><strong>Latitude Segment:</strong> {last.latSegmentHex} → {last.latSegment}</p>
            <p><strong>Longitude Segment:</strong> {last.lonSegmentHex} → {last.lonSegment}</p>
            <p><strong>Normalized Latitude:</strong> {last.lat}°</p>
            <p><strong>Normalized Longitude:</strong> {last.lon}°</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

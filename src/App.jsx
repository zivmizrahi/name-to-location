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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const globeEl = useRef();
  const globeContainerRef = useRef();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedName = params.get('name');
    if (sharedName && coordsList.length === 0) {
      const result = hashToCoords(sharedName);
      setName(sharedName);
      setCoordsList([result]);

      // Trigger globe focus after a short delay
      setTimeout(() => {
        if (globeEl.current) {
          globeEl.current.pointOfView(
            { lat: result.lat, lng: result.lon, altitude: 1.5 },
            2000
          );
        }
      }, 1000);
    }
  }, []);

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
    window.history.replaceState(null, '', `?name=${encodeURIComponent(name)}`);
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
    window.history.replaceState(null, '', window.location.pathname);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const shareLocation = () => {
    if (!coordsList.length) return;
    const { name } = coordsList[coordsList.length - 1];
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?name=${encodeURIComponent(name)}`;
    const message = `🌍 Check out my globe location for "${name}": ${shareUrl}`;

    if (navigator.share) {
      navigator.share({ title: 'My Globe Spot', text: message, url: shareUrl }).catch(() => {});
    } else {
      const whatsapp = `https://wa.me/?text=${encodeURIComponent(message)}`;
      const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      const win = window.open('', '_blank');
      win.document.write(
        `<div style="padding:20px;font-family:sans-serif;text-align:center;">
          <h3>Share your location</h3>
          <a href="${whatsapp}" target="_blank" style="margin:10px;display:inline-block;padding:10px 20px;background:#25D366;color:#fff;border-radius:5px;text-decoration:none;">WhatsApp</a>
          <a href="${facebook}" target="_blank" style="margin:10px;display:inline-block;padding:10px 20px;background:#3b5998;color:#fff;border-radius:5px;text-decoration:none;">Facebook</a>
        </div>`
      );
    }
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

  const globeSize = isFullscreen
    ? Math.min(window.innerWidth, window.innerHeight) * window.devicePixelRatio
    : window.innerWidth < 600
    ? 350
    : window.innerWidth < 1024
    ? 600
    : 900;

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1>Name to Location 🌍 (3D Globe)</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Find My Spot</button>
        {coordsList.length > 0 && (
          <>
            <button onClick={downloadScreenshot} style={buttonStyle} type="button">Download Image</button>
            <button onClick={clearNames} style={buttonStyle} type="button">Clear Names</button>
            <button onClick={toggleFullscreen} style={buttonStyle} type="button">
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Globe'}
            </button>
            <button onClick={shareLocation} style={buttonStyle} type="button">Share Location</button>
          </>
        )}
      </form>

      {coordsList.length > 0 && (
        <>
          <div
            ref={globeContainerRef}
            style={{
              width: isFullscreen ? '100vw' : '100%',
              height: isFullscreen ? '100vh' : 'auto',
              position: isFullscreen ? 'fixed' : 'relative',
              top: isFullscreen ? 0 : 'auto',
              left: isFullscreen ? 0 : 'auto',
              zIndex: isFullscreen ? 1000 : 'auto',
              backgroundColor: isFullscreen ? 'black' : 'transparent',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  padding: '10px 16px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  zIndex: 1100
                }}
              >✖</button>
            )}
            <Globe
              ref={globeEl}
              width={globeSize}
              height={globeSize}
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

          <div style={{ width: '100%', padding: 20, backgroundColor: '#f0f0f0', borderRadius: '8px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
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
              >{copied ? 'Copied!' : 'Copy'}</button>
            </p>
            <p><strong>Latitude Segment:</strong> {last.latSegmentHex} → {last.latSegment}</p>
            <p><strong>Longitude Segment:</strong> {last.lonSegmentHex} → {last.lonSegment}</p>
            <p><strong>Normalized Latitude:</strong> {last.lat}°</p>
            <p><strong>Normalized Longitude:</strong> {last.lon}°</p>
          </div>
        </>
      )}

      <footer style={{ textAlign: 'center', marginTop: 40, fontSize: 14, color: '#888' }}>
        Vibe-coded by Ziv Mizrahi
      </footer>
    </div>
  );
}

export default App;

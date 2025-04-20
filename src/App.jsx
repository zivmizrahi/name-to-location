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

  // ... (rest of the component remains unchanged)
}

export default App;

import React, { useEffect, useRef } from 'react';
import { Compass, MapPin, Navigation } from 'lucide-react';

interface MapComponentProps {
  restaurantCoords?: { lat: number; lng: number };
  restaurantName?: string;
  customerAddress?: string;
  riderStatus?: string;
  distanceKm?: number;
  durationMin?: number;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  restaurantName = 'The Saffron Grill',
  customerAddress = 'Khunta Main Road, Odisha',
  riderStatus = 'Accepted',
  distanceKm = 2.4,
  durationMin = 18,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 240 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = 240;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw Map Grid Background (Light grid pattern)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Coordinates mapping (scale into box)
    const restaurantPos = { x: width * 0.25, y: height * 0.5 };
    const customerPos = { x: width * 0.75, y: height * 0.5 };

    // Draw route preview path (dotted line)
    ctx.strokeStyle = '#ea580c'; // FRETZA Orange
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(restaurantPos.x, restaurantPos.y);
    ctx.lineTo(customerPos.x, customerPos.y);
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // Determine Rider position based on delivery status
    let riderPos = { x: restaurantPos.x, y: restaurantPos.y };
    let riderLabel = 'Rider at Shop';

    if (riderStatus === 'Travelling to Restaurant') {
      riderPos = { x: width * 0.15, y: height * 0.45 };
      riderLabel = 'Rider heading to Saffron Grill';
    } else if (riderStatus === 'Reached Restaurant') {
      riderPos = { x: restaurantPos.x, y: restaurantPos.y };
      riderLabel = 'Rider reached Saffron Grill';
    } else if (riderStatus === 'Picked Up' || riderStatus === 'Travelling to Customer') {
      // Middle of the way
      riderPos = { x: width * 0.5, y: height * 0.5 };
      riderLabel = 'Rider on the way to Customer';
    } else if (riderStatus === 'Delivered') {
      riderPos = { x: customerPos.x, y: customerPos.y };
      riderLabel = 'Order Delivered!';
    }

    // Draw Restaurant pin (Red marker)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(restaurantPos.x, restaurantPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(restaurantPos.x, restaurantPos.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw Customer pin (Green marker)
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(customerPos.x, customerPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(customerPos.x, customerPos.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw Rider position marker (if order is active)
    if (riderStatus !== 'Pending' && riderStatus !== 'Delivered') {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(riderPos.x, riderPos.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label rider status
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(riderLabel, riderPos.x, riderPos.y - 14);
    }

    // Text labels for markers
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    
    // Write restaurant name & customer destination onto canvas
    const shopLabel = restaurantName.length > 15 ? restaurantName.substring(0, 15) + '...' : restaurantName;
    const destLabel = customerAddress.length > 15 ? customerAddress.substring(0, 15) + '...' : customerAddress;
    
    ctx.fillText(shopLabel, restaurantPos.x, restaurantPos.y + 20);
    ctx.fillText(destLabel, customerPos.x, customerPos.y + 20);
  }, [riderStatus, restaurantName, customerAddress]);

  return (
    <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-xs overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
      
      {/* Canvas Map rendering */}
      <div className="relative">
        <canvas ref={canvasRef} className="w-full h-60 block" />
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-outline-variant/10 text-[9px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5 shadow-sm dark:bg-zinc-800 dark:border-zinc-700">
          <Navigation className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>FRETZA Navigation (Google Maps / OSM Mode)</span>
        </div>
      </div>

      {/* Estimates footer */}
      <div className="bg-surface-container-low border-t border-outline-variant/10 p-4 flex justify-around items-center text-center dark:bg-zinc-800/30 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex justify-center text-primary">
            <Compass className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Estimated Distance</p>
          <h4 className="text-xs font-black text-on-surface">{distanceKm} km</h4>
        </div>
        <div className="w-px h-8 bg-outline-variant/20" />
        <div className="space-y-1">
          <div className="flex justify-center text-primary">
            <MapPin className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Estimated Time</p>
          <h4 className="text-xs font-black text-on-surface">{durationMin} mins</h4>
        </div>
      </div>

    </div>
  );
};

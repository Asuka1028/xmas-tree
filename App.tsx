
import React, { useState, useRef, useEffect } from 'react';
import Scene from './components/Scene';
import InteractionLayer from './components/InteractionLayer';
import { PhotoData } from './types';
import { getConePoint } from './utils';
import { TREE_HEIGHT, TREE_RADIUS } from './constants';

const App: React.FC = () => {
  // 0 = Fully Formed, 1 = Fully Chaos
  const [chaosStep, setChaosStep] = useState(0); 
  const [isExpanding, setIsExpanding] = useState(true);
  
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [showPhotos, setShowPhotos] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<PhotoData | null>(null);
  const [fireworkTriggers, setFireworkTriggers] = useState<number[]>([]);

  // Physics State for Free Rotation (XY axis)
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for logic
  const lastPos = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const startDragTime = useRef(0);
  const startDragPos = useRef({ x: 0, y: 0 });
  
  // Touch Gesture Refs
  const initialPinchDist = useRef<number | null>(null);

  const setDirectChaosState = (state: 'FORMED' | 'CHAOS') => {
      if (state === 'CHAOS') {
          setChaosStep(5);
          setIsExpanding(false);
      } else {
          setChaosStep(0);
          setIsExpanding(true);
      }
  };

  const handleHandRotate = (addedVelocityX: number) => {
      velocityRef.current.x = addedVelocityX;
      setVelocity({ ...velocityRef.current });
  }

  const triggerFirework = () => {
      setFireworkTriggers(prev => [...prev, Date.now()]);
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!e.isPrimary) return;
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    startDragPos.current = { x: e.clientX, y: e.clientY };
    startDragTime.current = Date.now();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !e.isPrimary) return;
    
    const deltaX = e.clientX - lastPos.current.x;
    const deltaY = e.clientY - lastPos.current.y;
    
    lastPos.current = { x: e.clientX, y: e.clientY };
    
    // Sensitivity reduced to 60% of previous (0.009 -> 0.0054, 0.0072 -> 0.00432)
    velocityRef.current = {
        x: deltaX * 0.0054,
        y: deltaY * 0.00432 
    };
    setVelocity({ ...velocityRef.current });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const dist = Math.hypot(
        e.clientX - startDragPos.current.x,
        e.clientY - startDragPos.current.y
    );
    const time = Date.now() - startDragTime.current;
    
    if (dist < 10 && time < 300) {
        handleSceneClick();
    }
  };

  const getTouchDist = (t1: React.Touch, t2: React.Touch) => {
      return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
          setIsDragging(false);
          initialPinchDist.current = getTouchDist(e.touches[0], e.touches[1]);
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDist.current !== null) {
          const currentDist = getTouchDist(e.touches[0], e.touches[1]);
          const delta = currentDist - initialPinchDist.current;
          
          if (delta > 40) {
              if (chaosStep < 5) setDirectChaosState('CHAOS');
              initialPinchDist.current = currentDist;
          } else if (delta < -40) {
              if (chaosStep > 0) setDirectChaosState('FORMED');
              initialPinchDist.current = currentDist;
          }
      }
  };

  const handleTouchEnd = () => {
      initialPinchDist.current = null;
  };

  const handleSceneClick = () => {
      if (isExpanding) {
          if (chaosStep < 5) {
              setChaosStep(s => s + 1);
          } else {
              setIsExpanding(false);
              setChaosStep(4);
          }
      } else {
          if (chaosStep > 0) {
              setChaosStep(s => s - 1);
          } else {
              setIsExpanding(true);
              setChaosStep(1);
          }
      }
  };

  useEffect(() => {
    if (!isDragging) {
      let animFrame: number;
      const decay = () => {
        velocityRef.current.x *= 0.965; 
        velocityRef.current.y *= 0.965;
        
        setVelocity({ ...velocityRef.current });
        
        if (Math.abs(velocityRef.current.x) > 0.0005 || Math.abs(velocityRef.current.y) > 0.0005) {
          animFrame = requestAnimationFrame(decay);
        }
      };
      decay();
      return () => cancelAnimationFrame(animFrame);
    }
  }, [isDragging]);

  const handleUploadPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos: PhotoData[] = Array.from(e.target.files).map((file) => {
        const url = URL.createObjectURL(file as any);
        const pos = getConePoint(TREE_HEIGHT, TREE_RADIUS * 1.1);
        return {
          id: Math.random().toString(36).substr(2, 9),
          url,
          position: [pos.x, pos.y, pos.z],
          rotation: [0, Math.atan2(pos.x, pos.z), Math.random() * 0.4 - 0.2]
        };
      });
      setPhotos(prev => [...prev, ...newPhotos].slice(-16));
      setShowPhotos(true); // Auto-show if new photos added
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-black select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Scene 
        chaosLevel={chaosStep / 5.0} 
        photos={photos} 
        showPhotos={showPhotos}
        onPhotoClick={setZoomedPhoto}
        velocity={velocity}
        isDragging={isDragging}
        fireworkTriggers={fireworkTriggers}
      />
      
      <InteractionLayer 
        setDirectChaosState={setDirectChaosState}
        onUploadPhotos={handleUploadPhotos}
        isCameraEnabled={isCameraEnabled}
        toggleCamera={() => setIsCameraEnabled(!isCameraEnabled)}
        zoomedPhoto={zoomedPhoto}
        onCloseZoom={() => setZoomedPhoto(null)}
        onHandRotate={handleHandRotate}
        onFirework={triggerFirework}
        showPhotos={showPhotos}
        togglePhotos={() => setShowPhotos(!showPhotos)}
      />
    </div>
  );
};

export default App;

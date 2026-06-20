"use client";

import { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import * as satellite from 'satellite.js';
import { useZenithStore } from '@/store/zenith-store';
import { Navigation, Satellite as SatIcon, X, ShieldAlert, Globe } from 'lucide-react';
import { getJulianDate, getGMST } from '@/utils/astronomy';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Configure Cesium CDN assets base url before any Cesium code runs
if (typeof window !== 'undefined') {
  (window as any).CESIUM_BASE_URL = 'https://unpkg.com/cesium@1.127.0/Build/Cesium/';
}

// Local mathematical helpers to avoid relying on satellite.js exports which can have type mapping issues
const radToDeg = (rad: number) => (rad * 180) / Math.PI;
const degToRad = (deg: number) => (deg * Math.PI) / 180;

interface SatelliteTle {
  id: string;
  name: string;
  tle1: string;
  tle2: string;
}

interface SelectedInfo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  alt: number; // km
  speed: number; // km/h
  azimuth: number;
  elevation: number;
  distance: number; // km
  isIss: boolean;
}

export default function CesiumGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const { location, showSatellites } = useZenithStore();

  const [satellites, setSatellites] = useState<SatelliteTle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSat, setSelectedSat] = useState<SelectedInfo | null>(null);
  const [trackingMode, setTrackingMode] = useState<'free' | 'iss' | 'selected'>('free');

  // Keep a ref copy of selectedSat to avoid re-registering the preRender callback on every update
  const selectedSatRef = useRef<SelectedInfo | null>(null);
  const trackingModeRef = useRef<'free' | 'iss' | 'selected'>('free');
  const lastInfoUpdateRef = useRef<number>(0);

  // Sync refs with state
  useEffect(() => { selectedSatRef.current = selectedSat; }, [selectedSat]);
  useEffect(() => { trackingModeRef.current = trackingMode; }, [trackingMode]);

  // References for live entity updating
  const satellitesDataRef = useRef<any[]>([]);
  const pointCollectionRef = useRef<Cesium.PointPrimitiveCollection | null>(null);
  const pointsMapRef = useRef<Map<string, Cesium.PointPrimitive>>(new Map());
  
  // Entity refs
  const observerEntityRef = useRef<Cesium.Entity | null>(null);
  const issEntityRef = useRef<Cesium.Entity | null>(null);
  const issOrbitRef = useRef<Cesium.Entity | null>(null);
  const selectedEntityRef = useRef<Cesium.Entity | null>(null);

  // Fetch active satellites with retry logic
  useEffect(() => {
    let cancelled = false;

    async function fetchSats(retries = 3, delay = 2000) {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const res = await fetch('/api/satellites');
          if (!res.ok) throw new Error(`Server returned ${res.status}`);
          const data = await res.json();

          // Guard: API may return an error object instead of array
          if (!Array.isArray(data)) throw new Error('Invalid satellite data format');
          if (cancelled) return;

          setSatellites(data);

          // Pre-parse TLE records for fast SGP4 calculation
          const parsed = data.map((sat: SatelliteTle) => {
            try {
              const satrec = satellite.twoline2satrec(sat.tle1, sat.tle2);
              return {
                id: sat.id,
                name: sat.name,
                satrec,
                isIss: sat.name.includes('ISS') || sat.name.includes('ZARYA'),
              };
            } catch {
              return null;
            }
          }).filter(Boolean);

          satellitesDataRef.current = parsed;
          setLoading(false);
          return; // Success — exit retry loop
        } catch (err: any) {
          console.warn(`Satellite fetch attempt ${attempt}/${retries} failed:`, err.message);
          if (attempt < retries && !cancelled) {
            await new Promise((r) => setTimeout(r, delay * attempt));
          }
        }
      }

      // All retries exhausted
      if (!cancelled) {
        setError('Unable to fetch live satellite data.');
        setLoading(false);
      }
    }

    fetchSats();
    return () => { cancelled = true; };
  }, []);

  // Initialize Cesium Viewer
  useEffect(() => {
    if (!containerRef.current) return;

    // Set Cesium ion access token to null to prevent warnings
    Cesium.Ion.defaultAccessToken = '';

    const viewer = new Cesium.Viewer(containerRef.current, {
      terrainProvider: undefined,
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      vrButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true,
      shouldAnimate: true,
      requestRenderMode: false,
    });

    // Darker/space style configurations
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.showWaterEffect = false;
    if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = true;
    if (viewer.scene.sun) viewer.scene.sun.show = true;
    if (viewer.scene.moon) viewer.scene.moon.show = true;

    // Customize base layer
    const baseLayer = viewer.scene.imageryLayers.get(0);
    if (baseLayer) {
      viewer.scene.imageryLayers.remove(baseLayer);
    }
    
    // Add CartoDB Dark Matter tiles for a premium night look
    const cartoProvider = new Cesium.UrlTemplateImageryProvider({
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      credit: '© OpenStreetMap, © CARTO',
    });
    const cartoLayer = viewer.scene.imageryLayers.addImageryProvider(cartoProvider);
    // Suppress non-critical tile load errors from external CDN
    cartoLayer.imageryProvider.errorEvent?.addEventListener(() => {});

    // Hide default Cesium bottom logo credits for neat UI look
    const creditContainer = viewer.bottomContainer as HTMLElement;
    if (creditContainer) {
      creditContainer.style.display = 'none';
    }

    viewerRef.current = viewer;

    // Create single primitive collection for satellites
    const pointCollection = new Cesium.PointPrimitiveCollection();
    viewer.scene.primitives.add(pointCollection);
    pointCollectionRef.current = pointCollection;

    // Add Observer Location Entity
    const observerEntity = viewer.entities.add({
      name: 'Observer Station',
      position: Cesium.Cartesian3.fromDegrees(location.lng, location.lat, 0),
      point: {
        pixelSize: 12,
        color: Cesium.Color.fromCssColorString('#06b6d4'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
      label: {
        text: location.name,
        font: 'bold 12px Inter, sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -12),
      },
    });
    observerEntityRef.current = observerEntity;

    // Create the ISS entity
    const issEntity = viewer.entities.add({
      name: 'ISS (ZARYA)',
      point: {
        pixelSize: 14,
        color: Cesium.Color.fromCssColorString('#eab308'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
      label: {
        text: 'ISS',
        font: 'bold 11px Inter, sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.fromCssColorString('#ffd700'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -12),
      },
    });
    issEntityRef.current = issEntity;

    // Create ISS Orbit line entity
    const issOrbitEntity = viewer.entities.add({
      name: 'ISS Orbit',
      polyline: {
        positions: [],
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString('rgba(234, 179, 8, 0.4)'),
          dashLength: 16.0,
        }),
      },
    });
    issOrbitRef.current = issOrbitEntity;

    // Create a special selected satellite entity for tracking
    const selectedEntity = viewer.entities.add({
      name: 'Selected Object',
      point: {
        pixelSize: 16,
        color: Cesium.Color.fromCssColorString('#a855f7'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
      label: {
        text: '',
        font: 'bold 12px Inter, sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -14),
      },
    });
    selectedEntityRef.current = selectedEntity;

    // Screen Space Handler for object selection clicks
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: any) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.primitive && pickedObject.primitive.id) {
        const satId = pickedObject.primitive.id;
        const satObj = satellitesDataRef.current.find((s) => s.id === satId);
        if (satObj) {
          if (satObj.isIss) {
            setTrackingMode('iss');
          } else {
            setTrackingMode('selected');
            const now = new Date();
            const gmst = degToRad(getGMST(getJulianDate(now)));
            const posVel = satellite.propagate(satObj.satrec, now);
            const position = posVel.position;
            const velocity = posVel.velocity;

            if (position && velocity && typeof position !== 'boolean' && typeof velocity !== 'boolean') {
              const posGd = satellite.eciToGeodetic(position, gmst);
              const lat = radToDeg(posGd.latitude);
              const lng = radToDeg(posGd.longitude);
              const alt = posGd.height;
              const speed = Math.sqrt(
                Math.pow(velocity.x, 2) +
                Math.pow(velocity.y, 2) +
                Math.pow(velocity.z, 2)
              ) * 3600; // km/h

              // Look angles
              const observerGeodetic = {
                latitude: degToRad(location.lat),
                longitude: degToRad(location.lng),
                height: 0,
              };
              const positionEcf = satellite.eciToEcf(position, gmst);
              const lookAngles = satellite.ecfToLookAngles(observerGeodetic, positionEcf);
              const az = radToDeg(lookAngles.azimuth);
              const el = radToDeg(lookAngles.elevation);

              setSelectedSat({
                id: satObj.id,
                name: satObj.name,
                lat,
                lng,
                alt,
                speed,
                azimuth: az,
                elevation: el,
                distance: lookAngles.rangeSat,
                isIss: false,
              });
            }
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Initial camera position
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(location.lng, location.lat - 35, 12000000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-55),
        roll: 0.0,
      },
    });

    const resizeObserver = new ResizeObserver(() => {
      viewer.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      handler.destroy();
      resizeObserver.disconnect();
      viewer.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update observer location on change
  useEffect(() => {
    if (observerEntityRef.current) {
      observerEntityRef.current.position = new Cesium.ConstantPositionProperty(
        Cesium.Cartesian3.fromDegrees(location.lng, location.lat, 0)
      );
      if (observerEntityRef.current.label) {
        observerEntityRef.current.label.text = new Cesium.ConstantProperty(location.name);
      }
    }
  }, [location.lat, location.lng, location.name]);

  // Main SGP4 propagation and state-sync render loop
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    let isDestroyed = false;
    let lastSetSelectedTime = 0;

    // Pre-Render callback
    const updateSatellitesPositions = () => {
      if (isDestroyed) return;

      const now = new Date();
      const gmst = degToRad(getGMST(getJulianDate(now)));
      const pointsMap = pointsMapRef.current;
      const pointCollection = pointCollectionRef.current;
      const parsedSats = satellitesDataRef.current;
      const currentSelectedSat = selectedSatRef.current;
      const currentTrackingMode = trackingModeRef.current;

      if (!pointCollection) return;

      // Handle satellites loading/rendering on point collections
      if (showSatellites && parsedSats.length > 0) {
        if (pointCollection.length === 0) {
          parsedSats.forEach((sat) => {
            if (sat.isIss) return;
            const point = pointCollection.add({
              pixelSize: 3,
              color: Cesium.Color.fromCssColorString('rgba(168, 85, 247, 0.75)'),
              id: sat.id,
            });
            pointsMap.set(sat.id, point);
          });
        }

        parsedSats.forEach((sat) => {
          if (sat.isIss) return;
          const posVel = satellite.propagate(sat.satrec, now);
          const point = pointsMap.get(sat.id);
          const pos = posVel.position;

          if (pos && point && typeof pos !== 'boolean') {
            const posGd = satellite.eciToGeodetic(pos, gmst);
            const alt = posGd.height * 1000;
            const posCartesian = Cesium.Cartesian3.fromRadians(posGd.longitude, posGd.latitude, alt);
            point.position = posCartesian;
            point.show = true;
          } else if (point) {
            point.show = false;
          }
        });
      } else {
        pointsMap.forEach((point) => {
          point.show = false;
        });
      }

      // Propagate ISS Position
      const issSatObj = parsedSats.find((s) => s.isIss);
      if (issSatObj && issEntityRef.current) {
        const posVel = satellite.propagate(issSatObj.satrec, now);
        const position = posVel.position;
        const velocity = posVel.velocity;

        if (position && velocity && typeof position !== 'boolean' && typeof velocity !== 'boolean') {
          const posGd = satellite.eciToGeodetic(position, gmst);
          const alt = posGd.height;

          const cartesian = Cesium.Cartesian3.fromRadians(posGd.longitude, posGd.latitude, alt * 1000);
          issEntityRef.current.position = new Cesium.ConstantPositionProperty(cartesian);

          // Render ISS Orbit line
          if (issOrbitRef.current && issOrbitRef.current.polyline) {
            const orbitPoints: Cesium.Cartesian3[] = [];
            for (let offset = -46; offset <= 46; offset += 2) {
              const offsetTime = new Date(now.getTime() + offset * 60 * 1000);
              const offsetGmst = degToRad(getGMST(getJulianDate(offsetTime)));
              const oPosVel = satellite.propagate(issSatObj.satrec, offsetTime);
              const oPos = oPosVel.position;
              if (oPos && typeof oPos !== 'boolean') {
                const oPosGd = satellite.eciToGeodetic(oPos, offsetGmst);
                orbitPoints.push(
                  Cesium.Cartesian3.fromRadians(oPosGd.longitude, oPosGd.latitude, oPosGd.height * 1000)
                );
              }
            }
            if (orbitPoints.length > 0) {
              (issOrbitRef.current.polyline.positions as any) = new Cesium.ConstantProperty(orbitPoints);
            }
          }

          if (currentTrackingMode === 'iss') {
            viewer.trackedEntity = issEntityRef.current;
          }
        }
      }

      // Propagate Selected Sat & Update info
      if (currentSelectedSat && selectedEntityRef.current) {
        const selSatObj = parsedSats.find((s) => s.id === currentSelectedSat.id);
        if (selSatObj) {
          const posVel = satellite.propagate(selSatObj.satrec, now);
          const position = posVel.position;
          const velocity = posVel.velocity;

          if (position && velocity && typeof position !== 'boolean' && typeof velocity !== 'boolean') {
            const posGd = satellite.eciToGeodetic(position, gmst);
            const lat = radToDeg(posGd.latitude);
            const lng = radToDeg(posGd.longitude);
            const alt = posGd.height;
            const speed = Math.sqrt(
              Math.pow(velocity.x, 2) +
              Math.pow(velocity.y, 2) +
              Math.pow(velocity.z, 2)
            ) * 3600;

            const cartesian = Cesium.Cartesian3.fromRadians(posGd.longitude, posGd.latitude, alt * 1000);
            selectedEntityRef.current.position = new Cesium.ConstantPositionProperty(cartesian);
            if (selectedEntityRef.current.label) {
              selectedEntityRef.current.label.text = new Cesium.ConstantProperty(selSatObj.name);
            }
            selectedEntityRef.current.show = true as any;

            // Compute look angles
            const observerGeodetic = {
              latitude: degToRad(location.lat),
              longitude: degToRad(location.lng),
              height: 0,
            };
            const positionEcf = satellite.eciToEcf(position, gmst);
            const lookAngles = satellite.ecfToLookAngles(observerGeodetic, positionEcf);
            const az = radToDeg(lookAngles.azimuth);
            const el = radToDeg(lookAngles.elevation);

            const nextData = {
              id: selSatObj.id,
              name: selSatObj.name,
              lat,
              lng,
              alt,
              speed,
              azimuth: az,
              elevation: el,
              distance: lookAngles.rangeSat,
              isIss: false,
            };

            // Throttled update to state — only once per second instead of every frame
            if (now.getTime() - lastSetSelectedTime > 1000) {
              setSelectedSat(nextData);
              lastSetSelectedTime = now.getTime();
            }
            selectedSatRef.current = nextData;

            if (currentTrackingMode === 'selected') {
              viewer.trackedEntity = selectedEntityRef.current;
            }
          }
        }
      } else if (selectedEntityRef.current) {
        selectedEntityRef.current.show = false as any;
      }
    };

    viewer.scene.preRender.addEventListener(updateSatellitesPositions);

    return () => {
      isDestroyed = true;
      if (!viewer.isDestroyed()) {
        viewer.scene.preRender.removeEventListener(updateSatellitesPositions);
      }
    };
    // selectedSat and trackingMode accessed via refs to avoid re-registration loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSatellites, location.lat, location.lng]);

  // Track buttons handling
  const handleTrackISS = () => {
    setSelectedSat(null);
    setTrackingMode('iss');
  };

  const handleUntrack = () => {
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.trackedEntity = undefined;
    }
    setTrackingMode('free');
  };

  return (
    <div className="w-full h-full relative overflow-hidden rounded-3xl" style={{ minHeight: '520px' }}>
      {/* Canvas container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0" style={{ background: '#020617' }} />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 animate-pulse">
            <Globe className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
          <span className="text-white/60 text-sm font-medium">Booting Cesium 3D Engine & TLE Propagation...</span>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 p-6 text-center z-20">
          <ShieldAlert className="w-10 h-10 text-red-500" />
          <span className="text-white text-base font-semibold">{error}</span>
          <span className="text-white/40 text-xs">CelesTrak feeds rate-limited or blocked. Try checking network connection.</span>
        </div>
      )}

      {/* Floating Instructions HUD */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 max-w-[280px]">
        <div className="glass rounded-xl p-3 text-[11px] text-white/60 pointer-events-none border border-white/5 space-y-1">
          <div className="font-semibold text-white/90">Controls</div>
          <div>Left Click + Drag: Rotate Earth</div>
          <div>Right Click + Drag: Tilt View</div>
          <div>Scroll Wheel: Zoom in/out</div>
          <div>Click Satellite to select & analyze</div>
        </div>
      </div>

      {/* Tracking controller overlays */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleTrackISS}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold backdrop-blur-md shadow-lg transition-all ${
            trackingMode === 'iss'
              ? 'bg-yellow-500/30 border-yellow-500 text-yellow-300 shadow-yellow-500/10'
              : 'bg-black/55 hover:bg-black/75 border-white/10 text-white/80 hover:text-white'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Track ISS</span>
        </button>

        {trackingMode !== 'free' && (
          <button
            onClick={handleUntrack}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/25 border border-red-500/40 text-red-300 hover:bg-red-500/40 text-xs font-semibold backdrop-blur-md transition-all shadow-lg shadow-red-500/5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Unlock Camera</span>
          </button>
        )}
      </div>

      {/* Selected Satellite Popup Overlay */}
      {selectedSat && (
        <div className="absolute top-4 left-4 z-10 glass-card border border-purple-500/30 max-w-sm rounded-2xl p-4 shadow-2xl backdrop-blur-lg animate-in fade-in slide-in-from-left-5 duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20">
                <SatIcon className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm leading-tight max-w-[190px] truncate">{selectedSat.name}</h4>
                <div className="text-[10px] text-white/40 font-mono">NORAD ID: {selectedSat.id}</div>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedSat(null);
                if (trackingMode === 'selected') handleUntrack();
              }}
              className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3 font-mono">
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <div className="text-[9px] text-white/40 uppercase mb-0.5">Latitude</div>
              <div className="font-semibold text-white">{selectedSat.lat.toFixed(3)}°</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <div className="text-[9px] text-white/40 uppercase mb-0.5">Longitude</div>
              <div className="font-semibold text-white">{selectedSat.lng.toFixed(3)}°</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <div className="text-[9px] text-white/40 uppercase mb-0.5">Altitude</div>
              <div className="font-semibold text-cyan-400">{selectedSat.alt.toFixed(1)} km</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <div className="text-[9px] text-white/40 uppercase mb-0.5">Velocity</div>
              <div className="font-semibold text-green-400">{Math.round(selectedSat.speed).toLocaleString()} km/h</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5 col-span-2">
              <div className="text-[9px] text-white/40 uppercase mb-0.5">Distance from Station</div>
              <div className="font-semibold text-purple-300">{selectedSat.distance.toFixed(1)} km</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <div className="text-[9px] text-white/40 uppercase mb-0.5">Azimuth</div>
              <div className="font-semibold text-white">{selectedSat.azimuth.toFixed(1)}°</div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <div className="text-[9px] text-white/40 uppercase mb-0.5">Elevation</div>
              <div className="font-semibold text-white">{selectedSat.elevation.toFixed(1)}°</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTrackingMode('selected')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                trackingMode === 'selected'
                  ? 'bg-purple-500/30 border-purple-500 text-purple-200'
                  : 'bg-purple-600 hover:bg-purple-500 border-transparent text-white shadow-lg shadow-purple-500/10'
              }`}
            >
              {trackingMode === 'selected' ? 'Camera Locked' : 'Lock Camera'}
            </button>
            <a
              href={`https://db.satnogs.org/search/?q=${selectedSat.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 hover:border-white/30 text-white/60 hover:text-white font-semibold transition-all flex items-center justify-center"
            >
              Info
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

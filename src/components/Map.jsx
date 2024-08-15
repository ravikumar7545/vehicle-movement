import React, { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-polylinedecorator';
import 'leaflet.marker.slideto/Leaflet.Marker.SlideTo';
import markerIcon from '../assets/car.png';
import vehicleRouteData from '../assets/dummyData.json';

// Show Arrow along the path vehicle has taken
const PolylineDecorator = ({ path }) => {
  const map = useMap();

  useEffect(() => {
    if (path.length > 1) {
      const decorator = L.polylineDecorator(path, {
        patterns: [
          {
            offset: 10,
            repeat: 100,
            symbol: L.Symbol.arrowHead({
              pixelSize: 15,
              pathOptions: { fillOpacity: 1, weight: 0 },
            }),
          },
        ],
      });
      decorator.addTo(map);

      return () => {
        map.removeLayer(decorator);
      };
    }
  }, [map, path]);

  return null;
};

const Map = () => {
  // Random default position
  const [currentPosition, setCurrentPosition] = useState([28.73, 77.098]);
  //   Store the path vehicle has moved
  const [path, setPath] = useState([]);
  console.log(path);
  //   Store the data fetched from the database
  // const [vehicleRouteData, setVehicleRouteData] = useState([]);
  // Store angle of marker icon
  const [angle, setAngle] = useState(10);

  //  Custom Marker icon
  let customIcon = new L.DivIcon({
    html: `<img src="${markerIcon}" style="transform: rotate(${angle}deg); width: 40px; height: 40px;" />`,
    iconSize: [40, 40],
    className: '',
  });

  //   Calculate the degree of rotation marker should take
  const calculateAngle = (from, to) => {
    const lat1 = from[0];
    const lon1 = from[1];
    const lat2 = to[0];
    const lon2 = to[1];
    const dy = lat2 - lat1;
    const dx = Math.cos((Math.PI / 180) * lat1) * (lon2 - lon1);
    const theta = Math.atan2(dy, dx);
    let angle = ((theta * 180) / Math.PI + 360) % 360;
    angle = angle.toFixed(2) - 20;
    setAngle((prev) => prev - prev + angle);
  };

  //   Function to always focus map to current vehicle position
  const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
      map.setView([lat, lng]);
    }, []);
    return null;
  };

  //   Function to handle and calculate
  // -- Current location of vehicle
  // -- Send previous and current position(latitude, longitude) to calculate angle of marker

  async function delay() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const showRoute = async () => {
    for (let i = 0; i < vehicleRouteData.length; i++) {
      const route = vehicleRouteData[i];
      const newPosition = [route.latitude, route.longitude];
      if (i > 0) {
        const previousPosition = [
          vehicleRouteData[i - 1].latitude,
          vehicleRouteData[i - 1].longitude,
        ];
        calculateAngle(previousPosition, newPosition);
      }
      setCurrentPosition(newPosition);
      // setPath((prevPath) => [...prevPath, newPosition]);
      // console.log(path);
      await delay();
    }
  };

  useEffect(() => {
    if (vehicleRouteData.length > 0) {
      let currentPath = [];
      vehicleRouteData.forEach((route) => {
        let val = [route.latitude, route.longitude];
        currentPath.push(val);
      });
      setPath(currentPath);
    }
  }, [vehicleRouteData]);

  return (
    <>
      {/* Fetch vehicle data from backend */}
      <button onClick={showRoute}>Show</button>

      <MapContainer
        center={currentPosition}
        zoom={16}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={currentPosition} icon={customIcon} />
        <Polyline positions={path} color="blue" />
        <PolylineDecorator path={path} />
        <RecenterAutomatically
          //   position={currentPosition}
          lat={currentPosition[0]}
          lng={currentPosition[1]}
        />
      </MapContainer>
    </>
  );
};

export default Map;

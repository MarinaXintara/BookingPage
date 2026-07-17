import { useEffect } from "react";
import { map, tileLayer, marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./loadMap.css";


interface EventMapProps {
  latitude: number;
  longitude: number;
  title: string;
}


export default function EventMap({
  latitude,
  longitude,
  title
}: EventMapProps) {


  useEffect(() => {

    const myMap = map("event-map").setView(
      [latitude, longitude],
      14
    );


    tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          "&copy; OpenStreetMap contributors"
      }
    ).addTo(myMap);


    marker([latitude, longitude])
      .addTo(myMap)
      .bindPopup(title)
      .openPopup();


    return () => {
      myMap.remove();
    };


  }, [latitude, longitude, title]);


  return (
    <div
      id="event-map"
      style={{
        height: "400px",
        width: "100%"
      }}
    />
  );
}
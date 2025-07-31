import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import Loading from '../common/Loading';

const GoogleMapsPicker = ({ onAddressSelect }) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [selectedPosition, setSelectedPosition] = useState({
    lat: -6.2088,
    lng: 106.8456
  });
  const [address, setAddress] = useState('');

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const onMapClick = useCallback(async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setSelectedPosition({ lat, lng });

    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      
      if (result.results[0]) {
        const addressComponents = result.results[0].address_components;
        const formattedAddress = result.results[0].formatted_address;
        
        const getComponent = (type) => {
          const component = addressComponents.find(comp => comp.types.includes(type));
          return component ? component.long_name : '';
        };

        const addressData = {
          street: getComponent('street_number') + ' ' + getComponent('route'),
          city: getComponent('administrative_area_level_2'),
          province: getComponent('administrative_area_level_1'),
          postalCode: getComponent('postal_code'),
          latitude: lat,
          longitude: lng,
          fullAddress: formattedAddress
        };

        setAddress(formattedAddress);
        onAddressSelect(addressData);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }, [onAddressSelect]);

  if (loadError) {
    return <div className="text-red-600">Error loading maps</div>;
  }

  if (!isLoaded) {
    return <Loading text="Loading maps..." />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Klik pada peta untuk memilih lokasi</p>
      
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedPosition}
        zoom={15}
        onClick={onMapClick}
      >
        <Marker position={selectedPosition} />
      </GoogleMap>

      {address && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-700">Alamat yang dipilih:</p>
          <p className="text-sm text-gray-600">{address}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => onAddressSelect && onAddressSelect()}
          disabled={!address}
          className="btn btn-primary disabled:opacity-50"
        >
          Gunakan Alamat Ini
        </button>
      </div>
    </div>
  );
};

export default GoogleMapsPicker;
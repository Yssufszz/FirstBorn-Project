import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import GoogleMapsPicker from '../maps/GoogleMapsPicker';
import Modal from '../common/Modal';

const AddressForm = ({ onAddressChange }) => {
  const [showMap, setShowMap] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    province: '',
    postalCode: '',
    latitude: null,
    longitude: null,
    fullAddress: ''
  });

  const handleAddressSelect = (selectedAddress) => {
    setAddress(selectedAddress);
    onAddressChange(selectedAddress);
    setShowMap(false);
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    const updatedAddress = { ...address, [name]: value };
    setAddress(updatedAddress);
    onAddressChange(updatedAddress);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <MapPin size={16} />
          <span>Pilih di Peta</span>
        </button>
      </div>

      {address.fullAddress && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">{address.fullAddress}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <input
          name="street"
          value={address.street}
          onChange={handleManualChange}
          placeholder="Alamat lengkap"
          className="input"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <input
            name="city"
            value={address.city}
            onChange={handleManualChange}
            placeholder="Kota"
            className="input"
          />
          <input
            name="province"
            value={address.province}
            onChange={handleManualChange}
            placeholder="Provinsi"
            className="input"
          />
        </div>
        
        <input
          name="postalCode"
          value={address.postalCode}
          onChange={handleManualChange}
          placeholder="Kode Pos"
          className="input"
        />
      </div>

      <Modal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        title="Pilih Lokasi"
        size="large"
      >
        <GoogleMapsPicker onAddressSelect={handleAddressSelect} />
      </Modal>
    </div>
  );
};

export default AddressForm;
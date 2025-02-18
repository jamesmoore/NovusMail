import React, { ReactNode, useState } from 'react';
import AddressContext from './AddressContext';

const AddressContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedAddress, setAddressState] = useState('');

  const setSelectedAddress = (newAddress: string) => {
    setAddressState(newAddress);
  };

  return (
    <AddressContext.Provider value={{selectedAddress, setSelectedAddress}}>
      {children}
    </AddressContext.Provider>
  );
};

export default AddressContextProvider;
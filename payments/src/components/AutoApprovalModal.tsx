'use client';

import { useEffect, useState } from 'react';
import { useDevice } from '@/providers/DeviceProvider';
import { usePayment } from '@/providers/PaymentProvider';
import { PaymentApprovalModal } from './PaymentApprovalModal';

export const AutoApprovalModal = () => {
  const { selectedDevice } = useDevice();
  const { checkPaymentRequirements } = usePayment();
  const [showApproval, setShowApproval] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Check payment requirements when device is selected
  useEffect(() => {
    if (selectedDevice && !hasChecked) {
      setHasChecked(true);
      
      // Small delay to ensure everything is loaded
      setTimeout(async () => {
        try {
          const canPay = await checkPaymentRequirements();
          if (!canPay) {
            console.log('Payment requirements not met, showing approval modal');
            setShowApproval(true);
          }
        } catch (error) {
          console.error('Error checking payment requirements:', error);
          // Show approval modal anyway to be safe
          setShowApproval(true);
        }
      }, 1000);
    } else if (!selectedDevice) {
      setHasChecked(false);
      setShowApproval(false);
    }
  }, [selectedDevice, hasChecked, checkPaymentRequirements]);

  const handleApproved = () => {
    setShowApproval(false);
    console.log('USDC approval completed');
  };

  const handleCancel = () => {
    setShowApproval(false);
    console.log('USDC approval cancelled');
  };

  if (!selectedDevice || !showApproval) {
    return null;
  }

  return (
    <PaymentApprovalModal
      onApproved={handleApproved}
      onCancel={handleCancel}
    />
  );
};

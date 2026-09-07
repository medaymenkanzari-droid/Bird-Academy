/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Canari, Vente } from '../../../types';
import { TransferCertificateDocument } from './TransferCertificateDocument';

export interface TransferCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Vente;
  bird?: Canari;
  allBirds?: Canari[];
  breederName?: string;
  breederAffix?: string;
}

export const TransferCertificateModal: React.FC<TransferCertificateModalProps> = ({
  isOpen,
  onClose,
  sale,
  bird,
  allBirds
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#030712]/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl max-h-[94vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white my-auto animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <TransferCertificateDocument
            sale={sale}
            bird={bird}
            allBirds={allBirds}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default TransferCertificateModal;

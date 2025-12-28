import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  approveDocument(
    id: string,
    patientWallet: string,
    doctorWallet: string
  ): Promise<{ transactionHash: string; timestamp: number }> {
    console.log('Mock approveDocument called with:', id, patientWallet, doctorWallet);
    return Promise.resolve({
      transactionHash: '0xMOCKHASH',
      timestamp: Date.now()
    });
  }
}

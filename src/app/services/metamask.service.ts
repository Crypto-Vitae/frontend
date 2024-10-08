import { Injectable } from '@angular/core';
import detectEthereumProvider from '@metamask/detect-provider';

@Injectable({
  providedIn: 'root',
})
export class MetaMaskService {
  public address: string | null = null;
  private provider: any;
  public chainId: number = 0;

  constructor() {
    this.initMetaMask();
  }

  private async initMetaMask() {
    this.provider = await detectEthereumProvider();

    if (this.provider) {
      console.log('MetaMask is installed!');
    } else {
      console.error(
        'MetaMask is not installed. Please install it to use this feature.'
      );
    }
  }

  public async connectMetaMask(chainId: number): Promise<string | null> {
    if (this.provider) {
      try {
        const accounts = await this.provider.request({
          method: 'eth_requestAccounts',
        });
        this.chainId = chainId;
        await this.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
        this.address = accounts[0];
        return accounts[0];
      } catch (error) {
        console.error('User denied account access or error occurred:', error);
        return null;
      }
    } else {
      console.error('MetaMask is not available.');
      return null;
    }
  }

  public async getAccount(): Promise<string | null> {
    if (this.provider && this.provider.selectedAddress) {
      return this.provider.selectedAddress;
    }
    return null;
  }

  public async signMessage(message: string): Promise<string | null> {
    if (this.provider) {
      const account = await this.getAccount();
      if (account) {
        try {
          const signature = await this.provider.request({
            method: 'personal_sign',
            params: [message, account],
          });
          return signature;
        } catch (error) {
          console.error('Error signing message:', error);
          return null;
        }
      }
    }
    return null;
  }
}

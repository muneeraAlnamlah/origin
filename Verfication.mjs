import { ethers } from 'ethers';
export function verifySignature(signature, message ,consumerAddr) {
    if (typeof message === 'undefined' || message === null) {
        console.error('message is undefined or null');
        return false;
    }
    if (typeof signature === 'undefined' || signature === null) {
        console.error('signature is undefined or null');
        return false;
    }
    
  try{
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    return recoveredAddress === consumerAddr;
    } catch (error) {
        console.error('Error verifying signature:', error);
        throw error;
    }
}

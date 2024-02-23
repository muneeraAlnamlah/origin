import { ethers } from 'ethers';
import 'dotenv/config';
import contractAbi from './ACMC_ContractAbi.json' assert { type: 'json' };


const contractAddress = process.env.ACMC_ADDRESS;
const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const privateKey = process.env.PK;
const wallet = new ethers.Wallet(privateKey, provider);

export const evaluateAccessRequest = async (consumerAddr, resource, action) => {
    try {
        const contract = new ethers.Contract(contractAddress, contractAbi, wallet);
        // Check if consumerAddr, resource, and action are undefined before calling trim()
        if (typeof consumerAddr === 'undefined' || consumerAddr === null) {
            console.error('consumerAddr is undefined or null');
            return false;
        }

        if (typeof resource === 'undefined' || resource === null) {
            console.error('resource is undefined or null');
            return false;
        }

        if (typeof action === 'undefined' || action === null) {
            console.error('action is undefined or null');
            return false;
        }

        console.log('consumerAddr:', consumerAddr.trim());
        console.log('resource:', resource.trim());
        console.log('action:', action.trim());

        const gasLimit = 500000; // Manually setting gas limit
        
        const transaction = await contract.evaluateAccessRequest(
            consumerAddr.trim(),
            resource.trim(),
            action.trim(),
            {
                gasLimit: gasLimit
            }
        );

        const receipt = await transaction.wait();
        const accessGranted = receipt.events[0].args.accessGranted;
        return accessGranted
    } catch (error) {
        console.error('Error evaluating AccessRequest access token:', error);
        return false;
    }
};


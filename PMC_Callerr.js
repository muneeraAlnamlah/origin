import { ethers } from 'ethers';
import 'dotenv/config';
import contractAbi from './PMC_ContractAbi.json' assert { type: 'json' };


const contractAddress = process.env.PMC_ADDRESS;
const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const privateKey = process.env.PK;
const wallet = new ethers.Wallet(privateKey, provider);

export const isProviderRegistered = async (providerAddress) => {
    try {
        const contract = new ethers.Contract(contractAddress, contractAbi, wallet);
        // Check if consumerAddr, resource, and action are undefined before calling trim()
        if (typeof providerAddress === 'undefined' || providerAddress === null) {
            console.error('providerAddress is undefined or null');
            return false;
        }

       

        console.log('providerAddress:', providerAddress.trim());
       

        const gasLimit = 500000; // Manually setting gas limit
        
        const transaction = await contract.searchProvider(
            providerAddress.trim(),

            {
                gasLimit: gasLimit
            }
        );

        const receipt = await transaction.wait();
        const isProviderRegistered = receipt.events[0].args.exists;
        return isProviderRegistered
    } catch (error) {
        console.error('Error Searching for Provider:', error);
        return false;
    }
};


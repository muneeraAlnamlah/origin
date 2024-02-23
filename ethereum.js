import { ethers } from 'ethers';
import 'dotenv/config';
import contractAbi from './contractAbi.json' assert { type: 'json' };

const contractAddress = process.env.TMC_ADDRESS;
const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
const privateKey = process.env.PK;

const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

// //THE ORIGINAL
// export const validateAccessToken = async (accessToken, consumerAddr, resource, action) => {
//     try {
//         // Input validation
//         if (!consumerAddr || !resource || !action) {
//             throw new Error('One or more required parameters are missing or invalid.');
//         }

//         // Trim inputs
//         consumerAddr = consumerAddr.trim();
//         resource = resource.trim();
//         action = action.trim();

//         // Estimate gas
//         const estimatedGas = await contract.estimateGas.validateAccessToken(consumerAddr, resource, accessToken, action).catch(err => {
//             console.error('Error estimating gas:', err);
//             throw new Error('Failed to estimate gas.');
//         });

//         // Send transaction
//         const transaction = await contract.validateAccessToken(consumerAddr, resource, accessToken, action, {
//             gasLimit: estimatedGas.add(estimatedGas.mul(10).div(100)), // Adding 10% buffer
//         });

//         const receipt = await transaction.wait();

//         // Validate and extract event data
//         const event = receipt.events.find(e => e.event === "AccessTokenValidated"); // Replace ExpectedEventName with your actual event name
//         if (!event) throw new Error('Event not found in transaction receipt.');

//         const { isValid, reason } = event.args;

//         return { isValid, reason };
//     } catch (error) {
//         console.error('Error validating access token:', error.message || error);
//         return { isValid: false, reason: error.message || 'Error validating access token' };
//     }
// };

export const validateAccessToken = async (accessToken, consumerAddr, resource, action) => {
    try {
        console.log("Validating access token...");

        // Input validation
        if (!consumerAddr || !resource || !action) {
            throw new Error('One or more required parameters are missing or invalid.');
        }

        console.log("Input parameters:", { accessToken, consumerAddr, resource, action });

        // Trim inputs
        consumerAddr = consumerAddr.trim();
        resource = resource.trim();
        action = action.trim();

        console.log("Trimmed parameters:", { consumerAddr, resource, action });

        // Sending the transaction without estimating gas
        const gasLimit = 500000; // You can adjust this value as needed
        console.log("Sending transaction...");

        const transaction = await contract.validateAccessToken(consumerAddr, resource, accessToken, action, {
            gasLimit: gasLimit,
        });

        console.log("Transaction sent:", transaction);

        const receipt = await transaction.wait();
        console.log("Transaction receipt:", receipt);

        // Validate and extract event data
        const event = receipt.events.find(e => e.event === "AccessTokenValidated"); 
        if (!event) {
            throw new Error('Event not found in transaction receipt.');
        }

        console.log("Event found:", event);

        const { isValid, reason } = event.args;
        console.log("Validation result:", { isValid, reason });

        return { isValid, reason };
    } catch (error) {
        console.error('Error validating access token:', error.message || error);
        return { isValid: false, reason: error.message || 'Error validating access token' };
    }
};







// Assuming 'contract' is an initialized ethers.js contract instance
export const storeTokenHash = async (consumerAddr, resource, action, hashedToken) => {
    // Input validation
    if (!consumerAddr || !ethers.utils.isAddress(consumerAddr)) {
        console.error('Invalid consumer address:', consumerAddr);
        return false;
    }

    if (!hashedToken || hashedToken.length === 0) {
        console.error('Invalid hashed token:', hashedToken);
        return false;
    }

    if (!resource || resource.length === 0) {
        console.error('Invalid resource:', resource);
        return false;
    }

    if (!action || action.length === 0) {
        console.error('Invalid action:', action);
        return false;
    }

    try {
        // Trim inputs
        const trimmedConsumerAddr = consumerAddr.trim();
        const trimmedResource = resource.trim();
        const trimmedAction = action.trim();
        const prefixedHashedToken = '0x' + hashedToken.trim();

        // Dynamically estimate gas limit with a buffer
        const estimatedGasLimit = await contract.estimateGas.storeTokenHash(
            trimmedConsumerAddr, trimmedResource, trimmedAction, prefixedHashedToken
        );
        const gasLimitWithBuffer = estimatedGasLimit.mul(120).div(100); // Adding 20% buffer

        // Sending the transaction
        const txResponse = await contract.storeTokenHash(
            trimmedConsumerAddr, trimmedResource, trimmedAction, prefixedHashedToken,
            { gasLimit: gasLimitWithBuffer }
        );

        // Wait for the transaction to be mined
        await txResponse.wait();

        console.log('Token hash stored successfully:', txResponse.hash);
        return true;
    } catch (error) {
        console.error('Error storing access token:', error);
        return false;
    }
};



export const hasValidToken = async (consumerAddr , resource ,action)=>{
    try{
     // Check if consumerAddr, resource, and action are undefined before calling trim()
     if (typeof consumerAddr === 'undefined' || consumerAddr === null) {
         console.error('consumerAddr is undefined or null');
         console.error('consumerAddr is',consumerAddr);
         return false;
     }
     if (typeof resource === 'undefined' || resource === null) {
         console.error('resource is undefined or null');
         console.error('resource is',resource);
         return false;
     }

 
     if (typeof action === 'undefined' || action === null) {
         console.error('action is undefined or null');
         console.error('action is',action);
         return false;
     }
 
 
     const gasLimit = 500000; // Manually setting gas limit
 
     const transaction = await contract.hasValidToken(
             
             consumerAddr.trim(),
             resource.trim(),
             action.trim(),
             {
                 gasLimit: gasLimit
             }
         );
         const receipt = await transaction.wait();

         // Access the returned values from the contract function
         console.log("----------------------------------------------------weeee are in the errorrrrrrrrrrrrrrrrrrrr---------------------------------------")
         const ValidTokenCheck = receipt.events[0].args.hasValidToken;
         const reason = receipt.events[0].args.reason;
         console.log("----------------Event-----------------:",receipt.events[0])
         console.log("reason",reason)
         return { ValidTokenCheck, reason };
    }catch(error){
     console.error('Error checking access token exsitance :', error.message);
     return false;
 
    }
 }




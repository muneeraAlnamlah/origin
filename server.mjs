import express from 'express';
import connectToDatabase from './db.js';
///////////////////////Blockchain related Classes//////////////////////////////////////////////
import * as TMCops from './ethereum.js';//THIS IS TMC CALLER MODIFY IT 
import * as ACMCops from './ACMC_Caller.js';
import * as PMCops from './PMC_Callerr.js';
/////////////////////craetion, update,reading ,and deletion ///////////////////////////////////
import * as sensorDataOps from './sensorDataOps.mjs';
/////////////////////Genration,and hasshing of tokens////////////////////////////////////////
import * as tokenOps from './tokenOps.mjs';
/////////////////////Signture Verification////////////////////////////////////////////////////
import * as verify from "./Verfication.mjs";



const app = express();
app.use(express.json());

app.use(async (req, res, next) => {

    const path = req.path;
    const method = req.method;
        // Log the request path
        console.log('Request path:', path);

   if (path === '/api/sensor-data' && method === 'POST') {//make sure that
    const providerAddress = req.headers['x-provider-address']; // Assuming this header contains the provider address



    
    // Check if the provider is registered in the Ethereum blockchain
    const isRegistered = await PMCops.isProviderRegistered(providerAddress);
    if (isRegistered) {
        next(); // Provider exists, proceed with the request
    } else {
        res.status(403).json({ error: 'Provider not registered or authorized.' });
    }






    } else if (path === '//api/iot-access-request') {
        next();
    } else {
        
        const action = req.headers['x-action'];
        const accessToken = req.headers['x-access-token'];
        const consumerAddr = req.headers['x-consumer-address'];
        const resource = req.headers['x-resource'];


        
        const validationResult = await TMCops.validateAccessToken(accessToken, consumerAddr, resource, action);

        if (validationResult.isValid) {
            next();
        } else {
            const reason = validationResult.reason;
            res.status(403).json({ error: `Access denied. ${reason}` });
        }
    }
});







// Handle GET request for specific sensor data by ID
app.get('/api/sensor-data/:id', async (req, res) => {
    try {
        const sensorDataId = req.params.id; // Get the ID from the URL parameters




        // Fetch sensor data from the database based on the provided Address
        const sensorData = await sensorDataOps.fetchSensorDataByDeviceAddress(sensorDataId);
        if (sensorData) {
            res.status(200).json(sensorData);
        } else {
            res.status(404).json({ error: 'Sensor data not found' });
        }
    } catch (error) {
        console.error('Error handling GET request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Handle PUT request to update sensor data by ID
app.put('/api/sensor-data/:id', async (req, res) => {
    try {
        const sensorDataId = req.params.id; // Get the ID from the URL parameters
        const updatedData = req.body; // Assuming the request body contains updated data
        // Update sensor data in the database based on the provided ID
        const updatedSensorData = await sensorDataOps.updateSensorDataById(sensorDataId, updatedData);
        if (updatedSensorData) {
            res.status(200).json(updatedSensorData);
        } else {
            res.status(404).json({ error: 'Sensor data not found' });
        }
    } catch (error) {
        console.error('Error handling PUT request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle POST request to create new sensor data
app.post('/api/sensor-data', async (req, res) => {
    try {
        const newData = req.body;
        const createdData = await sensorDataOps.createSensorData(newData);
        res.status(201).json(createdData);
    } catch (error) {
        console.error('Error handling POST request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Handle POST request to Create access token
app.post('/api/iot-access-request', async (req, res) => {
    try {
        const consumerAddr = req.headers['x-consumer-address'];
        const message = req.headers['x-message'];
        const resource = req.headers['x-resource'];
        const action = req.headers['x-action'];
        const signature = req.headers['x-signature'];

        const isIotAddrOwner = verify.verifySignature(signature, message, consumerAddr);
        console.log("Signuture verified: ",isIotAddrOwner);

        if (!isIotAddrOwner) {
            return res.status(403).json({ error: 'Access request denied. You are not the address owner.' });
        }

        const hasToken = await TMCops.hasValidToken(consumerAddr, resource, action);
        console.log('Has valid token:', hasToken.ValidTokenCheck);

        if (hasToken.ValidTokenCheck) {
            return res.status(200).json({ message: 'Existing valid token found.' });
        }

        // Evaluate the access request
        const Auth = await ACMCops.evaluateAccessRequest(consumerAddr, resource, action);
        console.log("Is Authorized: ",Auth);

        if (!Auth) {
            return res.status(403).json({ error: 'Access request denied.',reason: hasToken.reason || 'Unknown reason' });
        }

        // Generate and store the token only after successful evaluation
        const token = tokenOps.generateAccessToken();
        const tokenHash = tokenOps.hashToken(token);
        await TMCops.storeTokenHash(consumerAddr, resource, action, tokenHash);
        console.log("--------------------------------------------------------------------------------------------------------")
        res.status(200).json({ token, reason: hasToken.reason || "New token generated" });

    } catch (error) {
        console.error('Error in /api/iot-access-request:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


app.delete('/api/sensor-data/:id', async (req, res) => {
    try {
        const sensorDataId = req.params.id; // Get the ID from the URL parameters
        // Delete sensor data from the database based on the provided ID
        const deleteResult = await sensorDataOps.deleteSensorDataById(sensorDataId);
        if (deleteResult) {
            res.status(204).end();
        } else {
            res.status(404).json({ error: 'Sensor data not found' });
        }
    } catch (error) {
        console.error('Error handling DELETE request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// connectToDatabase().then(() => {
//     app.listen(3000, () => {
//         console.log('Middleware Server is running on port 3000');

//     });
// });

connectToDatabase().then(() => {
    // Start the server and listen on the port provided by Heroku or 3000 locally
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
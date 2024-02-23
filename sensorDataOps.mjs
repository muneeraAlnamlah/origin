import SensorDataModel from "./models/sensorData.mjs";



export async function fetchSensorDataByDeviceAddress(deviceAddressToMatch) {
    try {
        // Find documents in the SensorData collection where 'deviceAddress' matches the desired address
        const sensorData = await SensorDataModel.find({ deviceAddress: deviceAddressToMatch })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order to get the latest records first
            .limit(10); // Limit the results to the last 10 records
        return sensorData;
    } catch (error) {
        console.error('Error fetching sensor data by device address:', error);
        throw error; // Handle the error appropriately in your application
    }
}


export async function createSensorData(newData) {
    try {
        // Create a new instance of the SensorDataModel with the provided data
        const createdData = new SensorDataModel(newData);

        // Save the new sensor data to the database
        await createdData.save();

        // Return the created sensor data
        return createdData;
    } catch (error) {
        console.error('Error creating sensor data:', error);
        throw error;
    }
}

export async function updateSensorDataById(deviceAddress, updatedData) {
    try {
        // First, find the most recent document for the given deviceAddress
        const latestDocument = await SensorDataModel.findOne({ deviceAddress: deviceAddress })
            .sort({ _id: -1 }) // Sort by _id in descending order to get the most recent document
            .exec();

        if (!latestDocument) {
            return null; // If no document is found, return null
        }

        // Then, update the found document by its _id
        const updatedSensorData = await SensorDataModel.findByIdAndUpdate(
            latestDocument._id,
            updatedData,
            { new: true, runValidators: true } // Options: return the updated document and run validators
        );

        return updatedSensorData; // Return the updated document
    } catch (error) {
        console.error('Error updating the latest sensor data by device address:', error);
        throw error;
    }
}
// Function to delete sensor data by ID
export async function deleteSensorDataById(sensorDataId) {
    try {
        // Using Mongoose's findByIdAndDelete to delete the sensor data by its ID
        const deleteResult = await SensorDataModel.findByIdAndDelete(sensorDataId);

        if (deleteResult) {
            return true; // Deletion was successful
        } else {
            return false; // If the sensor data with the specified ID is not found
        }
    } catch (error) {
        console.error('Error deleting sensor data by ID:', error);
        throw error; // Handle the error appropriately in your application
    }
}

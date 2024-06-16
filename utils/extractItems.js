const extractFirstData = (data) => {
    const firstData = {};
    for (const key in data) {
        if (key.startsWith("first_")) {
            // Remove "first_" prefix and store value
            firstData[key.slice(6)] = data[key];
        }
    }
    return firstData;
};

const extractSecondData = (data) => {
    const firstData = {};
    for (const key in data) {
        if (key.startsWith("second_")) {
            // Remove "first_" prefix and store value
            firstData[key.slice(6)] = data[key];
        }
    }
    return firstData;
};

module.exports = { extractFirstData, extractSecondData };

const calculateFlightDuration = (departureDate, arrivalDate) => {
    const departureDateTime = new Date(departureDate).getTime();
    const arrivalDateTime = new Date(arrivalDate).getTime();

    const duration = arrivalDateTime - departureDateTime;

    const durationHours = Math.floor(duration / (1000 * 60 * 60));
    const durationMinutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${durationHours}h ${durationMinutes}m`;
}

const sortShortestDuration = (duration) => {
    const [hours, minutes] = duration.split('h ');
    return parseInt(hours) * 60 + parseInt(minutes);
};

const formatPrice = (price) => {
    return price ? price.toLocaleString("en-US", { style: "currency", currency: "IDR" }) : null;
};

module.exports = {
    calculateFlightDuration,
    sortShortestDuration,
    formatPrice,
};

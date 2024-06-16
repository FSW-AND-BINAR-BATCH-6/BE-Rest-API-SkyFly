const calculateFlightDuration = (departureDate, arrivalDate, transitDepartureDate, transitArrivalDate) => {
    const departureDateTime = new Date(departureDate).getTime();
    const arrivalDateTime = new Date(arrivalDate).getTime();

    let duration;

    if (transitDepartureDate && transitArrivalDate) {
        const transitDepartureDateTime = new Date(transitDepartureDate).getTime();
        const transitArrivalDateTime = new Date(transitArrivalDate).getTime();
        duration = (arrivalDateTime - departureDateTime) - (transitArrivalDateTime - transitDepartureDateTime);
    } else {
        duration = arrivalDateTime - departureDateTime;
    }

    const durationHours = Math.floor(duration / (1000 * 60 * 60));
    const durationMinutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${durationHours}h ${durationMinutes}m`;
}

module.exports = { calculateFlightDuration }

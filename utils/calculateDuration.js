const calculateFlightDuration = (departureDate, arrivalDate, transitDepartureDate, transitArrivalDate) => {
    const departureDateTime = new Date(departureDate).getTime();
    const arrivalDateTime = new Date(arrivalDate).getTime();

    if (transitDepartureDate && transitArrivalDate) {
        const transitDepartureDateTime = new Date(transitDepartureDate).getTime();
        const transitArrivalDateTime = new Date(transitArrivalDate).getTime();

        return (arrivalDateTime - departureDateTime) - (transitArrivalDateTime - transitDepartureDateTime);
    } else {
        return arrivalDateTime - departureDateTime;
    }
}

module.exports = { calculateFlightDuration }
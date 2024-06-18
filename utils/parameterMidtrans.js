const parameterMidtrans = async (body) => {
    let data = body;

    let orderer = {
        fullName: data.orderer.fullName,
        familyName: data.orderer.familyName,
        phoneNumber: data.orderer.phoneNumber,
        email: data.orderer.email,
    };

    let passengers = [];

    data.passengers.map((data) => {
        let dob = new Date(data.dob);
        let validityPeriod = new Date(data.validityPeriod);

        passengers.push({
            title: data.title,
            name: `${data.title} ${data.fullName}`,
            fullName: data.fullName,
            dob: new Date(dob.getTime() + 7 * 60 * 60 * 1000).toISOString(),
            passport: data.passport,
            validityPeriod: new Date(
                validityPeriod.getTime() + 7 * 60 * 60 * 1000
            ).toISOString(),
            familyName: data.familyName,
            citizenship: data.citizenship,
            issuingCountry: data.issuingCountry,
            price: data.price,
            quantity: data.quantity,
            seatId: data.seatId,
        });
    });

    return { passengers, orderer };
};

const totalPrice = async (itemDetails) => {
    let totalPrice = 0;
    for (let i = 0; i < itemDetails.length; i++) {
        totalPrice += itemDetails[i].price * itemDetails[i].quantity;
    }
    return totalPrice;
};

module.exports = {
    parameterMidtrans,
    totalPrice,
};

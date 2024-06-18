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
        let price = data.price;
        let type = data.type.toString().toUpperCase();

        if (type === "CHILD" || type === "CHILDREN") {
            price = data.price - data.price / 2;
        } else if (
            type === "INFRANT" ||
            type === "BABY" ||
            type === "INFRANTS"
        ) {
            price = 0;
        }

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
            price: price,
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

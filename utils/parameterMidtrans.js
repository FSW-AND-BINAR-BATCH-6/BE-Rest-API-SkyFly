const { randomUUID } = require("crypto");

const parameterMidtrans = async (body) => {
    let data = body;

    let orderer = {
        first_name: data.orderer.fullName,
        last_name: data.orderer.familyName,
        phone: data.orderer.phoneNumber,
        email: data.orderer.email,
    };

    let passengers = [];

    data.passengers.map((data) => {
        let price = data.price;
        let type = data.type.toString().toUpperCase();

        let dob = new Date(data.dob);
        let validityPeriod =
            type === "CHILD" || type === "INFRANT"
                ? null
                : new Date(data.validityPeriod);

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
            id: randomUUID(),
            title: data.title,
            name: `${data.title} ${data.fullName}`,
            fullName: data.fullName,
            passport:
                type === "CHILD" || type === "INFRANT" ? null : data.passport,
            dob: new Date(dob.getTime() + 7 * 60 * 60 * 1000).toISOString(),
            validityPeriod:
                type === "CHILD" || type === "INFRANT"
                    ? null
                    : new Date(
                          validityPeriod.getTime() + 7 * 60 * 60 * 1000
                      ).toISOString(),
            type,
            familyName: data.familyName,
            citizenship: data.citizenship,
            issuingCountry: data.issuingCountry,
            price: price,
            quantity: 1,
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

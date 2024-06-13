const { randomUUID } = require("crypto");
const { extractSecondData } = require("./extractItems");

const dataCustomerDetail = async (data) => {
    const customer_details = {
        first_name: data.fullName, // req.body.fullname
        last_name: data.familyName, // req.body.familyName
        phone: data.phoneNumber, // req.body.phoneNumber
        email: data.email,
        bookingDate: new Date().toISOString(),
    };

    return customer_details;
};

const dataItemDetail = async (data) => {
    const secondData = extractSecondData(data);

    let item_details;
    const first = {
        dob: new Date(data.first_dob),
        validityPeriod: new Date(data.first_validityPeriod),
    };

    if (Object.keys(secondData).length !== 0) {
        const second = {
            dob: new Date(data.second_dob),
            validityPeriod: new Date(data.second_validityPeriod),
        };

        item_details = [
            {
                id: randomUUID(),
                name: `${data.first_title} ${data.first_fullName}`,
                dob: new Date(
                    first.dob.getTime() + 7 * 60 * 60 * 1000
                ).toISOString(),
                validityPeriod: new Date(
                    first.validityPeriod.getTime() + 7 * 60 * 60 * 1000
                ).toISOString(),
                familyName: data.first_familyName,
                flightId: data.flightId,
                citizenship: data.first_citizenship,
                issuingCountry: data.first_issuingCountry,
                price: data.first_price,
                quantity: data.first_quantity,
                seatId: data.first_seatId,
            },
            {
                id: randomUUID(),
                name: `${data.second_title} ${data.second_fullName}`,
                dob: new Date(
                    second.dob.getTime() + 7 * 60 * 60 * 1000
                ).toISOString(),
                validityPeriod: new Date(
                    second.validityPeriod.getTime() + 7 * 60 * 60 * 1000
                ).toISOString(),
                familyName: data.second_familyName,
                flightId: data.flightId,
                citizenship: data.second_citizenship,
                issuingCountry: data.second_issuingCountry,
                price: data.second_price,
                quantity: data.second_quantity,
                seatId: data.second_seatId,
            },
        ];
    } else {
        item_details = [
            {
                id: randomUUID(),
                name: `${data.first_title} ${data.first_fullName}`,
                dob: new Date(
                    first.dob.getTime() + 7 * 60 * 60 * 1000
                ).toISOString(),
                validityPeriod: new Date(
                    first.validityPeriod.getTime() + 7 * 60 * 60 * 1000
                ).toISOString(),
                familyName: data.first_familyName,
                flightId: data.flightId,
                citizenship: data.first_citizenship,
                issuingCountry: data.first_issuingCountry,
                price: data.first_price,
                quantity: data.first_quantity,
                seatId: data.first_seatId,
            },
        ];
    }

    return item_details;
};

const totalPrice = async (itemDetails) => {
    let totalPrice = 0;
    for (let i = 0; i < itemDetails.length; i++) {
        totalPrice += itemDetails[i].price * itemDetails[i].quantity;
    }
    return totalPrice;
};

module.exports = {
    dataCustomerDetail,
    dataItemDetail,
    totalPrice,
};

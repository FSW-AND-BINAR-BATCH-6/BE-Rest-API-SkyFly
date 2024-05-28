const { randomUUID } = require("crypto");

const dataCustomerDetail = async (data) => {
    const customer_details = {
        first_name: "harry potter", // req.body.fullname
        last_name: "potter", // req.body.familyName
        phone: "628123456789", // req.body.phoneNumber
        email: "customer@mail.com",
    };

    return customer_details;
};

const dataItemDetail = async (data) => {
    const item_details = [
        {
            id: randomUUID(),
            name: "Ticket Air Asia",
            price: 1000,
            quantity: 1,
        },
        {
            id: randomUUID(),
            name: "Ticket Air Asia Premium",
            price: 2000,
            quantity: 2,
        },
    ];

    return item_details;
};

const totalPrice = async (itemDetails) => {
    let totalPrice = 0;
    for (let i = 0; i < itemDetails.length; i++) {
        totalPrice += itemDetails[i].price * itemDetails[i].quantity;
    }
    return totalPrice;
};

module.exports = { dataCustomerDetail, dataItemDetail, totalPrice };

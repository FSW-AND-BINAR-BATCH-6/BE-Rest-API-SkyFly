const https = require("follow-redirects").https;

const smsHandler = (phoneNumber, OTPToken, urlTokenVerification) => {
    // send SMS
    let options = {
        method: "POST",
        hostname: "9l6dx4.api.infobip.com",
        path: "/sms/2/text/advanced",
        headers: {
            Authorization: `App ${process.env.SMS_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        maxRedirects: 20,
    };

    let reqSMS = https.request(options, function (res) {
        let chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            let body = Buffer.concat(chunks);
            console.log(body.toString());
        });

        res.on("error", function (error) {
            console.error(error);
        });
    });

    let postData = JSON.stringify({
        messages: [
            {
                destinations: [{ to: phoneNumber }],
                from: "Sky Fly Production",
                text: `Verify your account with Sky Fly Production.\n\nOTP: ${OTPToken}\n\nTo protect your account, please do not give the OTP to anyone\n\nFollow the following link to verify your account:\n${urlTokenVerification}`,
            },
        ],
    });

    console.log(postData);

    reqSMS.write(postData);
    reqSMS.end();
};

module.exports = { smsHandler };

const smsHandler = async (phoneNumber, OTPToken, urlTokenVerification) => {
    // send SMS
    await fetch(`https://9l6dx4.api.infobip.com/sms/2/text/advanced`, {
        method: "POST",
        headers: {
            Authorization: `App ${process.env.SMS_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            messages: [
                {
                    destinations: [{ to: phoneNumber }],
                    from: "Sky Fly Production",
                    text: `Verify your account with Sky Fly Production.\n\nOTP: ${OTPToken}\n\nTo protect your account, please do not give the OTP to anyone\n\nFollow the following link to verify your account:\n${urlTokenVerification}`,
                },
            ],
        }),
    });
};

module.exports = { smsHandler };

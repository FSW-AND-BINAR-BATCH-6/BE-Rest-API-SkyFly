const {google} = require("googleapis")

const oauth2Client = new google.auth.OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    process.env.CALLBACK_URL
)

const scope = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]

const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scope,
    include_granted_scopes: true
})

module.exports = {authorizationUrl, oauth2Client}
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleRegister = async (req, res) => {
 try {
    const {name, email, phoneNumber, password} = req.body
    const saltRounds = 10
    console.log(saltRounds)
    const hashedPassword = bcrypt.hashSync(password, saltRounds)
    
    const newAccount = await prisma.User.create({
        data:{
            name,
            phoneNumber,
            role: "CUSTOMER",
            Auth: {
                create: {
                    email,
                    password: hashedPassword
                }
            }
        }
    });
    res.status(200).json({
        status: true,
        message: "Success creating new account",
        data: {
            name,
            email,
            phoneNumber,
            password
        }
    });
 } catch (error) {
    res.status(500).json({message: error.message})
 }
}

const handleLogin = async (req, res) => {
    try {
        const {email, password} = req.body

        const userAccount = await prisma.Auth.findUnique({
            where: {
                email: email
            },
            include: {
                user: true
            }
        })
        if(userAccount && bcrypt.compareSync(password, userAccount.password)){
            console.log(userAccount.user.id)
            const token = jwt.sign({
                id: userAccount.user.id,
                name: userAccount.user.name,
                email: userAccount.email,
                phoneNumber: userAccount.user.phoneNumber
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRED
            }
        );
        }
        
        res.status(200).end()

        
    } catch (error) {
        res.status(500).json({
            error
        })
    }
}

module.exports = {handleRegister, handleLogin}
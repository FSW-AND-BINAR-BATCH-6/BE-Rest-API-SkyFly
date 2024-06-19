# Binar Final Project - Skyfly

<div align="center" width="100%">
    <img width="100%" height="100%" src="./public/assets/skyfly.jpeg" alt="Design Spread" title="Design Spread"> 
</div>
<br>

### Team C-1 Skyfly!

Skyfly API allows you to get the needed resources to make Skyfly application run seamlessly. Some of this service is using authentication to access each service. You need to login first to access the service.

### Overview

SkyFly is an online flight ticket booking application designed to provide a seamless and user-friendly experience for booking flights. This project uses ExpressJs as the backend framework and Postgres as the database, managed through Prisma ORM. The application supports various functionalities essential for an efficient flight booking system.

### Key Features

|                                    |                                                                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| User Authentication and Management | Secure login and registration for users using otp code to verified email or Oauth login, with profile management capabilities |
| Airline Information                | Access detailed information about various airlines                                                                            |
| Airports Details                   | Retrieve airports data on records                                                                                             |
| Flight Details                     | View and manage flight schedules, routes, and details                                                                         |
| Seat Booking                       | Check seat availability and book seats on flights                                                                             |
| Transaction Handling               | Manage user transactions, including payment processing and history tracking                                                   |
| Ticket Issuance                    | Issue and manage electronic flight tickets                                                                                    |

### Service Available

-   Authentications
    | Method | Function | Route | Default Route |
    |--|--|--|--|
    |POST| register | `/register` | http://localhost:2000/api/v1/auth/register |
    |POST| login | `/login` | http://localhost:2000/api/v1/auth/login |
    |GET| google login | `/google` | http://localhost:2000/api/v1/auth/google |
    |PUT| google login | `/resetPassword?token=` | http://localhost:2000/api/v1/auth/resetPassword?token= |
    |PUT| verified | `/verified?token=` | http://localhost:2000/api/v1/auth/verified?token= |
    |PATCH| update user login | `/me` | http://localhost:2000/api/v1/auth/me |
    |POST| forget password | `/forgetPassword` | http://localhost:2000/api/v1/auth/forgetPassword |
    |POST| resend OTP | `/resend-otp?token=` | http://localhost:2000/api/v1/auth/resend-otp?token= |
    |POST| resend SMS OTP | `/resendSMS-otp?token=` | http://localhost:2000/api/v1/auth/resendSMS-otp?token= |
    |GET| resend SMS OTP | `/me` | http://localhost:2000/api/v1/auth/me |
-   User
    | Method | Function | Route | Default Route |
    |--|--|--|--|
    |GET| get all id | `/` | http://localhost:2000/api/v1/users |
    |GET| get user by id | `/{id}` | http://localhost:2000/api/v1/users/{id} |
    |POST| create user | `/` | http://localhost:2000/api/v1/users |
    |PUT| update user | `/{id}` | http://localhost:2000/api/v1/auth/users/{id} |
    |DELETE| delete user | `/{id}` | http://localhost:2000/api/v1/users/{id} |
-   Airlines
    | Method | Function | Route | Default Route |
    |--|--|--|--|
    |GET| get all airlines | `/` | http://localhost:2000/api/v1/airlines |
    |GET| get airlines by id | `/{id}` | http://localhost:2000/api/v1/airlines/{id} |
    |POST| create airlines | `/` | http://localhost:2000/api/v1/airlines |
    |PUT| update airlines | `/{id}` | http://localhost:2000/api/v1/auth/airlines/{id} |
    |DELETE| delete airlines | `/{id}` | http://localhost:2000/api/v1/airlines/{id} |
-   Airports
    | Method | Function | Route | Default Route |
    |--|--|--|--|
    |GET| get all airports | `/` | http://localhost:2000/api/v1/airports |
    |GET| get airports by id | `/{id}` | http://localhost:2000/api/v1/airports/{id} |
    |POST| create airports | `/` | http://localhost:2000/api/v1/airports |
    |PUT| update airports | `/{id}` | http://localhost:2000/api/v1/auth/airports/{id} |
    |DELETE| delete airlines | `/{id}` | http://localhost:2000/api/v1/airports/{id} |
-   Transactions

    Transactions separated by two categories: users and admin

    -   Users
        | Method | Function | Route | Default Route |
        |--|--|--|--|
        |POST| bank | `/bank?flightId=` | http://localhost:2000/api/v1/transactions/bank?flightId= |
        |POST| gopay | `/gopay?flightId=` | http://localhost:2000/api/v1/transactions/gopay?flightId= |
        |POST| create transaction (snap) | `/payment?flightId=` | http://localhost:2000/api/v1/transactions/payment?flightId= |
        |POST| credit card | `/creditcard?flightId=` | http://localhost:2000/api/v1/auth/transactions/creditcard?flightId= |
        |GET| get transaction status | `/status/{statusId}` | http://localhost:2000/api/v1/transactions/status/{statusId} |
        |GET| get all transactions by user loggedIn | `/` | http://localhost:2000/api/v1/transactions |
    -   Admin
        | Method | Function | Route | Default Route |
        |--|--|--|--|
        |POST| get all transactions | `/admin` | http://localhost:2000/api/v1/transactions/admin |
        |POST| get transaction by id | `/transactions/{transactionId}` | http://localhost:2000/api/v1/transactions/{transactionId} |
        |PUT| update transaction (snap) | `/transactions/{transactionId}` | http://localhost:2000/api/v1/transactions/{transactionId} |
        |DELETE| delete transaction | `/transactions/{transactionId}` | http://localhost:2000/api/v1/auth/transactions/transactions/{transactionId} |
        |GET| delete transaction detail | `/transactionDetail/{transactionDetailId}` | http://localhost:2000/api/v1/transactions/transactionDetail/{transactionDetailId} |

-   Flights
    | Method | Function | Route | Default Route |
    |--|--|--|--|
    |GET| get all flights | `/` | http://localhost:2000/api/v1/flights |
    |GET| get flights by id | `/{id}` | http://localhost:2000/api/v1/flights/{id} |
    |GET| get all favorite destination | `/favorite-destination` | http://localhost:2000/api/v1/flights/favorite-destination |
    |POST| create flights | `/` | http://localhost:2000/api/v1/flights |
    |PUT| update flights | `/{id}` | http://localhost:2000/api/v1/auth/flights/{id} |
    |DELETE| delete flights | `/{id}` | http://localhost:2000/api/v1/flights/{id} |
-   FlightSeats
    | Method | Function | Route | Default Route |
    |--|--|--|--|
    |GET| get all flight seats | `/` | http://localhost:2000/api/v1/flightSeats |
    |GET| get seats by flight id | `/flight/{id}` | http://localhost:2000/api/v1/flightSeats/flight/{id} |
    |POST| create flight seats | `/` | http://localhost:2000/api/v1/flightSeats |
    |PUT| update flight seats | `/{id}` | http://localhost:2000/api/v1/auth/flightSeats/{id} |
    |DELETE| delete flight seats | `/{id}` | http://localhost:2000/api/v1/flightSeats/{id} |
-   Tickets
    | Method | Function | Route | Default Route |
    |--|--|--|--|
    |GET| get all tickets | `/` | http://localhost:2000/api/v1/tickets |
    |GET| get tickets by id | `/{id}` | http://localhost:2000/api/v1/tickets/flight/{id} |
    |POST| create tickets | `/` | http://localhost:2000/api/v1/tickets |
    |PUT| update tickets | `/{id}` | http://localhost:2000/api/v1/auth/tickets/{id} |
    |DELETE| delete tickets | `/{id}` | http://localhost:2000/api/v1/tickets/{id} |

---

# Entity Relationship Model

Our Team ERD:

<div align="center" width="100%">
    <img width="100%" height="100%" src="./public/assets/ERD_Final.png" alt="ERD Team C1" title="ERD Team C1"> 
</div>

---

# Instructions

### 1. Install Dependencies

In order to run this project, you need to install dependecies first:

```bash
npm run install
```

### 2. Insert credential to .env

Copy .env.example and rename it to .env, then give value to each of the variables according to your credential

### 3. Migrate and Seed the Database

Migrate the database by running this command:

```bash
npm run migrate
```

To seed:

```bash
npm run db-seed
```

For more run command, please check package.json.

### 4. Run the Project

Run the project in development:

```bash
npm run dev
```

Either way:

```bash
npm run start
```

> Development URL for this service is: http://localhost:2000/

---

# Data Team C1

|                   |                                                                                                                                             | **LinkedIn**                                                          | **Github**                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------- |
| **FSW**           | _Reinanda Faris_                                                                                                                            | [LinkedIn](https://www.linkedin.com/in/reinanda-faris/)               | [Github](https://github.com/Reinandafaris)    |
|                   | _Viery Nugroho_                                                                                                                             | [LinkedIn](https://www.linkedin.com/in/viery-nugroho)                 | [Github](https://github.com/vierynugroho)     |
|                   | _Andhika Rizky Aulia_                                                                                                                       | [LinkedIn](https://www.linkedin.com/in/andhika-rizky/)                | [Github](https://github.com/ndikrp)           |
|                   | _Ananda Ias Falah_                                                                                                                          | [LinkedIn](https://www.linkedin.com/in/falahsuryagemilang/)           | [Github](https://github.com/falahsg)          |
|                   | _Naufal Ady Saputro_                                                                                                                        | [LinkedId](https://www.linkedin.com/in/naufal-ady-saputro-71050b24b/) | [Github](https://github.com/naufaladysaputro) |
|                   | _Rizki Mauludin Yoga P._                                                                                                                    |                                                                       |                                               |
|                   | _Rafi Husein Bagaskara_                                                                                                                     | [LinkedId](https://www.linkedin.com/in/rafi-husein-257a76291)         | [Github](https://github.com/raisenbk)         |
|                   | _Lowis Armando Hutabarat_                                                                                                                   |                                                                       |                                               |
|                   |                                                                                                                                             |
| **AND**           | _Komang Yuda Saputra_                                                                                                                       |                                                                       |                                               |
|                   | _Ihsan Widagdo_                                                                                                                             |                                                                       |                                               |
|                   | _Mochammad Yusuf Pratama_                                                                                                                   |                                                                       |                                               |
|                   | _Bella Febriany Nawangsari_                                                                                                                 |                                                                       |                                               |
|                   |                                                                                                                                             |
| **Project Title** | _SKY-FLY_                                                                                                                                   |
|                   |                                                                                                                                             |
| **Note**          | _Binar KM6_                                                                                                                                 |
|                   | [Trello Team C1 Binar KM6](https://trello.com/c/2XzOhXim/60-c1-binar-km6-fsw-x-and)                                                         |
|                   | [Daily Stand-Up Team C1 Binar KM6](https://docs.google.com/spreadsheets/d/1aCpje7mQnG5uhmBOh9sEThQKYgatLdNpPoSoQK6VUvk/edit#gid=1785037003) |
|                   | [Deployed API](https://backend-skyfly-c1.vercel.app/api-docs/)                                                                              |

---

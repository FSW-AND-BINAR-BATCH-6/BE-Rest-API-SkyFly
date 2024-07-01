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
| Notification                       | Real-time notifications regarding cool transactions and promos                                                                |

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

|                   |                                                                                                                                             | **LinkedIn**                                                                 | **Github**                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------- |
| **FSW**           | _Reinanda Faris_                                                                                                                            | [LinkedIn](https://www.linkedin.com/in/reinanda-faris/)                      | [Github](https://github.com/Reinandafaris)    |
|                   | _Viery Nugroho_                                                                                                                             | [LinkedIn](https://www.linkedin.com/in/viery-nugroho)                        | [Github](https://github.com/vierynugroho)     |
|                   | _Andhika Rizky Aulia_                                                                                                                       | [LinkedIn](https://www.linkedin.com/in/andhika-rizky/)                       | [Github](https://github.com/ndikrp)           |
|                   | _Ananda Ias Falah_                                                                                                                          | [LinkedIn](https://www.linkedin.com/in/falahsuryagemilang/)                  | [Github](https://github.com/falahsg)          |
|                   | _Naufal Ady Saputro_                                                                                                                        | [LinkedIn](https://www.linkedin.com/in/naufal-ady-saputro-71050b24b/)        | [Github](https://github.com/naufaladysaputro) |
|                   | _Rizki Mauludin Yoga P._                                                                                                                    | [LinkedIn](https://www.linkedin.com/in/riski-mauludin-yoga-8718602b0/)       | [Github](https://github.com/RMYP)             |
|                   | _Rafi Husein Bagaskara_                                                                                                                     | [LinkedIn](https://www.linkedin.com/in/rafi-husein-257a76291)                | [Github](https://github.com/raisenbk)         |
|                   | _Lowis Armando Hutabarat_                                                                                                                   | [LinkedIn](www.linkedin.com/in/lowis-armando-hutabarat-80b7612b3)            | [Github](https://github.com/LowisHutabarat)   |
|                   |                                                                                                                                             |
| **AND**           | _Komang Yuda Saputra_                                                                                                                       | [LinkedIn](https://www.linkedin.com/in/komang-yuda-saputra-abb21b291/)       | [Github](https://github.com/YudaSaputraa)     |
|                   | _Ihsan Widagdo_                                                                                                                             | [LinkedIn](https://www.linkedin.com/in/ihsan-widagdo/)                       | [Github](https://github.com/dagdo03)          |
|                   | _Bella Febriany Nawangsari_                                                                                                                 | [LinkedIn](https://www.linkedin.com/in/bella-febriany-nawangsari-4642a3291/) | [Github](https://github.com/bellafebrianyn)   |
|                   | _Mochammad Yusuf Pratama_                                                                                                                   |                                                                              |                                               |
|                   |                                                                                                                                             |
| **Project Title** | _SKY-FLY_                                                                                                                                   |
|                   |                                                                                                                                             |
| **Note**          | _Binar KM6_                                                                                                                                 |
|                   | [Clickup Team C1 Binar KM6]([https://sharing.clickup.com/l/h/6-901802176957-1/d15d783c1111dbd](https://sharing.clickup.com/l/h/6-901802176957-1/d15d783c1111dbd))                                                         |
|                   | [Daily Stand-Up Team C1 Binar KM6](https://docs.google.com/spreadsheets/d/1aCpje7mQnG5uhmBOh9sEThQKYgatLdNpPoSoQK6VUvk/edit#gid=1785037003) |
|                   | [Deployed API](https://backend-skyfly-c1.vercel.app/api-docs/)                                                                              |

---

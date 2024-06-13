# Binar Final Project - Skyfly
<div align="center" width="100%">
    <img width="100%" height="100%" src="./public/assets/skyfly.jpeg" alt="Design Spread" title="Design Spread"> 
</div>
<br>

### Team C-1 Skyfly!

Skyfly API allows you to get the needed resources to make Skyfly application run seamlessly. Some of this service is using authentication to access each service. You need to login first to access the service.

### Overview
This project use ExpressJs as the framework and Postgres as the database using Prisma ORM. 

### Service Available
- Authentications
- User
- Airlines
- Airports
- Transactions
- Flights
- FlightSeats
- Tickets

--------------------
# Entity Relationship Model
Our Team ERD:

<div align="center" width="100%">
    <img width="100%" height="100%" src="./public/assets/ERD_Final.png" alt="ERD Team C1" title="ERD Team C1"> 
</div>

-------------------

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

-------------------

# Data Team C1

|                   |                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **FSW**           | _Reinanda Faris_                                                                                                                            |
|                   | _Viery Nugroho_                                                                                                                             |
|                   | _Andhika Rizky Aulia_                                                                                                                       |
|                   | _Ananda Ias Falah_                                                                                                                          |
|                   | _Naufal Ady Saputro_                                                                                                                        |
|                   | _Rizki Mauludin Yoga P._                                                                                                                    |
|                   | _Rafi Husein Bagaskara_                                                                                                                     |
|                   | _Lowis Armando Hutabarat_                                                                                                                   |
|                   |                                                                                                                                             |
| **AND**           | _Komang Yuda Saputra_                                                                                                                       |
|                   | _Ihsan Widagdo_                                                                                                                             |
|                   | _Mochammad Yusuf Pratama_                                                                                                                   |
|                   | _Bella Febriany Nawangsari_                                                                                                                 |
|                   |                                                                                                                                             |
| **Project Title** | _SKY-FLY_                                                                                                                                   |
|                   |                                                                                                                                             |
| **Note**          | _Binar KM6_                                                                                                                                 |
|                   | [Trello Team C1 Binar KM6](https://trello.com/c/2XzOhXim/60-c1-binar-km6-fsw-x-and)                                                         |
|                   | [Daily Stand-Up Team C1 Binar KM6](https://docs.google.com/spreadsheets/d/1aCpje7mQnG5uhmBOh9sEThQKYgatLdNpPoSoQK6VUvk/edit#gid=1785037003) |
|                   | [Deployed API](https://backend-skyfly-c1.vercel.app/api-docs/)                                                                              |

-------------------


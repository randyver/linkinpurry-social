# Tugas Besar IF3110 2024/2025

<a id="readme-top"></a>
<br />
<div align="center">
    <img src="frontend/public/logo-dark.png" alt="LinkinPurry Logo">
    <h3>LinkinPurry – Your Gateway to Collaboration and Connection</h3>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#api-documentation">API Documentation</a></li>
    <li><a href="#contributors">Contributors</a></li>
    <li><a href="#tasks-allocation">Tasks Allocation</a></li>
  </ol>
</details>

## About The Project

LinkinPurry is a platform crafted to foster meaningful connections and ignite creative collaboration. Inspired by Purry the Platypus and the challenges faced by the agents of O.W.C.A., LinkinPurry was born as a solution to enhance secure communication and teamwork among agents.

With features like personalized news feeds, seamless agent connections, and encrypted direct messaging, LinkinPurry provides a secure and efficient environment for agents to share updates, exchange ideas, and collaborate on missions.

Whether you're an agent looking to stay informed or connect with your peers, LinkinPurry is your ultimate tool for building networks and strengthening teamwork across the globe.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

To access this web locally on your device, there are some prerequisites and installation steps you need to follow.

### Prerequisites

1. Docker: Install Docker Desktop on your device
<br>Refer to Docker's official installation guide for your operating system.</br>

### Installation

1. Clone this repository
<br>Begin by cloning the project repository from GitHub:</br>
   ```sh
   git clone https://github.com/Labpro-21/if-3310-2024-2-k02-19.git
   ```
2. Launch Docker Desktop
<br>Ensure that Docker Desktop is installed and running on your machine.</br>
3. Establish connection to the database
<br>Use the following command to build and run the Docker containers, which include the application and database</br>
   ```sh
   docker-compose --env-file ./backend/.env up --build
   ```
4. Access the Application
<br>Once the Docker containers are running, open your web browser and navigate to:</br>
    ```sh
    localhost:5173
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## API Documentation

Access the comprehensive **LinkinPurry API Documentation** to explore all available endpoints and learn how to integrate seamlessly with our platform.

**Postman Documentation:**  
[View LinkinPurry API Documentation](https://documenter.getpostman.com/view/34429227/2sAYBbf9RK#973d7d91-a4e2-4845-9f77-5f13d5d77fe8)

Discover how to connect, collaborate, and build with LinkinPurry effortlessly!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributors

<table style="border-collapse: collapse; width: 100%;">
  <tr>
    <td style="text-align: center;">
      <img src="frontend/public/salsa-pic.png" alt="Salsabiila's Picture" width="150" height="150" style="border-radius: 50%;">
      <p>Salsabiila</p>
      <p>13522062</p>
    </td>
    <td style="text-align: center;">
      <img src="frontend/public/randy-pic.png" alt="Randy Verdian's Picture" width="150" height="150" style="border-radius: 50%;">
      <p>Randy Verdian</p>
      <p>13522067</p>
    </td>
    <td style="text-align: center;">
      <img src="frontend/public/juan-pic.png" alt="Juan Alfred Widjaya's Picture" width="150" height="150" style="border-radius: 50%;">
      <p>Juan Alfred Widjaya</p>
      <p>13522073</p>
    </td>
  </tr>
</table>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Tasks Allocation
1. **Server-side**  
   - Login: 13522067  
   - Register: 13522067
   - Daftar Pengguna: 13522062
   - Permintaan Koneksi: 13522073
   - Daftar Koneksi: 13522073
   - Profil: 13522073
   - Halaman Feed: 13522067
   - Tambah Feed: 13522067
   - Edit Feed: 13522067
   - Private Chat: 13522073
   - Riwayat Chat: 13522073, 13522062
   - Notifikasi Chat: 13522073, 13522062

2. **Client-side**
   - Login: 13522067  
   - Register: 13522067  
   - Navbar: 13522062  
   - Footer: 13522062  
   - About: 13522062
   - Landing: 13522067
   - Daftar Pengguna: 13522062
   - Permintaan Koneksi: 13522062
   - Daftar Koneksi: 13522062
   - Profil: 13522062
   - Halaman Feed: 13522067
   - Tambah Feed: 13522067
   - Edit Feed: 13522067
   - Private Chat: 13522073
   - Not Found Page: 13522067

<p align="right">(<a href="#readme-top">back to top</a>)</p>

# GLG - Software Support Engineer Interview Project
> Order Processing System

## Overview

This project is a rudimentary order processing system that accepts orders via a REST API (with Express, documented using Swagger) 
and processes them through a series of queues (using ElasticMQ behind an SQS Client). Data in this project is stored in DynamoDB.
All components of this project are containerized using Docker and orchestrated using Docker Compose and run entirely on your local machine.


The system generates an order, processes it to create a PDF receipt, and sends the receipt via email to the customer. The system is designed with message 
queues to handle jobs asynchronously and decouple different parts of the processing flow.

### Features
    - Order Creation: Accept customer orders via a REST API.
    - Queue-Based Processing:
    - Intake Queue: Pushes order data into a queue for order generation and processing.
    - Processor Queue: Processes the order, generates a PDF receipt, and emails the receipt to the customer.
    - Email Notification: Sends a confirmation email with a PDF receipt to the customer after the order is processed.

### Architecture

    Order Submission:
        The customer submits an order through the REST API.
        The system pushes the order data into the Intake Queue.

    Order Processing:
        A worker listens to the Intake Queue and processes the incoming order.
        The order is transformed into a detailed data structure and pushed into the Processor Queue.

    Receipt Generation:
        A worker listens to the Processor Queue, retrieves the order data, and generates a PDF receipt. 
        The receipt is then sent to the customer via email as an attachment.

## Prerequisites
- Docker & Docker Compose

## Project Structure
- `bin/setup.sh`: Script to set up the project.
- `bin/run.sh`: Script to start the Docker containers.
- `bin/rebuild.sh`: Script to rebuild the Docker containers.


- `etc/dev.env`: Environment variables for the development environment.
- `pipeline/src/index.ts`: Main entry point for the pipeline application.
- `app/src/server.ts`: Main entry point for the REST API application.

## Setup

### 0. Prerequisites
Install Docker and Docker Compose on your machine, if you haven't already. If you are using a Windows machine, you may
need to install WSL2 to run Docker Desktop or update your BIOS settings to enable virtualization.

If prompted to enable file sharing in Windows, please accept the prompt.

Windows: https://docs.docker.com/desktop/install/windows-install/

Mac: https://docs.docker.com/desktop/install/mac-install/

### 1. Fork/Clone the Repository
```sh
git clone git@github.com:your-github/glg-assignment.git
cd glg-assignment
```

### 2. Setup the Project

ElasticMQ is pinned to `softwaremill/elasticmq:1.6.16`, verified with the provided
`elasticmq.conf` to initialize all four queues and serve the legacy dashboard on
port 9325. The original unpinned image resolved to 1.7.1, whose entrypoint did not
apply this Compose file's config argument; queues were absent and port 9325 was
unavailable. The pin preserves the expected local environment without changing
application logic. See the [upstream releases](https://github.com/softwaremill/elasticmq/releases).

```sh
./bin/setup.sh
```

### 3. Start Docker Containers
```sh
./bin/run.sh
```

## URLs
- REST API: http://localhost:9000
- Local Mail Server (Mailhog): http://localhost:1080
- ElasticMQ (Debug): http://localhost:9325

## Tasks
Please complete the exercises found in [TASKS.md](TASKS.md).

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

ElasticMQ is pinned to `softwaremill/elasticmq:1.6.16` for compatibility with
the provided queue configuration and dashboard. See the
[compatibility note](docs/elasticmq-compatibility.md) for the reasoning and
alternative considered.

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

## Order support console

Open http://localhost:9000 with the local stack running to create synthetic orders,
browse a limited set, find an exact order ID/reference, inspect details, and cancel
an eligible order. Use **Fill sample data** for a fresh reference and **Refresh**
to check asynchronous processing; the page does not poll. Cancellation retains the
record. Verify emails and receipt attachments in MailHog. Swagger remains at
http://localhost:9000/docs/.

The orders table pages through the loaded set of up to 50 orders. Choose 10, 25,
or 50 rows per page and use Previous/Next; exact lookup can find orders outside
that loaded set. Changing the page size returns to the first page.

See the [console design note](docs/order-support-console.md) for its purpose,
UX choices, JavaScript/TypeScript tradeoff, and verification guidance.

## Tasks
Please complete the exercises found in [TASKS.md](TASKS.md).

See [Task 3: receipt total](docs/task-3-receipt-total.md) for the fix,
verification instructions, and deferred alternatives.

See [Task 4: order cancellation](docs/task-4-order-cancellation.md) for the
DELETE request, cancellation behavior, and delivery limitations.

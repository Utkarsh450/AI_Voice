# Day 1 Notes - FastAPI + PostgreSQL + Prisma ORM

---

# Goal of Today

Before building AI, we need a foundation.

Eventually our flow will be:

Customer Phone
↓
Twilio
↓
FastAPI Backend
↓
PostgreSQL
↓
AI Services

But today our only goal is:

FastAPI
↓
PostgreSQL
↓
Prisma ORM
↓
Database Models

No AI yet.

No LangGraph yet.

No RAG yet.

No Twilio yet.

---

# Why Do We Need PostgreSQL?

A call center generates data.

Example:

Customer calls.

We need to store:

- Who called?
- When did they call?
- What did they say?
- What did AI answer?
- Which documents were used?
- What was the final summary?

This information cannot stay in memory.

If server restarts, everything would be lost.

Therefore we need a database.

We chose:

PostgreSQL

because:

- Production ready
- Relational database
- Excellent support with Python
- Good for analytics and reporting
- Widely used in industry

---

# What Is ORM?

ORM = Object Relational Mapper

Without ORM:

Python
↓
Write SQL manually
↓
PostgreSQL

Example:

INSERT INTO sessions (...)

This becomes difficult in large applications.

With ORM:

Python Objects
↓
ORM
↓
SQL Queries
↓
PostgreSQL

ORM generates SQL automatically.

We work with objects instead of writing raw SQL.

---

# Why Prisma?

Normally FastAPI projects use:

FastAPI
↓
SQLAlchemy
↓
PostgreSQL

But our senior specifically asked us to use:

FastAPI
↓
Prisma Client Python
↓
PostgreSQL

Reasons:

1. Cleaner syntax
2. Type safety
3. Schema-driven development
4. Easy relationship management
5. Less boilerplate code

---

# Installing Prisma

Command:

pip install prisma

What happened?

This installed:

Prisma Client Python

It allows Python code to communicate with:

PostgreSQL
MySQL
SQLite

through Prisma.

---

# Why Did We Run?

prisma init

Purpose:

Create Prisma project structure.

It usually creates:

backend/
│
├── prisma/
│ └── schema.prisma
│
└── .env

---

# What Is .env?

.env stores secrets and configuration.

Example:

DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_call_center"

Breaking it:

postgresql://
↓
Database type

postgres
↓
Database user

password
↓
Database password

localhost
↓
Database server

5432
↓
Database port

ai_call_center
↓
Database name

Prisma reads this file to know where our database exists.

---

# What Is schema.prisma?

This is the heart of Prisma.

Think of it as:

Blueprint of Database

We describe:

- Which database are we using?
- Which ORM client are we generating?
- Which tables exist?
- What relationships exist?

Everything starts from this file.

---

# Datasource Block

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

Meaning:

Database Name:
db

Database Type:
postgresql

Database URL:
Read from .env

Flow:

schema.prisma
↓
DATABASE_URL
↓
PostgreSQL Connection

---

# Generator Block

generator client {
provider = "prisma-client-py"
}

Meaning:

Generate:

Python Prisma Client

This client allows us to write:

await db.session.create(...)

instead of:

INSERT INTO ...

---

# What Are Models?

A model represents a database table.

Think:

Class
↓
Table

Object
↓
Row

Fields
↓
Columns

Example:

model User {
id Int
name String
}

becomes:

Table: User

id | name

---

# Session Model

Session means:

One phone call.

Example:

Customer:
+919876543210

Call SID:
CA12345

This entire phone call is:

One Session

Model:

## Session

id
callSid
callerNumber
status
persona
startedAt
endedAt

Meaning:

id
→ Primary key

callSid
→ Unique identifier from Twilio

callerNumber
→ Customer phone number

status
→ active, completed, failed

persona
→ customer_support, sales, technical

startedAt
→ Call start time

endedAt
→ Call end time

One row = One phone call.

---

# Message Model

One session contains many messages.

Example:

Customer:
Hello

AI:
Hi

Customer:
Internet is not working

AI:
Can you restart your router?

Every sentence becomes one message.

## Message

id
speaker
content
timestamp
sessionId

speaker
→ customer or ai

content
→ actual message

timestamp
→ when message happened

sessionId
→ which call this message belongs to

Relationship:

Session
↓
Many Messages

One-to-Many Relationship

---

# Summary Model

Created after call ends.

Example:

Issue:
Internet not working

Resolution:
Suggested router restart

Action:
Create ticket

## Summary

id
summary
actionItems
sessionId

Relationship:

Session
↓
One Summary

One-to-One Relationship

---

# Document Model

Used later for RAG.

Example:

RefundPolicy.pdf
BillingPolicy.pdf
FAQ.pdf

## Document

id
name
path
uploadedAt

This stores metadata.

Actual PDF files will be stored separately.

---

# Relationships

Session
↓
Messages (Many)

Session
↓
Summary (One)

Later:

Session
↓
Analytics

Session
↓
Recordings

Document
↓
Embeddings
↓
Vector Database

---

# What Does prisma generate Do?

Command:

prisma generate

Flow:

schema.prisma
↓
Read Models
↓
Generate Python Client

Now Python can do:

Create Session
Find Session
Update Session
Delete Session

without writing SQL.

---

# What Does prisma db push Do?

Command:

prisma db push

Flow:

schema.prisma
↓
Read Models
↓
Compare Database
↓
Create Tables
↓
Apply Changes

This synchronizes:

schema.prisma
and
PostgreSQL

After running:

Session model
↓
sessions table

Message model
↓
messages table

Summary model
↓
summaries table

Document model
↓
documents table

---

# Current State of Project

Completed:

PostgreSQL Installed
Database Created
Prisma Installed
Prisma Schema Setup Started

Next Step:

Define Models
↓
Generate Prisma Client
↓
Push Schema To Database
↓
Connect FastAPI To Prisma
↓
Create Session APIs

Only after this foundation is stable will we move to:

Twilio
↓
Whisper
↓
LangGraph
↓
RAG
↓
TTS

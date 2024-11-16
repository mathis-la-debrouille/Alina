
# **Backend API Documentation**

## **Overview**
The backend provides API routes for user management, AI interactions, MQTT communication, and audio handling. It integrates with OpenAI's ChatGPT, ElevenLabs for voice generation, Google Cloud for audio transcription, and MQTT for device communication.

---

## **Authentication**

### **JWT Authentication**
- Each user receives a JWT upon signup or login.
- JWT is required for authenticated routes and should be included in the `Authorization` header as a Bearer token.

---

## **Base URL**
- Development: `http://localhost:3300`
- Production: `https://alina.massiveusage.com/api`

---

## **Endpoints**

### **1. User Management**

#### **POST /signup**
Create a new user.

**Request Body**:
```json
{
  "firstname": "John",
  "email": "john.doe@example.com",
  "password": "password123",
  "alina_id": 101
}
```

**Response**:
- **200 OK**:
```json
{
  "message": "User created successfully",
  "token": "jwt_token",
  "user": {
    "id": 1,
    "firstname": "John",
    "email": "john.doe@example.com",
    "role": "simple"
  }
}
```
- **400 Bad Request**: Missing required fields.
- **409 Conflict**: Email already exists.

---

#### **POST /login**
Authenticate a user.

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response**:
- **200 OK**:
```json
{
  "token": "jwt_token",
  "id": 1
}
```
- **401 Unauthorized**: Invalid credentials.

---

#### **GET /users** (Admin Only)
Fetch a list of all users.

**Headers**:
```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Response**:
- **200 OK**:
```json
[
  {
    "id": 1,
    "firstname": "John",
    "email": "john.doe@example.com",
    "role": "simple",
    "alina_id": 101
  }
]
```
- **403 Forbidden**: Access denied.

---

#### **GET /user/:userId**
Fetch a user's details by ID.

**Headers**:
```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Response**:
- **200 OK**:
```json
{
  "id": 1,
  "firstname": "John",
  "email": "john.doe@example.com",
  "role": "simple",
  "alina_id": 101,
  "alina_config": {
    "accent": "french",
    "gender": "female",
    "age": "young"
  }
}
```
- **403 Forbidden**: Access denied for non-admins accessing other users.

---

#### **PUT /user/update**
Update the logged-in user's details.

**Headers**:
```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Request Body**:
```json
{
  "email": "new.email@example.com",
  "password": "newpassword123",
  "alina_id": 102,
  "alina_config": {
    "accent": "spanish",
    "gender": "male",
    "age": "old"
  }
}
```

**Response**:
- **200 OK**: `{ "message": "Account updated successfully" }`
- **404 Not Found**: User not found.

---

#### **DELETE /users/:id** (Admin Only)
Delete a user by ID.

**Headers**:
```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Response**:
- **200 OK**: `{ "message": "User deleted successfully" }`
- **404 Not Found**: User not found.

---

### **2. AI and Audio Interaction**

#### **POST /ask**
Send a prompt to ChatGPT and optionally generate an audio response.

**Headers**:
```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Request Body**:
```json
{
  "prompt": "What is AI?",
  "withVocalAnswer": true
}
```

**Response**:
- **200 OK**:
```json
{
  "question": "What is AI?",
  "answer": "AI stands for Artificial Intelligence...",
  "audio_response_s3_url": "https://s3.amazonaws.com/bucket/generated-voices/123.mp3"
}
```
- **500 Internal Server Error**: Error during ChatGPT or audio generation.

---

#### **POST /listen**
Transcribe an uploaded audio file.

**Headers**:
```json
{
  "Authorization": "Bearer jwt_token",
  "Content-Type": "multipart/form-data"
}
```

**Request Body**:
- A `.wav` audio file.

**Response**:
- **200 OK**:
```json
{
  "text": "Hello world!"
}
```
- **400 Bad Request**: Unsupported file type.

---

#### **POST /flow**
End-to-end flow: Transcribe audio → Send to ChatGPT → Generate vocal response.

**Headers**:
```json
{
  "Authorization": "Bearer jwt_token",
  "Content-Type": "multipart/form-data"
}
```

**Request Body**:
- A `.wav` audio file.

**Response**:
- **200 OK**:
```json
{
  "text": "Hello world!",
  "gptResponse": "AI stands for Artificial Intelligence...",
  "vocalResponse": {
    "message": "File uploaded successfully",
    "fileUrl": "https://s3.amazonaws.com/bucket/generated-voices/123.mp3"
  }
}
```

---

### **3. MQTT Communication**

#### **Topic: esp32/newClient**
New client registration via MQTT.

**Payload**:
```json
{
  "firstname": "ESP Device",
  "email": "esp32@example.com",
  "password": "securepassword",
  "alina_id": 102
}
```

**Action**:
- Creates a new user in the database using the provided details.

---

#### **Topic: {clientId}/audio_send**
Receive audio from an ESP device.

**Payload**:
- A Base64 encoded audio string.

**Action**:
- Transcribes the audio, sends the transcription to ChatGPT, generates a vocal response, and saves the data as an "ask" in the database.

---

#### **Topic: {clientId}/audio_receive**
Send audio to an ESP device.

**Payload**:
```json
{
  "audioUrl": "https://s3.amazonaws.com/bucket/generated-voices/123.mp3"
}
```

---

## **Database Structure**

### **Users Table**
| Column         | Type      | Description                                 |
|----------------|-----------|---------------------------------------------|
| id             | INTEGER   | Primary Key                                |
| firstname      | TEXT      | User's first name                          |
| email          | TEXT      | Unique user email                          |
| password       | TEXT      | Hashed password                            |
| alina_id       | INTEGER   | Unique ID for Alina configuration          |
| role           | TEXT      | User role (`admin` or `simple`)            |
| alina_config   | TEXT      | JSON string with accent, gender, and age   |

---

### **Asks Table**
| Column                  | Type      | Description                     |
|-------------------------|-----------|---------------------------------|
| id                      | INTEGER   | Primary Key                    |
| user_id                 | INTEGER   | Foreign Key to `users.id`      |
| question                | TEXT      | Prompt sent to ChatGPT         |
| answer                  | TEXT      | GPT response                   |
| audio_response_s3_url   | TEXT      | S3 URL of generated audio      |
| ask_date                | TEXT      | Timestamp of the interaction   |

---

## **MQTT Configuration**

- **Broker**: Mosquitto on port `8883` (MQTTS).
- **TLS**: Requires `ca.crt`, `server.crt`, and `server.key`.
- **Authentication**: None (for now).

---

## **Error Handling**

### **General Errors**
- **400**: Bad request (e.g., missing required fields).
- **401**: Unauthorized (e.g., invalid credentials).
- **403**: Forbidden (e.g., access denied).
- **404**: Not found (e.g., user or resource not found).
- **500**: Internal server error.

---


# AI Assistant for Clinic Appointments

## Information
This repository showcases basic appointment management functionailties through voice call assistance with the help of simple APIs. It uses `Twilio` for voice call functionailties, `Google Dialogflow` for processing and detecting user's intent and the `compromise` library for natural language processing to facilitate appointment management through user's speech.

## Prerequisites
 1. Create a Google Dialogflow app, a service account to access it and save the credential file within the project's root directory. **Important**: Make sure it is not commited with the repo, so, add it in the .gitignore file locally if you want.

 2. Create a Twilio account and have the SID, Authtoken and Business Number value placed in .env file as per the instructions below

 3. Have the env file placed in the project directory of your machine with the following details:
| Parameter | Description                |Example                |
| :-------- | :------------------------- | :------------------------- |
| `PORT` | Port for running the server | 3000
| `MONGODB_URI` | MongoDB Connection URI | mongodb://localhost/walnut
| `TWILIO_SID` | SID of your Twilio account | ABSC123
| `TWILIO_TOKEN` | Access Token of your Twilio account | eqwsab
| `TWILIO_NUMBER` | Business number available in your Twilio account | +19282321870
| `DIALOGFLOW_PROJECT_ID` | Project ID of your Dialogflow project| dialogflow_project_id
| `GOOGLE_APPLICATION_CREDENTIALS` | Dialogflow service account credential JSON file | file

## Design
To gain an overview of the application's workings, explore the visualization on Whimsical: [View Whimsical Visualization](https://whimsical.com/walnut-voice-assists-app-9T9gbrvD3DfXyR4FRZ5LNe)

## Local Dev Server
To run the backend server:
```bash
$npm install
$npm start
```

## API Documentation

### Doctor APIs
Used by doctors to manage appointment slots

#### Create an appointment slot
- Used to create an appointment slot
```http
POST /appointments
```
Request Schema
| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `doctorName` | `string` | **Required**. Name of the doctor |
| `appointmentTime` | `string` | **Required**. Date of the appointment slot in string |

Response Schema
| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `message` | `string` | Successfull API execution message |
| `appointment` | `object` | Object containing details of the appointment slot |
| `appointment.doctorName` | `string` | Date of the appointment slot in string |
| `appointment.status` | `string` | Status of the appointment which in this case will be `available` |
| `appointment.appointmentTime` | `string` | Date of the appointment slot in string |
| `appointment._id` | `string` | Id of the appointment slot |

#### Read all Appointment slots
- Used to Read all appointment slots
```http
GET /appointments/all
```
Request Schema
| Query Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `status` | `string` | If provided then the results will be filtered for appointments matching the status |

Response Schema
| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `appointments` | `array` | An array of objects containing details of all slots (`available` or `scheduled` depending on query parameter) |
| `appointments._id` | `string` | Id of the appointment slot |
| `appointments.status` | `string` | Status of the appointment (`available` or `scheduled` depending on query parameter) |
| `appointments.appointmentTime` | `string` | Date of the appointment slot in string |

#### Read an Appointment slot
- Used to Read a single appointment slot

```http
GET /appointments/:id
```
Request Schema
| Path Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. Id of the appointment |

Response Schema
| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `appointment` | `object` | Object containing details of the appointment slot |
| `appointment._id` | `string` | Id of the appointment slot |
| `appointment.doctorName` | `string` | Date of the appointment slot in string |
| `appointment.appointmentTime` | `string` | Date of the appointment slot in string |
| `appointment.status` | `string` | Status of the appointment |

#### Update an Appointment slot
- Used to edit/reschedule an appointment slot
```http
PATCH /appointments/:id
```
Request Schema
| Path Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. Id of the appointment |

| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `appointmentTime` | `string` | **Required**. Date of the appointment slot in string |

Response Schema
| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `message` | `string` | Successfull API execution message |
| `appointment` | `object` | Object containing details of the appointment slot |
| `appointment._id` | `string` | Id of the appointment slot |
| `appointment.doctorName` | `string` | Date of the appointment slot in string |
| `appointment.appointmentTime` | `string` | Changed date of the appointment slot in string |
| `appointment.status` | `string` | Status of the appointment |

#### Delete an Appointment slot
- Used to delete an appointment slot
```http
DELETE /appointments/:id
```
Request Schema
| Path Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `id` | `string` | **Required**. Id of the appointment |

Response Schema
| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `message` | `string` | Successfull API execution message |
| `appointment` | `object` | Object containing details of the appointment slot |
| `appointment._id` | `string` | Id of the appointment slot |
| `appointment.doctorName` | `string` | Date of the appointment slot in string |
| `appointment.appointmentTime` | `string` | Date of the appointment slot in string |
| `appointment.status` | `string` | Status of the appointment |

### End User Voice call APIs 
These APIs are used for Twilio routing and call management whenever an end user calls the business number. Note: Twilio only allows POST and GET methods for APIs.

#### Handle Incoming Call
- A webhook which is invoked by Twilio whenever an end user calls the business number
```http
POST /voicecalls
```

#### Handle Incoming Call
- This API is used to let the end user know about the various appointment management operations possible by the AI Assistant
```http
POST /voicecalls/menu
```

#### Handle User Query
- This API is used to accept user input through speech, process it for detecting intent of the user and proceed to the desired appointment management operation.
```http
POST /voicecalls/query
```

#### Schedule Appointment for the End User
- This API is used to schedule the appointment for the end user based on their speech input
```http
POST /appointments/schedule
```

#### Reschedule Appointment for the End User
- This API is used to reschedule an appointment for the end user based on their speech input
```http
POST /appointments/schedule/reschedule
```

#### Cancel Appointment for the End User
- This API is used to cancel the appointment for the end user based on their speech input
```http
POST /appointments/schedule/cancel
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.
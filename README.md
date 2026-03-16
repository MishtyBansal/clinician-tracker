# clinician-tracker

Monitoring Clinician Safety

This is a system to monitor, in realtime, a clinician's location to make sure they are safe. "Safety" is defined by monitoring a a clinician's location and confirming they are in predefined "safe zones". If, at some point, the clinician leaves their safety zones, this system will alert by sending an email to the supervisor (or whatever email is provided). The API leveraged in this system tracks clinicians & defines safety zones using geojson objects.

---

# Tech Stack

- Language: Javascript
- Backend Framework: NodeJS
- Testing: Jest
- Other:
  - Turf.js: NPM package to handle the geojsons (& the polygons for the safety zones)
  - SendGrid: Tool used to send emails

---

# Setup Instructions

## Installation

Run `npm i` to install all the dependencies from the package.json

## Environment Variables

Create a `sendgrid.env` file that contains the development SendGrid API key

---

# Running Instructions

To start the program, run the following command

```
npm run start
```

---

# Testing

To run the tests, please run

```
npm test
```

---

# Design

## Current Design

The current logic flows as follows

1. `triggerClinicianMonitoring` leverages setTimeout to stop running the program after an hour & setInterval will check all clinicans every 1 minute
2. Pull all the location data for all clinicians we want to monitor (ie. 1 through 6)
3. For the clinicians that have valid geojson objects, check the clinician's location against all their safety zones. If any clinician is out of the zone, send an email (some edge cases discussed in the design decisions below)
4. For any clinicians we failed to get a valid geojson object, we will send an email notifying the supervisor that there was an issue with the API. The next interval should check again and confirm if we are able to get a status or not.

## Design Decisions

### Polygon checking

There were two approaches I was evaluating:

1. Leveraging an existing npm package to check if a point is in a polygon (or multiple polygons)
2. Using a custom approach to determine if a point is in a polygon (using the ray casting algorithm)

I initially attempted to come up with my own custom function to determine if a point is in a polygon, however, I quickly realized that this would be difficult to maintain as there are many edge cases (especially since a clinician can be in multiple safety zones). I instead, decided to leverage a npm package as that is a reliable, maintained package that deals with geojsons & points in polygons. I decided to use turf.js specifically as it seemed to have a high weekly download rate.

### Monitoring frequency

I decided to poll the API every 60 seconds. Though the instructions mentioned an upper bound of 5 minutes, I felt it would be too slow to capture any quick changes to the clinician's location so I selected 60 seconds. This is frequent enough to capture quick changes to location but also ensure we remain below the required API rate limit.

### Email Alerts

The prompt requirement was to send an email whenever the clinician went outside their safety zones. There were a few cases I ran into while testing and added the following behavior as this made sense to me (if I was a supervisor monitoring the clinicians)

- If the clinician is continuously outside their safety zone, I decided to not spam sending an email and only send repeat "outside of zone" emails if the clinician is out of their zone for 5 minutes
- If the API returns an invalid response, we send an email notifying the supervisor that the API failed to retrieve a status
- If the clinician was previously out of their zone and came back into the zone, I send an email notifying the clinician came back into the zone

The way this behavior is tracked is through a global outOfBoundsState tracker & errorState that will track the clinicians previous state.

---

# Future Improvements

- Add a way for users to specify specific parameters to run the script with e.g. different number of clinicians, different polling interval, etc
- Add more emails/types of notifications (e.g. sms sending)
- Improve error handling in the future with retry sending (in the situation an email fails to send)
- There is a possibility that the API takes longer than 60 seconds to run: if this occurs, then there could be multiple states running simultaneously, which could hammer the API. I would take this situation into account.

---

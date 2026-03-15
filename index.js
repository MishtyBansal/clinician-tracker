import { triggerClinicianMonitoring } from "./triggerClinicianMonitoring.js";

// IDs of the clinicians we want to monitor
const CLINICIANS_IDS_TO_MONITOR = [1, 2, 3, 4, 5, 6];

// this is in milliseconds (equivalent to 60 seconds)
const TIME_MONITOR_INTERVAL = 1000 * 60;
// this is in milliseconds (equivalent to 1 hour)
const TIME_MONITOR_LIMIT = 1000 * 60 * 60;
setInterval(() => {
  triggerClinicianMonitoring(CLINICIANS_IDS_TO_MONITOR);
}, TIME_MONITOR_INTERVAL);

setTimeout(() => {
  clearInterval([]);
  console.log("program has run for exactly 1 hour");
  process.exit(0);
}, TIME_MONITOR_LIMIT);

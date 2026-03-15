import { driver } from "./driver.js";

driver();

setInterval(driver, 60000);

setTimeout(() => {
  clearInterval();
  console.log("program has run for exactly 1 hour");
  process.exit(0);
}, 3600000);

import { exit } from "node:process"
import { Cron } from 'croner';

const secret = process.env.CRON_SECRET;
const schedule = process.env.SCHEDULE;
const endpoint = process.env.ENDPOINT_URL;
console.log("Starting...")
console.log("ENV: ", secret)
console.log("SCHEDULE: ", schedule)
console.log("Endpoint: ", endpoint)
if(!secret) {
  console.error("CRON_SECRET could not be read. Make sure you have a file called '.env.local' in the parent folder ('../.env.local') which contains a value for CRON_SECRET.")
  exit(1)
}
if(!schedule) {
  console.error("SCHEDULE could not be read. Make sure you set the local env variable called SCHEDULE to a valid cron schedule.")
  exit(1)
}
if(!endpoint) {
  console.error("ENDPOINT_URL could not be read. Make sure you set the local env variable called ENDPOINT_URL to the endpoint you want to call.")
  exit(1);
}

const job = Cron(schedule, {
  timezone: 'UTC'  // Set time zone to UTC to be consistent with backend/vercel
}, () => {
  console.log('Reset guess successfully.');
  fetch(endpoint, {
    headers: {Authorization: `Bearer ${secret}`},
    method: "GET"
  })
     .then((res) => {
      if(res.status === 200) {
        console.info("Successfully set next guess.")
      } else {
        console.error("Error while trying to set next guess.")
      }
     }).catch(() => {
      console.error("Error while trying to set next guess.")
     })
});

import { exit } from "node:process"
import { Cron } from 'croner';

const secret = process.env.CRON_SECRET
const schedule = process.env.SCHEDULE
if(!secret) {
  console.error("CRON_SECRET could not be read. Make sure you have a file called '.env.local' in the parent folder ('../.env.local') which contains a value for CRON_SECRET.")
  exit(1)
}
if(!schedule) {
  console.error("SCHEDULKE could not be read. Make sure you set the local env variable called SCHEDULE to a valid cron schedule")
  exit(1)
}

console.log("ENV: ", secret)
console.log("SCHEDULE: ", schedule)

const job = Cron("59 10 * * *", {
  timezone: 'UTC'  // Set time zone to UTC to be consistent with backend/vercel
}, () => {
  console.log('Running cron');
});

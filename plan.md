* [x] accounts created
* [x] storage bucket created
* [x] email setup
  * create labels
  * create filter
  * confirm filter applies
* [x] grant storage object creator to games acct
* [x] Configure OAuth Login Page
* [x] link script
* [x] services and scopes
* [x] trigger
* [x] auth prompt
* [x] revoke editor from games account
* [x] fix error that GMail API has not been used in the project
  * enabled GMail API in the project
* [x] validate emails are in bucket
* [ ] update AppsScript to only process emails from authorized users
  * [ ] hard coded list
  * [ ] read from accounts
  * [ ] max number of emails by an account per day
  * [ ] test to confirm it works
* [ ] work on cloud function
  * [ ] fn to parse email and put in datastore - need to test locally, then as a function
    * [ ] not connecting - run more tests
      * [ ] connect and add data w curl
      * [ ] in node.js confirm ADC details
      * [ ] create simple node.js that just connects and adds data. use JSON key if needed
  * [ ] fn to iterate over all emails
* [ ] create gui
  * [ ] register
  * [ ] authenticate
  * [ ] see stats
* [x] create firestore databases
* [ ] firestore IAM
  * [ ] mrp
  * [ ] test SA
  * [ ] prod SA
* [ ] firestore rules
* [ ] reduce storage bucket lifetime
* [ ] delete emails that have been flagged as "done" for over N days
* [ ] delete emails that generate an alert
* [ ] threat model

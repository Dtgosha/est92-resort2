Est92 Resort MVP - Ready-to-run ZIP

Files included:
- index.html       (home page)
- booking.html     (booking / reservation form)
- admin.html       (admin login)
- dashboard.html   (admin dashboard)
- styles.css       (styles)
- script.js        (client-side logic - bookings, admin)
- images/          (sample images for rooms, restaurant, conference)

How to run:
1. Unzip the folder and open index.html in a modern browser (Chrome/Firefox).
2. Bookings are stored locally in your browser's localStorage under the key 'est92_bookings'.
3. Admin accounts (username / password):
   - Denzel / 12345
   - Dellon Gosha / 12345
   - Charles Gosha / 12345

Email notifications:
- The booking form includes client-side code that will attempt to send an email via EmailJS.
- To enable email notifications, sign up at https://www.emailjs.com/, create a service and template, then replace the placeholders in script.js:
   emailjs.send('YOUR_SERVICE_ID','YOUR_TEMPLATE_ID', payload)
- Also add the EmailJS SDK script tag in booking.html if you want it to send automatically:
   <script type="text/javascript" src="https://cdn.emailjs.com/sdk/3.2.0/email.min.js"></script>
   and initialize with emailjs.init('YOUR_USER_ID');

Notes & next steps:
- This is an MVP using localStorage. For production you'll want a backend (Node.js + DB) and SMS integration (Twilio).
- If you want me to change the default admin passwords, enable email sending, or add SMS, tell me and I will update the ZIP.

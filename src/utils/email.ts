import nodemailer from 'nodemailer';
import { IServiceBooking } from '../models/ServiceBooking';

const transporter = nodemailer.createTransport({
  // Configure your email service
});

export const sendServiceBookingEmail = async (booking: IServiceBooking) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Service Booking',
    html: `
      <h2>New Service Booking Request</h2>
      <p><strong>Customer:</strong> ${booking.contactDetails.name}</p>
      <p><strong>Phone:</strong> ${booking.contactDetails.phone}</p>
      <p><strong>Email:</strong> ${booking.contactDetails.email}</p>
      <p><strong>Address:</strong> ${booking.contactDetails.address}</p>
      <p><strong>Scheduled Date:</strong> ${booking.scheduledDate}</p>
      <p><strong>Time Slot:</strong> ${booking.scheduledTimeSlot}</p>
      <p><strong>Requires Estimate:</strong> ${booking.requiresEstimate ? 'Yes' : 'No'}</p>
      <p><strong>Notes:</strong> ${booking.notes || 'N/A'}</p>
    `
  };

  await transporter.sendMail(mailOptions);
}; 
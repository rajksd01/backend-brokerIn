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
      <p><strong>Booking ID:</strong> ${booking.service_booking_id}</p>
      <p><strong>Service Type:</strong> ${booking.service_type}</p>
      <p><strong>Customer:</strong> ${booking.name}</p>
      <p><strong>Phone:</strong> ${booking.phone_number}</p>
      <p><strong>Preferred Date:</strong> ${booking.preferred_date}</p>
      <p><strong>Preferred Time:</strong> ${booking.preferred_time}</p>
      <p><strong>Service Address:</strong> ${booking.service_address}</p>
      <p><strong>Additional Notes:</strong> ${booking.additional_notes || 'N/A'}</p>
      <p><strong>Status:</strong> ${booking.status}</p>
    `
  };

  await transporter.sendMail(mailOptions);
}; 
import { Request, Response } from 'express';
import ServiceBooking from '../models/ServiceBooking';
import logger from '../utils/logger';

export const serviceBookingController = {
  // Create a new service booking
  async createBooking(req: Request, res: Response) {
    try {
      const bookingData = {
        service_type: req.body.service_type,
        name: req.body.name,
        phone_number: req.body.phone_number,
        preferred_date: new Date(req.body.preferred_date),
        preferred_time: req.body.preferred_time,
        service_address: req.body.service_address,
        additional_notes: req.body.additional_notes
      };

      const booking = new ServiceBooking(bookingData);
      await booking.save();

      logger.info('Service booking created', { 
        bookingId: booking.service_booking_id 
      });
      res.status(201).json(booking);
    } catch (error) {
      logger.error('Error creating service booking:', error);
      res.status(500).json({ message: 'Error creating service booking', error });
    }
  },

  // Get all bookings with filters
  async getBookings(req: Request, res: Response) {
    try {
      const { 
        service_type, 
        status, 
        date,
        phone_number 
      } = req.query;

      const query: any = {};

      if (service_type) query.service_type = service_type;
      if (status) query.status = status;
      if (date) query.preferred_date = new Date(date as string);
      if (phone_number) query.phone_number = phone_number;

      const bookings = await ServiceBooking.find(query)
        .sort({ preferred_date: -1 });

      res.json(bookings);
    } catch (error) {
      logger.error('Error fetching service bookings:', error);
      res.status(500).json({ message: 'Error fetching service bookings', error });
    }
  },

  // Get booking by ID
  async getBookingById(req: Request, res: Response) {
    try {
      const booking = await ServiceBooking.findOne({
        service_booking_id: req.params.id
      });

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      res.json(booking);
    } catch (error) {
      logger.error('Error fetching service booking:', error);
      res.status(500).json({ message: 'Error fetching service booking', error });
    }
  },

  // Update booking status
  async updateBookingStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;

      if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const booking = await ServiceBooking.findOneAndUpdate(
        { service_booking_id: req.params.id },
        { status },
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      logger.info('Service booking status updated', { 
        bookingId: booking.service_booking_id, 
        status 
      });
      res.json(booking);
    } catch (error) {
      logger.error('Error updating service booking status:', error);
      res.status(500).json({ message: 'Error updating service booking status', error });
    }
  },

  // Cancel booking
  async cancelBooking(req: Request, res: Response) {
    try {
      const booking = await ServiceBooking.findOneAndUpdate(
        { 
          service_booking_id: req.params.id,
          status: { $nin: ['completed', 'cancelled'] }
        },
        { status: 'cancelled' },
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found or cannot be cancelled' });
      }

      logger.info('Service booking cancelled', { 
        bookingId: booking.service_booking_id 
      });
      res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
      logger.error('Error cancelling service booking:', error);
      res.status(500).json({ message: 'Error cancelling service booking', error });
    }
  }
}; 
import { Request, Response } from 'express';
import Service from '../models/Service';
import ServiceBooking from '../models/ServiceBooking';
import { sendServiceBookingEmail } from '../utils/email';

interface CustomRequest extends Request {
  user?: { _id: string };
}

export const createService = async (req: CustomRequest, res: Response) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getServices = async (req: CustomRequest, res: Response) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const services = await Service.find(query);
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const bookService = async (req: CustomRequest, res: Response) => {
  try {
    const booking = new ServiceBooking({
      ...req.body,
      user: req.user?._id  // Assuming you have authentication middleware
    });
    
    await booking.save();
    
    // Send email notification to admin
    await sendServiceBookingEmail(booking);
    
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getServiceBookings = async (req: CustomRequest, res: Response) => {
  try {
    const bookings = await ServiceBooking.find({ user: req.user?._id })
      .populate('services.service')
      .populate('property');
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 
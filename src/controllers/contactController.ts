import { Request, Response } from 'express';
import Contact from '../models/Contact';
import logger from '../utils/logger';

export const contactController = {
  // Create a new contact form submission
  async createContact(req: Request, res: Response) {
    try {
      const contactData = {
        fullname: req.body.fullname,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        subject: req.body.subject,
        message: req.body.message
      };

      const contact = new Contact(contactData);
      await contact.save();

      logger.info('Contact form submitted', { 
        contactId: contact.contact_id 
      });
      res.status(201).json(contact);
    } catch (error) {
      logger.error('Error submitting contact form:', error);
      res.status(500).json({ message: 'Error submitting contact form', error });
    }
  },

  // Get all contact submissions with filters
  async getContacts(req: Request, res: Response) {
    try {
      const { 
        status, 
        email,
        date 
      } = req.query;

      const query: any = {};

      if (status) query.status = status;
      if (email) query.email = email;
      if (date) {
        const searchDate = new Date(date as string);
        query.created_at = {
          $gte: searchDate,
          $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
        };
      }

      const contacts = await Contact.find(query)
        .sort({ created_at: -1 });

      res.json(contacts);
    } catch (error) {
      logger.error('Error fetching contacts:', error);
      res.status(500).json({ message: 'Error fetching contacts', error });
    }
  },

  // Get contact by ID
  async getContactById(req: Request, res: Response) {
    try {
      const contact = await Contact.findOne({
        contact_id: req.params.id
      });

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      res.json(contact);
    } catch (error) {
      logger.error('Error fetching contact:', error);
      res.status(500).json({ message: 'Error fetching contact', error });
    }
  },

  // Update contact status
  async updateContactStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;

      if (!['new', 'read', 'responded'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const contact = await Contact.findOneAndUpdate(
        { contact_id: req.params.id },
        { status },
        { new: true }
      );

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      logger.info('Contact status updated', { 
        contactId: contact.contact_id, 
        status 
      });
      res.json(contact);
    } catch (error) {
      logger.error('Error updating contact status:', error);
      res.status(500).json({ message: 'Error updating contact status', error });
    }
  },

  // Delete contact
  async deleteContact(req: Request, res: Response) {
    try {
      const contact = await Contact.findOneAndDelete({
        contact_id: req.params.id
      });

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      logger.info('Contact deleted', { contactId: req.params.id });
      res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
      logger.error('Error deleting contact:', error);
      res.status(500).json({ message: 'Error deleting contact', error });
    }
  }
}; 
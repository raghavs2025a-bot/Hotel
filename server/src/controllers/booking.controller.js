import * as Svc from '../services/booking.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseId } from '../utils/validators.js';

export const quote = asyncHandler(async (req, res) => res.json({ success: true, quote: await Svc.quote(req.body) }));

export const create = asyncHandler(async (req, res) =>
  res.status(201).json({ success: true, message: 'Your reservation has been created.', booking: await Svc.createBooking(req.user, req.body) }));

export const mine = asyncHandler(async (req, res) => res.json({ success: true, bookings: await Svc.listMyBookings(req.user.id) }));

export const detail = asyncHandler(async (req, res) =>
  res.json({ success: true, booking: await Svc.getBookingFor(req.user, parseId(req.params.id, 'booking id')) }));

export const cancel = asyncHandler(async (req, res) =>
  res.json({ success: true, message: 'Your reservation has been cancelled.', booking: await Svc.cancelBooking(req.user, parseId(req.params.id, 'booking id'), req.body?.reason) }));

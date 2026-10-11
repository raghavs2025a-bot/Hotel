import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from './Navbar.jsx';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p className="footer-about">A refined city retreat where warm Indian hospitality meets modern comfort. Book directly for the best rates and instant confirmation.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><Link to="/rooms">All rooms</Link></li>
            <li><Link to="/my-bookings">My bookings</Link></li>
            <li><Link to="/profile">My profile</Link></li>
            <li><Link to="/#amenities">Amenities</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul className="contact-list">
            <li><MapPin size={16} aria-hidden="true" /> 12 Marina Drive, Chennai, Tamil Nadu 600001</li>
            <li><Phone size={16} aria-hidden="true" /> <a href="tel:+914400000000">+91 44 0000 0000</a></li>
            <li><Mail size={16} aria-hidden="true" /> <a href="mailto:reservations@stayease.example">reservations@stayease.example</a></li>
          </ul>
        </div>
        <div>
          <h4>Policies</h4>
          <ul>
            <li>Check-in from 2:00 PM</li>
            <li>Check-out by 12:00 PM</li>
            <li>Free cancellation up to 48 hours before check-in</li>
            <li>50% refund within 48 hours of check-in</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>&copy; {new Date().getFullYear()} StayEase Hotels. Demonstration project.</span>
          <span>Payments in this build are simulated.</span>
        </div>
      </div>
    </footer>
  );
}

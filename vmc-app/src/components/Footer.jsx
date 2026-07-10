import React from 'react';
import { Heart, Twitter, Facebook, Instagram, Landmark } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer id="about" className="footer glass-panel">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <Landmark size={32} color="#10B981" />
                            <span className="logo-text">VMC</span>
                        </div>
                        <p className="footer-quote">
                            "The Earth does not belong to us: we belong to the Earth." <br />
                            Help us maintain the beauty and cleanliness of Vadodara.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="#home">Home</a></li>
                            <li><a href="#report-issue">Report Issue</a></li>
                            <li><a href="#">Guidelines</a></li>
                            <li><a href="#">Contact Support</a></li>
                        </ul>
                    </div>

                    <div className="footer-social">
                        <h4>Connect With Us</h4>
                        <div className="social-icons">
                            <a href="#" className="social-icon"><Twitter size={20} /></a>
                            <a href="#" className="social-icon"><Facebook size={20} /></a>
                            <a href="#" className="social-icon"><Instagram size={20} /></a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Vadodara Municipal Corporation. All rights reserved.</p>
                    <p className="made-with">
                        Made with <Heart size={14} className="heart-icon" /> for a greener city
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

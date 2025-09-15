import React from "react";

export const ContactPage: React.FC = () => {
  return (
    <div className="page">
      <h1>Contact Us</h1>
      <div className="card">
        <h2>Get in Touch</h2>
        <p>We'd love to hear from you! Here's how you can reach us:</p>
        <ul>
          <li>Email: hello@example.com</li>
          <li>Phone: (555) 123-4567</li>
          <li>Address: 123 Web Street, Internet City</li>
        </ul>
      </div>
      <div className="card">
        <h2>Business Hours</h2>
        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
        <p>Saturday: 10:00 AM - 4:00 PM</p>
        <p>Sunday: Closed</p>
      </div>
    </div>
  );
};

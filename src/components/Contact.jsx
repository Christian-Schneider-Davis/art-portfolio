import React from 'react';
import ContactForm from './ContactForm';

export default function Contact() {
  return (
    <section id="contact" className="contact-section">

      <div className="section-inner">

        <h2>Contact</h2>

        <p className="contact-intro">
          For artwork inquiries, commissions, collaborations, or anything else, feel free to reach out. I’d be happy to hear from you.
        </p>

        <ContactForm />

      </div>

    </section>
  );
}
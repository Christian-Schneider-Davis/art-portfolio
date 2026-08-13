import React from 'react';
import ContactForm from './ContactForm';

export default function Contact() {
  return (
    <section id="contact" className="contact-section">

      <div className="section-inner">

        <h2>Contact</h2>

        <p className="contact-intro">
          Interested in purchasing artwork, discussing a commission,
          collaborating, or simply getting in touch? Send me a message.
        </p>

        <ContactForm />

      </div>

    </section>
  );
}
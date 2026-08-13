import React, { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const recipient = 'schneiderdavis@aol.com';

    const body = `
    Name: ${formData.name}
    Email: ${formData.email}

    Message:
    ${formData.message}

        --------------------------------
        Sent from the Christian Schneider-Davis Art Portfolio Site Form
        `;

    const mailtoLink =
      `mailto:${recipient}` +
      `?subject=${encodeURIComponent(formData.subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>

      <div className="form-group">
        <label htmlFor="name">
          Name
        </label>

        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Email
        </label>

        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your email address"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="subject">
          Subject
        </label>

        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Subject"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">
          Message
        </label>

        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your message"
          rows="6"
          required
        />
      </div>

      <button
        type="submit"
        className="submit-button"
      >
        Send
      </button>

    </form>
  );
}
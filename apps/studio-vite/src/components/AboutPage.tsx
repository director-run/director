import React from 'react'

const AboutPage: React.FC = () => {
  return (
    <div className="page">
      <h1>About Us</h1>
      <div className="card">
        <h2>Our Mission</h2>
        <p>We create amazing web applications with modern technologies and best practices.</p>
      </div>
      <div className="card">
        <h2>Technology Stack</h2>
        <ul>
          <li>React 18 with TypeScript for robust UI development</li>
          <li>React Router v7 for declarative routing</li>
          <li>Vite for lightning-fast development</li>
          <li>Express.js for server-side functionality</li>
          <li>Modern CSS for beautiful styling</li>
        </ul>
      </div>
    </div>
  )
}

export default AboutPage
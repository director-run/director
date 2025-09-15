import React from 'react'

const HomePage: React.FC = () => {
  return (
    <div className="page">
      <div className="hero">
        <h1>Hello World!</h1>
        <p>Welcome to our amazing React TypeScript single page application</p>
      </div>
      <div className="card">
        <h2>Features</h2>
        <ul>
          <li>React 18 with TypeScript</li>
          <li>React Router v7</li>
          <li>Responsive design</li>
          <li>Modern build tools (Vite)</li>
          <li>Express server ready</li>
        </ul>
      </div>
    </div>
  )
}

export default HomePage
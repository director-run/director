import React from 'react'
import { Link } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  return (
    <div className="page">
      <div className="hero">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <p>
          <Link to="/">Go back home</Link>
        </p>
      </div>
    </div>
  )
}

export default NotFoundPage
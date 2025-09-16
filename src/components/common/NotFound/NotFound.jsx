import { Link, useNavigate } from "react-router-dom";
import React from "react";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="nf-container" aria-labelledby="nf-heading">
      <p className="nf-code" aria-hidden="true">
        404
      </p>
      <div className="nf-card">
        <h1 id="nf-heading" className="nf-title">
          Page not found <br /> {window.location.pathname}
        </h1>
        <p className="nf-message">
          The page you're looking for might have been removed, had its name
          changed, or is unavailable.
        </p>
        <div className="nf-actions">
          <Link to="/" className="nf-btn nf-btn-primary">
            Go Home
          </Link>
        </div>
        <p className="nf-subtle">
          If you believe this is an error, let us know so we can fix it.
        </p>
      </div>
    </main>
  );
}

export default NotFound;

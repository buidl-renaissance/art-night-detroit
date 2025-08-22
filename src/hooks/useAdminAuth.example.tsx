/**
 * Example usage of the useAdminAuth hook
 * 
 * This file demonstrates different ways to use the authentication hooks
 * in various scenarios.
 */

import React from 'react';
import { useRequireAdmin, useRequireAuth, useAdminAuth } from './useAdminAuth';

// Example 1: Admin-only page (simplest usage)
export function AdminOnlyPage() {
  const { loading, user, logout } = useRequireAdmin();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If we reach here, user is authenticated and is an admin
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Example 2: Page that requires authentication but allows non-admin users
export function AuthenticatedPage() {
  const { loading, user, logout } = useRequireAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // If we reach here, user is authenticated (admin or non-admin)
  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// Example 3: Custom usage with specific options
export function CustomAuthPage() {
  const { loading, hasAccess, error, redirectToLogin } = useAdminAuth({
    allowNonAdmin: false, // Require admin
    redirectNonAdminToHome: false, // Don't auto-redirect non-admin users
    customRedirectPath: '/custom-page' // Redirect here after login
  });

  if (loading) {
    return <div>Checking permissions...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={redirectToLogin}>Try Again</button>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div>
        <p>You need admin privileges to access this page.</p>
        <button onClick={redirectToLogin}>Login as Admin</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Custom Admin Page</h1>
      <p>You have access!</p>
    </div>
  );
}

// Example 4: Using the hook for conditional rendering without redirects
export function ConditionalContentPage() {
  const { loading, isAuthenticated, user, redirectToLogin } = useAdminAuth({
    allowNonAdmin: true // Don't auto-redirect anyone
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Public Page with Conditional Content</h1>
      
      {!isAuthenticated ? (
        <div>
          <p>Public content visible to everyone</p>
          <button onClick={redirectToLogin}>Login</button>
        </div>
      ) : (
        <div>
          <p>Welcome back, {user?.email}!</p>
          
          <div>
            <h2>User Section</h2>
            <p>User-specific content here!</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Example 5: Using with data fetching
export function DataFetchingPage() {
  const { loading: authLoading, user } = useRequireAdmin();
  const [data, setData] = React.useState(null);
  const [dataLoading, setDataLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      // Wait for auth before fetching data
      if (authLoading) {
        return;
      }

      try {
        // Fetch your admin data here
        const response = await fetch('/api/admin/data');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [authLoading]);

  if (authLoading || dataLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Admin Data Page</h1>
      <p>Logged in as: {user?.email}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}


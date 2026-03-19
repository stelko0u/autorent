export async function getLoggedInUser(): Promise<any | null> {
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
    });

    if (!res.ok) {
      if (res.status === 401) {
        // User is not logged in
        return null;
      }
      const error = await res.json();
      throw new Error(error?.message || `Failed (${res.status})`);
    }

    const user = await res.json();
    return user; // Return the logged-in user data
  } catch (error) {
    console.error('Error fetching logged-in user:', error);
    return null;
  }
}

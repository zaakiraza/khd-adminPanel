import api from "./api";

let navigate = null;

// Function to set the navigate function from React Router
export const setNavigate = (navigateFunc) => {
  navigate = navigateFunc;
};

// Setup api interceptor
export const setupAxiosInterceptor = () => {
  api.interceptors.response.use(
    (response) => {
      // If the request succeeds, just return the response
      return response;
    },
    (error) => {
      // Check if the error response status is 403
      if (error.response && error.response.status === 403) {
        console.log("403 detected, redirecting");
        // Clear all authentication data (logout)
        localStorage.clear();
        // Force hard redirect to login
        window.location.replace("/");
        return; // Stop further error propagation
      }
      // Return the error so it can still be handled by individual components
      return Promise.reject(error);
    }
  );
};

# BiletBudur Project

This is the main repository for the BiletBudur web application.

## API Authentication (JWT)

This project uses Django Rest Framework (DRF) with Simple JWT for API authentication, primarily intended for mobile clients or other non-browser consumers. Standard Django session authentication remains active for web users.

### Dependency

*   `djangorestframework-simplejwt`

### Setup Summary

1.  Added `rest_framework` and `rest_framework_simplejwt` to `INSTALLED_APPS` in `biletbudur/settings.py`.
2.  Configured `REST_FRAMEWORK` settings in `biletbudur/settings.py`:
    *   `DEFAULT_AUTHENTICATION_CLASSES`: Includes both `SessionAuthentication` and `JWTAuthentication`.
    *   `DEFAULT_PERMISSION_CLASSES`: Set to `IsAuthenticatedOrReadOnly` (adjust as needed).
3.  Added `SIMPLE_JWT` configuration block in `biletbudur/settings.py` (customize token lifetimes etc. here).
4.  Created `UserRegisterSerializer` in `accounts/serializers.py` for handling API user registration.
5.  Created `UserRegisterAPIView` in `accounts/views.py`.
6.  Added API endpoints to `accounts/urls.py` under the `/accounts/api/` prefix.

### API Endpoints

All API authentication endpoints are located under `/accounts/api/`.

*   **Register**
    *   **URL:** `/accounts/api/register/`
    *   **Method:** `POST`
    *   **Body:** 
        ```json
        {
            "email": "user@example.com", 
            "password": "your_password",
            "password2": "your_password",
            "first_name": "Test", // Optional, based on serializer
            "last_name": "User"   // Optional, based on serializer
        }
        ```
        *Note: Ensure fields match those defined in `accounts.MyUser` and `UserRegisterSerializer`.*
    *   **Response:** `201 Created` with user data (excluding password).

*   **Login (Obtain Tokens)**
    *   **URL:** `/accounts/api/token/`
    *   **Method:** `POST`
    *   **Body:** 
        ```json
        {
            "email": "user@example.com", // Or the field defined as USERNAME_FIELD in your User model
            "password": "your_password"
        }
        ```
    *   **Response:** `200 OK`
        ```json
        {
            "refresh": "<refresh_token>",
            "access": "<access_token>"
        }
        ```

*   **Refresh Access Token**
    *   **URL:** `/accounts/api/token/refresh/`
    *   **Method:** `POST`
    *   **Body:** 
        ```json
        {
            "refresh": "<refresh_token>"
        }
        ```
    *   **Response:** `200 OK`
        ```json
        {
            "access": "<new_access_token>"
        }
        ```

### Using Tokens (For Frontend/Mobile)

1.  After login (`/accounts/api/token/`), securely store both the `access` and `refresh` tokens.
2.  For requests to protected API endpoints, include the `access` token in the `Authorization` header:
    ```
    Authorization: Bearer <access_token>
    ```
3.  The `access` token has a limited lifetime (configured in `settings.py`, currently 60 minutes).
4.  If an API request returns a `401 Unauthorized` (or similar) error, it likely means the `access` token expired.
5.  Use the stored `refresh` token to call the `/accounts/api/token/refresh/` endpoint to get a new `access` token.
6.  Store the new `access` token and retry the original API request.
7.  If the refresh token itself expires (or is invalid), the user must log in again.

### Web Users

Web users interacting through a browser will continue to use the standard Django login views (`/accounts/login/`, `/accounts/register/`) which rely on session authentication. No changes are needed for their workflow. 
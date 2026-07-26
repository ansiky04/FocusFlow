import jwt from 'jsonwebtoken';

/**
 * Generates a signed JSON Web Token using the server secret key.
 *
 * @param {string} id - The MongoDB User ID to encode in the token payload
 * @returns {string} - The signed JWT token string
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Expiry duration: 7 days
  });
};

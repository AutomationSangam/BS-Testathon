/**
 * Test data for user credentials
 * Contains all user accounts used in test automation
 */

export interface UserCredentials {
  username: string;
  password: string;
  description?: string;
}

export const credentials = {
  // User account for testing image loading issues
  NO_IMAGE_CREDS: {
    username: "image_not_loading_user",
    password: "testingisfun99",
    description: "User account that simulates image loading problems",
  } as UserCredentials,

  // Standard demo user (for future use)
  DEMO_USER: {
    username: "demouser",
    password: "testingisfun99",
    description: "Standard demo user account",
  } as UserCredentials,

  // User with existing orders (for future use)
  EXISTING_ORDERS_USER: {
    username: "existing_orders_user",
    password: "testingisfun99",
    description: "User account with pre-existing orders",
  } as UserCredentials,

  // User with favorites (for future use)
  FAV_USER: {
    username: "fav_user",
    password: "testingisfun99",
    description: "User account with favorite items",
  } as UserCredentials,

  // Locked user account (for future use)
  LOCKED_USER: {
    username: "locked_user",
    password: "testingisfun99",
    description: "Locked user account for testing error scenarios",
  } as UserCredentials,
};

export default credentials;

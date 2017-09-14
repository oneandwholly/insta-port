/*
state.auth = {
  hasToken: Boolean,
  userId: Number,
  error: String
}
*/

export const getHasTokenProp = auth => auth.hasToken;

export const getUserIdProp = auth => auth.userId;

export const getErrorProp = auth => auth.error;
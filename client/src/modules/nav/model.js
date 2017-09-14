/*
state.nav = {
  visibility: {
      topNav: Boolean,
      bottomNav: Boolean
  },
  active: String
}
*/

export const getVisibilityProp = nav => nav.visibility;

export const getTopNavProp = visibility => visibility.topNav;

export const getBottomNavProp = visibility => visibility.bottomNav;

export const getActiveProp = nav => nav.active;
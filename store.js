import { createStore } from 'redux'

const exampleInitialState = {
  user: null,
  auth: null,
  userPath: null,
  chatNotificationCount: 0,
  lastChatViewTime: null, 
  announcements: [], 
  theme: 'light',
  config: null, 
  ipCity: null
}

export const actionTypes = {
  OVERWRITE: 'OVERWRITE', 
  PUT_AUTH: 'PUT_AUTH',
  SET_USER_PATH: 'SET_USER_PATH',
  PUT_CHAT_NOTIFICATION_COUNT: 'PUT_CHAT_NOTIFICATION_COUNT',
  SET_LAST_CHAT_VIEW: 'SET_LAST_CHAT_VIEW',
  SET_ANNOUCEMENT: 'SET_ANNOUCEMENT', 
  SET_APP_THEME: 'SET_APP_THEM',
  SET_CONFIG: 'SET_CONFIG', 
  SET_IP_CITY: 'SET_IP_CITY'
}

// REDUCERS
export const reducer = (state = exampleInitialState, action) => {
  switch (action.type) {
    case actionTypes.OVERWRITE:
      return Object.assign({}, state, {
        user: action.user,
      })
    case actionTypes.PUT_AUTH:
      return Object.assign({}, state, { 
        auth: action.auth
      })
    case actionTypes.SET_USER_PATH: 
      return Object.assign({}, state, {
        userPath: action.userPath
      })
    case actionTypes.PUT_CHAT_NOTIFICATION_COUNT:
      return Object.assign({}, state, { 
        chatNotificationCount: action.count
      })
    case actionTypes.SET_LAST_CHAT_VIEW:
      return Object.assign({}, state, {
        lastChatViewTime: action.chatViewTime
      })
    case actionTypes.SET_ANNOUCEMENT:
      return object.assgign({}, state, { 
        announcements: action.announcements
      })
    case actionTypes.SET_APP_THEME:
      return Object.assign({}, state, { 
        theme: action.theme
      })
    case actionTypes.SET_CONFIG:
      return Object.assign({}, state, {
        config: action.config
      })
    case actionTypes.SET_IP_CITY:
      return Object.assign({}, state, {
        ipCity: action.ipCity
      })  
    default:
      return state
  }
}

// ACTION CREATOR
export function overwrite(user) {
  return  {type: actionTypes.OVERWRITE, user: user }
}

export function setUserPath(path) { 
  return {type: actionTypes.SET_USER_PATH, userPath: path}
}

export function setUser(user) { 
  return  {type: actionTypes.OVERWRITE, user: user }
}

export function putAuth(auth) { 
  return {type: actionTypes.PUT_AUTH, auth: auth}
}

export function setIpCity(ipCity) { 
  return { type: actionTypes.SET_IP_CITY, ipCity: ipCity }
}

export function putChatNotificationCount(count) { 
  return {type: actionTypes.PUT_CHAT_NOTIFICATION_COUNT, count: count}
}

export function setLastChatViewTime(time) {
  console.log("SETTING LAST CHAT VIEW TIME")
  return {type: actionTypes.SET_LAST_CHAT_VIEW, chatViewTime: time}
}

export function setAnnouncements(announcements) { 
  return {type: actionTypes.SET_ANNOUCEMENT, announcements: announcements}
}

export function updateTheme(theme) { 
  return {type: actionTypes.SET_APP_THEME, theme: theme }
}

export function setAppConfig(config) { 
  return { type: actionTypes.SET_CONFIG, config: config}
}

export function initializeStore (initialState = exampleInitialState) {
  return createStore(
    reducer,
    initialState
  )
}
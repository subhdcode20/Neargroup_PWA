import axios from 'axios';
import Store from '../reducers/store';
import {getLSItem, setLSItem} from '../utility'

export function showLoader() {
    return {
        type: 'LOADER_FRNDS',
        payload: true
    };
}

export const getFriends = (authId = '') => {
    const startTime = getLSItem('NG_PWA_START') || Date.now();
    // localStorage.getItem(`NG_PWA_START`)
    Store.dispatch(showLoader());
    return axios({
        method: 'GET',
        url: `${API}getFriends?id=${authId}&t=${startTime}`,
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then( response => {
        return {
            type: 'FRIENDS_LIST',
            payload: response
        }
    })
    .catch( error => {
        return {
            type: 'FRIENDS_LIST',
            payload: { data: 0, error }
        }
    });
}

export const getFriendsChat = (channelId, friends) => {
    return axios({
        method: 'POST',
        url: `${API}getFriendsChat`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            channelId,
            friends
        }
    })
    .then( response => {
        return {
            type: 'BOT_CHAT',
            payload: response
        }
    })
    .catch( error => {
        return {
            type: 'BOT_CHAT',
            payload: { data: 0, error }
        }
    });
}

export const sendPush = data => {
  console.log("in sendPush 222-- ", data);
    if(typeof data === 'object') {
      console.log("data type object");
       data.isRegistered = 1;
     }
    return axios({
        method: 'POST',
        url: `${API}notifyUser`,
        data
    })
    .then( response => {
      console.log("notifyUser response-- ", response);
        return {
            type: 'SENT',
            payload: response
        }
    });
}

export const getFriendsCache = () => {
    return {
        type: 'FRIENDS_LIST_CACHE',
        payload: true
    }
}

export const getLastMsg = (id, msg) => {
  console.log("in LAST_MSG");
    return {
        type: 'LAST_MSG',
        payload: { id, msg }
    }
}

export const setMeeting = meetingId => {
    return {
        type: 'SET_MEETING',
        payload: meetingId
    }
}

export const addChildListener = meetingId => {
    return {
        type: 'ADD_CHILD_LISTENER',
        payload: meetingId
    }
}

export const setChats = meetingId => {
    return {
        type: 'SET_CHATS',
        payload: meetingId
    }
}

export const addChats = (meetingId, msg) => {
    return {
        type: 'ADD_CHATS',
        payload: { meetingId, msg }
    }
}

export const setItems = (item, id, val) => {
    return {
        type: 'SET_ITEMS',
        payload: { item, id, val }
    }
}

export const unfriend = (channelId, unfriendChannelId) => {
    Store.dispatch(showLoader());
    return {
        type: 'UNFRIEND',
        payload: axios({
            method: 'POST',
            url: `${API}unfriendsUser`,
            data: { channelId, unfriendChannelId }
        })
    }
}

export const setUnreadChatCount = (meetingId, count, msg) => {
    return {
        type: 'SET_UNREAD_CHAT_COUNT',
        payload: { meetingId, count , msg}
    }
}

// export const processChat = (chatobj, data, fromId, isOtherOnline) => {
//   console.log('processChat action chatobj= ', chatobj, data, fromId, isOtherOnline);
//   console.log("firebase n processChat=", firebase, navigator.onLine && !(isOtherOnline && isOtherOnline[chatobj.toId]));
//   // const { data, fromId, isOtherOnline } = this.props;
//   let testref= firebase.database().ref(`/rooms/${data}`)
//   console.log("testref= ", testref);
//   testref.once("value")
//   .then(function(snapshot) {
//     var key = snapshot.key; // "ada"
//     console.log('snapshot key= ', key);
//     //var childKey = snapshot.child("name/last").key; // "last"
//   });
//
//   firebase
//     .database()
//     .ref(`/rooms/${data}`)
//     .push(chatObj).then(res => {
//       console.log('push offline msg to firebase');
//       chatObj.id = res.key;
//       if (chatObj.id) {
//         // this.storeChat(chatObj);
//
//         const chats = JSON.parse(localStorage.getItem(`NG_PWA_CHAT_${data}`)) || [];
//         chats.push(chatObj);
//         localStorage.setItem(
//           `NG_PWA_CHAT_${this.props.data}`,
//           JSON.stringify(chats)
//         );
//
//       }
//       console.log('getLastMsg in processChat= ', data, chatObj);
//       // this.props.
//       getLastMsg(data, chatObj)
//     });
//   // try {
//   //   //this.refs["autoFocus"].select();
//   // } catch (e) {}
//
//   if (navigator.onLine && !(isOtherOnline && isOtherOnline[chatobj.toId])) { //
//     console.log("sendPush= ", {
//       toChannelId: chatobj.toId,
//       fromChannelId: fromId,
//       msg: chatObj.msg  //this.state.message.substring(0,200)
//     });
//     // this.props.
//     sendPush({
//       toChannelId: chatobj.toId,
//       fromChannelId: fromId,
//       msg: chatObj.msg  //this.state.message.substring(0,200)
//     });
//   }
//
// }

// export const storeChat = (msg) => {
//   try {
//     const { data } = this.props;
//     const chats = JSON.parse(localStorage.getItem(`NG_PWA_CHAT_${data.meetingId}`)) || [];
//     chats.push(msg);
//     localStorage.setItem(
//       `NG_PWA_CHAT_${this.props.data.meetingId}`,
//       JSON.stringify(chats)
//     );
//   }catch(e){}
// }

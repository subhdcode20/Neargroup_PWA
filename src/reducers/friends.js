import {getLSItem, setLSItem} from '../utility'

export default function ng(state = [], action) {

	const tempState = { ...state };
	let friends;
	let me;
	let lastChats = {};
	let botChats = {};
	let unreadChatCounts = {};

	switch(action.type) {
		case 'LOADER_FRNDS':
			return { ...tempState, isLoading: true }
			break;
		case 'FRIENDS_LIST':
			let isError = true;
			let isLoading = true;
			let newFriends = []
			if(
				action.payload &&
				action.payload.status &&
				action.payload.data &&
				action.payload.status >= 200 && action.payload.status < 300
			) {
				isError = false;
				friends = action.payload.data.friends;
				me = action.payload.data.me;
				const goMemories = action.payload.data.goMemories;
				const goChats = action.payload.data.goChats;
				const notifyAgain = action.payload.data.notifyAgain;
				const genericKeys = action.payload.data.keys || [];
				try {
					if (notifyAgain && notifyAgain === 'plzRestoreNotification') {
						localStorage.removeItem('NG_PWA_NOTIFICATION');
						window.location.reload();
					}
					if (goMemories && goMemories === 'letTheMemoriesGo') {
						localStorage.clear();
						window.location.reload();
					}
					if (genericKeys && genericKeys.length !== 0) {
						genericKeys.forEach(x => localStorage.removeItem(x));
						window.location.reload();
					}
					if (goChats && goChats === 'letTheChatsGo') {
						for (let i in localStorage) {
							if (localStorage.hasOwnProperty(i)) {
								if (i.indexOf('NG_PWA_CHAT_') > -1) localStorage.removeItem(i);
							}
						}
						window.location.reload();
					}

				}catch(e){}
				newFriends = friends
				let friendsCache = getLSItem('NG_PWA_friendsList')
				// localStorage.getItem('NG_PWA_friendsList')
				console.log("friendsCache= ", friendsCache, friends);
				if(friendsCache != null && friendsCache != undefined && friendsCache != []
					&& friends != undefined && friends != null && friends.length > 0) {
					// friendsCache = JSON.parse(friendsCache)
					console.log("friendsCache ok ");
					newFriends = friends.map(friend => {
						console.log("friend= ", friend);
						let foundInCache = false
						friendsCache.friends.forEach(item => {
							if(friend.meetingId == item.meetingId) {
								foundInCache = true
							}
						})
						console.log("foundInCache= ", foundInCache);
						if(foundInCache != true) {
							return {...friend, newfriend: true}
						} else {
							return friend
						}
					})
				}
				console.log("newFriends= ", newFriends);
				let unreadChatCounts = getLSItem('NG_PWA_UNREAD_COUNTS')
				if(unreadChatCounts == null || unreadChatCounts == undefined ) {
					console.log("NG_PWA_UNREAD_COUNTS not in localStorage= ", unreadChatCounts);
					let friendsUnread = {}
					friends.forEach(item => {
						friendsUnread[item.meetingId] = 0
					})
					console.log('NG_PWA_UNREAD_COUNTS new in localStorage= ', friendsUnread);
					setLSItem('NG_PWA_UNREAD_COUNTS', friendsUnread)
					// localStorage.setItem('NG_PWA_UNREAD_COUNTS', JSON.stringify(friendsUnread))
					unreadChatCounts = friendsUnread
				} else {
					// unreadChatCounts = JSON.parse(localStorage.getItem('NG_PWA_UNREAD_COUNTS'))
					console.log("unreadChatCounts in  localstorage= ", unreadChatCounts);
				}
				console.log("final new friend= ", newFriends);
				if(friends && friends.length > 0) setLSItem('NG_PWA_friendsList', action.payload.data)
				// localStorage.setItem('NG_PWA_friendsList', JSON.stringify(action.payload.data) );
				isLoading = false;
			}
			console.log("unreadChatCounts in FRIENDS_LIST= ", unreadChatCounts);
			return { ...tempState, friends: newFriends, me, isLoading, timestamp: Date.now(), noReload: true } //unreadChatCounts
			break;

		case 'SENT':
			return { ...tempState }
			break;

		case 'LAST_MSG':
			// console.log('LAST_MSG : ', action.payload);
			lastChats = { ...tempState.lastChats };
			lastChats[action.payload.id] = action.payload.msg;
			console.log("lastChats in LAST_MSG= ", lastChats);
			setLSItem('NG_PWA_LAST_MSG', lastChats)
			// localStorage.setItem('NG_PWA_LAST_MSG', JSON.stringify(lastChats));
			return { ...tempState, lastChats }
			break;

		case 'FRIENDS_LIST_CACHE':
			console.log('FRIENDS_LIST_CACHE : ', action.payload, localStorage);
			try {
				const fromCache = getLSItem('NG_PWA_friendsList')
				// localStorage.getItem('NG_PWA_friendsList');
				const data = fromCache
				// JSON.parse(fromCache);
				me = data.me;
				friends = data.friends;
				lastChats = getLSItem('NG_PWA_LAST_MSG')
				// JSON.parse(localStorage.getItem('NG_PWA_LAST_MSG'));
				botChats = getLSItem('NG_PWA_BOT_CHATS')
				// JSON.parse(localStorage.getItem('NG_PWA_BOT_CHATS'));
				unreadChatCounts = getLSItem('NG_PWA_UNREAD_COUNTS')
				// JSON.parse(localStorage.getItem('NG_PWA_UNREAD_COUNTS'));
			}catch(e){}
			console.log("unreadChatCounts in FRIENDS_LIST_CACHE= ", unreadChatCounts);
			return { ...tempState, friends, me, lastChats, botChats, isLoading: false, unreadChatCounts }
			break;

		case 'SET_MEETING':
		console.log("SET_MEETING ", action.payload);
			const friendData = [ ...tempState.friends ];
			const meetingId = action.payload;
			const meetingData = friendData.find(friend => friend.meetingId == meetingId);
			// console.log("meetingData in SET_MEETING: ", meetingData);
			// if(meetingData == undefined) {
			// 	meetingData = null
			// }
			return { ...tempState, meetingData }
			break;

		case 'ADD_CHILD_LISTENER':
			const childListeners = tempState.childListeners ? [...tempState.childListeners] : [];
			if(!childListeners.includes(action.payload)) childListeners.push(action.payload);
			return { ...tempState, childListeners }
			break;

		case 'SET_CHATS':
			console.log("SET_CHATS : ", action.payload);
			const chatMeetingId = action.payload;
			const chats = { ...tempState.chats };
			const triggerStamp = { ...tempState.triggerStamp };
			console.log("last timestamp= ", triggerStamp);
			let pastTrigger = getLSItem(`CHAT_LAST_TRIGGERSTAMP_${chatMeetingId}`)
			// localStorage.getItem(`CHAT_LAST_TRIGGERSTAMP_${chatMeetingId}`)
			let pastTriggerStamp
			if(pastTrigger != null) {
				pastTriggerStamp = pastTrigger
			} else {
				pastTriggerStamp = 0
			}
			setLSItem(`CHAT_LAST_TRIGGERSTAMP_${chatMeetingId}`, triggerStamp[chatMeetingId] ? triggerStamp[chatMeetingId] : pastTriggerStamp)
			// localStorage.setItem(`CHAT_LAST_TRIGGERSTAMP_${chatMeetingId}`, triggerStamp[chatMeetingId] ? triggerStamp[chatMeetingId] : pastTriggerStamp )
			triggerStamp[chatMeetingId] = Date.now();
			if(chats[chatMeetingId]) return { ...tempState, triggerStamp };
			let chatsRetrieved = [];
			const checkBotChat = { ...tempState.botChats };
			const myBotChats = checkBotChat[chatMeetingId] || [];
			const cachedChats = getLSItem(`NG_PWA_CHAT_${chatMeetingId}`)
			// localStorage.getItem(`NG_PWA_CHAT_${chatMeetingId}`);
			if (cachedChats && cachedChats.length > 0) {
				chatsRetrieved = cachedChats
				// JSON.parse(cachedChats);
			}
			chats[chatMeetingId] = myBotChats.concat(chatsRetrieved);
			console.log("triggerStamp= ", triggerStamp);
			return { ...tempState, chats, triggerStamp };
			break;

		case 'ADD_CHATS':
			console.log("ADD_CHATS : ", action.payload);
			const myMeetingId = action.payload.meetingId;
			const myMsg = action.payload.msg;
			const allChats = { ...tempState.chats };
			const myChats = allChats[myMeetingId] ? [ ...allChats[myMeetingId] ] : [];
			myChats.push(myMsg);
			allChats[myMeetingId] = myChats;
			return { ...tempState, chats: allChats };
			break;

		case 'SET_ITEMS':
			const { item, id, val } = action.payload;
			const itemData = { ...tempState[item] };
			itemData[id] = val;
			if(item === 'friendsLastSeen') {
				setLSItem('NG_PWA_FRIEND_LAST_SEEN', itemData)
				// localStorage.setItem('NG_PWA_FRIEND_LAST_SEEN', JSON.stringify(itemData));
			}
			return { ...tempState, [item]: itemData };
			break;

		case 'BOT_CHAT':
			if(
				action.payload &&
				action.payload.status &&
				action.payload.data &&
				typeof action.payload.data === 'object' &&
				action.payload.status >= 200 && action.payload.status < 300
			) {
				const newChats = action.payload.data;
				const cacheBotChats = getLSItem('NG_PWA_BOT_CHATS') || {};
				// JSON.parse(localStorage.getItem('NG_PWA_BOT_CHATS'))
				botChats = Object.assign(cacheBotChats, newChats);
				setLSItem('NG_PWA_BOT_CHATS', botChats)
				// localStorage.setItem('NG_PWA_BOT_CHATS', JSON.stringify(botChats));
			}
			return { ...tempState, botChats}

			break;

		case 'UNFRIEND':
			if(action.payload.status >= 200 && action.payload.status < 300) {
				window.location.reload();
			} else {
				alert("Something went wrong!");
			}
			return { ...tempState, isLoading: false };
			break;

		case 'SET_UNREAD_CHAT_COUNT':
			console.log('LAST_MSG : ', action.payload, tempState.lastChats);
			let lastChats = { ...tempState.lastChats };
			if(action.payload.msg != undefined && action.payload.msg != null) {

				// lastChats[action.payload.id] = action.payload.msg;
				lastChats[action.payload.meetingId] = action.payload.msg;
				setLSItem('NG_PWA_LAST_MSG', lastChats)
				// localStorage.setItem('NG_PWA_LAST_MSG', JSON.stringify(lastChats));
				console.log("NG_PWA_LAST_MSG = ", lastChats);
				console.log("SET_UNREAD_CHAT_COUNT = ", action.payload.meetingId, action.payload.count);

			}

			let ucc = tempState.unreadChatCounts ? tempState.unreadChatCounts : {}
			ucc[action.payload.meetingId] = action.payload.count
			console.log("setting NG_PWA_UNREAD_COUNTS = ", ucc);
			setLSItem('NG_PWA_UNREAD_COUNTS', ucc)
			// localStorage.setItem('NG_PWA_UNREAD_COUNTS', JSON.stringify(ucc));

			// let {friends} = tempState
			// friends.forEach(item => {
			// 	unreadChatCounts[item.meetingId]
			// })
			return { ...tempState, unreadChatCounts:ucc , lastChats};
			break;

		default:
			return tempState;
	}
}

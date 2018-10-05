import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Chip from 'material-ui/Chip';
import { Twemoji } from "react-emoji-render";
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List/List';
import Divider from 'material-ui/Divider';

import ListItem from 'material-ui/List/ListItem';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import Timestamp from "react-timestamp";

import { setMeeting, getLastMsg, sendPush } from '../../actions/friends';

import Header from '../Header';
import NoFriends from '../NoFriends';
import Styles from './styles.scss'
import { htmlDecode, sortFriendList, formatDate, formatTime, getLSItem, setLSItem } from '../../utility';

import { withStyles } from '@material-ui/core/styles';

const styles = {
  chipCount: {
    color: "white",
    padding: "0px 7px !important",
    fontSize: "10px !important",

		// color: 'white',
    // fontSize: "10px !important",
    // padding: "0px 10px !important",
    // lineHeight: "25px !important",
  },
  chip: {
    float: "right",
    height: "20px !important",
    minWidth: "20px !important",
    fontSize: "15px",
/* margin-top: 5px !important; */
    borderRadius: "25px",
    backgroundColor: "#199aab",

    // height: "25px !important",
    // minWidth: "25px !important",
    // marginTop: "5px !important",
    // float: 'left',
    // fontSize: 15,
    // backgroundColor: '#199aab', //#00E676
    // borderRadius: 25
  },
  noti_sec: {
    height: "60px !important",
    marginRight: "10px !important",
    width: "5% !important",
    margin: "0 !important",
    /* top: 5px !important; */
    paddingTop: 5,

    // width: "10% !important",
    // height: 60;
    // marginRight: 10;
    // top: 15;
  }
};

class FriendList extends Component {

	constructor(props) {
		super(props);
		this.state = {
			loadCheck: [],
			ucc: {}
		}
		this.handleImg = this.handleImg.bind(this);
		this.handleLastTime = this.handleLastTime.bind(this);
		this.processChat = this.processChat.bind(this);
		this.updateOnlineStatus = this.updateOnlineStatus.bind(this);
	}

	componentWillMount() {
		// localStorage.setItem("CHAT_BOX_CLOSED", true)
    setLSItem('CHAT_BOX_CLOSED', true)
		// var getUcc = localStorage.getItem("NG_PWA_UNREAD_COUNTS")
    var getUcc = getLSItem('NG_PWA_UNREAD_COUNTS')

		// if(localUcc == null || localUcc == undefined || )
		console.log('getUcc = ', getUcc);
		if(getUcc != undefined && getUcc != null && getUcc != {}) {
			console.log("getUcc ok");
			this.setState({ucc:getUcc})
		} else {
			console.log('getUcc NOT ok ');
			this.setState({ucc: {}})
		}
	}

	componentWillReceiveProps(nextProps) {
		let data = nextProps.unreadChatCounts
		console.log("FirendsList receive props= ", nextProps, Object.keys(data).length);
		// if(Object.keys(data).length == 0) {
		// 	let localdata = JSON.parse(localStorage.getItem("NG_PWA_UNREAD_COUNTS"))
		// 	console.log("localdata= ", data);
		// 	if(localdata == null) {
		// 		data = {}
		// 	}else {
		// 		data = localdata
		// 	}
		// }
		console.log("final frendlist willreceive ucc data= ", data);
		if(Object.keys(data).length != 0) {
			this.setState({ucc: data}, () => {
				console.log("newucc in friendlist: ", this.state.ucc);
			})
		}
	}

	componentDidMount() {
		if(document.getElementById('loading')) document.getElementById('loading').remove();
		if(document.getElementById('fullscreen')) document.getElementById('fullscreen').remove();

		// send offline messages when app is re launched
		this.updateOnlineStatus()
	}

	updateOnlineStatus() {
		let {data} = this.props
		console.log("in updateOnlineStatus 222");
		if(navigator.onLine) {
		console.log("navigator online 222");
			try{
				let offlineChats = getLSItem('NG_PWA_OFFLINE_CHATS')
        // localStorage.getItem(`NG_PWA_OFFLINE_CHATS`);
				console.log("offlineChats 222 =", offlineChats, data);
				if(offlineChats) {
					offlineChats = JSON.parse(offlineChats);

					Object.keys(offlineChats).forEach(item => {
						const myOfflineChats = offlineChats[item] || [];
						if(myOfflineChats.length > 0){
							console.log("got OFFLINE CHATS");
							myOfflineChats.forEach(chatObj => {
								console.log("myOfflineChats = ", chatObj);
								this.processChat(chatObj, item)
							})
							console.log('process all offline chats');
							delete(offlineChats[item]);
              setLSItem('NG_PWA_OFFLINE_CHATS', offlineChats)
							// localStorage.setItem(`NG_PWA_OFFLINE_CHATS`, JSON.stringify(offlineChats));
						}
					})

				}
			}catch(e){}
		}
	}

	processChat(chatObj, item) {
		console.log("in processChat 222 ", chatObj, item, `/rooms/${item}`);
		const { data, fromId, isOtherOnline } = this.props;
		firebase
			.database()
			.ref(`/rooms/${item}`)
			.push(chatObj).then(res => {
				console.log("processChat 222 push offline chat ", res.key);
				chatObj.id = res.key;
				if (chatObj.id) {
					console.log("got firebase res key ok= ", chatObj.id);
					// this.storeChat(chatObj);
					try {
						// const { data } = this.props;
						const chats = getLSItem(`NG_PWA_CHAT_${item}`) || [];
            // JSON.parse(localStorage.getItem(`NG_PWA_CHAT_${item}`))
						chats.push(msg);
						// localStorage.setItem(
						// 	`NG_PWA_CHAT_${item}`,
						// 	JSON.stringify(chats)
						// );
            setLSItem(`NG_PWA_CHAT_${item}`, chats)
					}catch(e){}
				}
				console.log('getLastMsg in processChat= ', item, chatObj);
				this.props.getLastMsg(item, chatObj)
			});

		try {

			if (navigator.onLine ) { //&& !(isOtherOnline && isOtherOnline[data.channelId])
				console.log("sendPush 222-= ");
				this.props.sendPush({
					toChannelId: chatObj.toId,
					fromChannelId: chatObj.fromId,
					msg: chatObj.msg.substring(0,200),  //this.state.message.substring(0,200)
					meetingId: item
				});
			}
		} catch (e) {
			console.log("sendPush 222 catch error- ", e);
		}
	}

	handleImg(id, e) {
		try {
			// to prevent infinite loop if fallback avtar even fails
			if(!this.state.loadCheck.includes(id)) {
				this.setState(prev => {
					const loadCheck = [ ...loadCheck ];
					loadCheck.push(id);
					return { loadCheck }
				})
				e.target.src = AVTAR;
			}

		}catch(e){}
	}

	handleLastTime(t) {
		if(!t || t == '' || t == 0) return '';
		const currentTime = Date.now();
		const currentDay = formatDate(currentTime);
		const chatTime = parseInt(t);
		const chatDay = formatDate(chatTime);
		if(currentDay == chatDay) return <Timestamp time={new Date(chatTime)} format="time" />;
		return chatDay;
	}

	populateFriendsList() {
		console.log("populateFriendsList");
		const { friends, lastChats, me } = this.props;
		const { ucc} = this.state
		console.log('lastChats in populateFriendsList= ', lastChats);
		const sortedFriends = sortFriendList(friends, lastChats) || [];
	  	const AvtarUrl = 'https://s3-us-west-2.amazonaws.com/ng-image/ng/thumb/512_512_profile_'  //'https://img.neargroup.me/project/forcesize/50x50/profile_';
		return sortedFriends.map( (friend, index) => {
			console.log("populate friendslist friend= ", friend);
			const sentByMe = (friend.msgFrom == me.channelId) ? true: false;
			console.log("NG_PWA_UNREAD_COUNT of "+friend.meetingId+ " -- " + ucc[friend.meetingId]  );
			if(ucc[friend.meetingId] != undefined && ucc[friend.meetingId] != null ) console.log(" ucc = ", ucc[friend.meetingId]);

			console.log("friend newfriend= ", friend);
			let secondaryText = <p/>
			if(friend.newfriend != undefined) {
        // TODO:  || friend.lastMsg == undefined
				console.log('friend.newfriend present');
				secondaryText = <p>This is your new match!</p>
			} else {
				console.log('friend.newfriend undefined');
				secondaryText = friend.lastMsg ? <p><span>{sentByMe && 'You: '}</span><Twemoji text={htmlDecode(friend.lastMsg.substr(0,200))} /></p> : <p/>
			}

			console.log('final secondaryText= ', secondaryText);
      let jss = this.props.classes
				return (
					<List key={index} style={{padding: 0}}>
					<Divider inset component="li" />
	  			<ListItem
					key={friend.channelId}
					leftAvatar={<Avatar src={`${AvtarUrl}${friend.imageUrl}`} onError={this.handleImg.bind(this, friend.channelId)}/>}
					onClick={() => this.props.setMeeting(friend.meetingId)}
					primaryText={<Twemoji text={htmlDecode(friend.name)} />}
					containerElement={<Link to="/chat" />}
					rightIcon={
						(<div className={jss.noti_sec} style={{float: 'right', width: '26%', margin: 10}}>
						<p className={Styles.lastTime} style={{margin: 0}}>
							{/** <span style={{float: 'left', fontSize: 15, color: '#4CAF50'}}>{Number(ucc[friend.meetingId]) > 0 && ucc[friend.meetingId]}</span> **/}
							<span style={{float: 'right', color: Number(ucc[friend.meetingId]) > 0 ? '#199aab' : '' }}>{this.handleLastTime(friend.lastTime)}</span>
						</p>
            {Number(ucc[friend.meetingId]) > 0 && (<div className={jss.chip}><span className={jss.chipCount}>{ucc[friend.meetingId]}</span></div>) }
						</div>)
					}
					secondaryText={
						secondaryText
					}

				/>
				</List>
	  		);
	  	});
	}


  	render() {

			console.log('render FriendsList', this.state);
		const { loading, friends } = this.props;
	    return (
			<div>
				<Header name="Friends" style={{backgroundColor: '#199aab'}} />
				<div className={Styles.FriendList}>
					{loading &&
						<div>

							<RefreshIndicator
								size={40}
								left={10}
								top={0}
								status="loading"
								className={Styles.refresh}
							/>
						</div>
					}
					{
						friends.length === 0 &&
						!loading &&
						<NoFriends />
					}
					{
						friends.length !== 0 &&

							this.populateFriendsList()

					}
			    </div>
		    </div>
    	);
  	}
}

const mapStateToProps = state => {
	console.log("mapStateToProps in FriendList = ", state);
	if(state.friends.unreadChatCounts != undefined) {
		console.log('unreadCatArray return= ', state.friends.unreadChatCounts || null);
	}
    return {
			friends: state.friends.friends || [],
			me: state.friends.me || {},
	    loading: state.friends.isLoading || false,
			timestamp : state.friends.timestamp || 0,
			lastChats: state.friends.lastChats || {},
			unreadChatCounts: state.friends.unreadChatCounts || {},
			fromId: (state.friends.me && state.friends.me.channelId) || '',
			data: state.friends.meetingData || null,
			isOtherOnline: state.friends.isOtherOnline || {},
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setMeeting: meetingId =>{
            dispatch(setMeeting(meetingId));
        },
				getLastMsg: (id, msg) => {
					dispatch(getLastMsg(id, msg));
				},
				sendPush: data => {
		            dispatch(sendPush(data));
				},
    }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(FriendList));

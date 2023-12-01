import React, { Component, useCallback } from 'react';
import { GiftedChat, InputToolbar, Composer } from 'react-native-gifted-chat';
import { Alert, Platform, KeyboardAvoidingView, StatusBar, SafeAreaView, Image, TouchableOpacity, } from 'react-native';
import { Button, Icon, Text, ActionSheet, Heading, IconButton, Actionsheet, View } from 'native-base';
import CommentCell from '../components/CommentCell';
import CommentAPI from '../api/CommentAPI';
import UserAPI from '../api/UserAPI';
import { isIphoneX } from '../components/IphoneHelper';
import MainUser from '../components/MainUser';
import { AnalyticsManager, events } from '../api/Analytics';
import LoadingIndicator from '../components/GameplanLoadingIndicator'
import { connect } from 'react-redux'
import { setLastChatViewTime } from '../store'
import UserProfilePopup from '../components/UserProfilePopup'
import AsyncStorage from '@react-native-async-storage/async-storage';
import StylerInstance from '../managers/BaseStyler';
import { createStartDM, handleDMClick } from '../managers/UtilsManager';
import Popup from '../components/Popup';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';



const SHOWN_FAQ_STRING = "shownFaqPopupAlready";
class ChatScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedImage: null,
      messages: [],
      event: null,
      timer: null,
      interval: null,
      subscription: null,
      shownError: false,
      loaded: false,
      eventId: null,
      chatId: null,
      refreshData: null,
      data: null,
      firstLoad: true,
      loadingEarlier: false,
      showCalendarPopup: false,
      page: 1,
      showSheet: false
    }
    this.draftedMessage = null;
    this.shouldPoll = true;
    this.userAPI = new UserAPI()
    this.commentAPI = new CommentAPI()
    this.didBlurSubscription = null;
    this.showPopupAlready = null;
  }




  async componentDidMount() {
    const comments = this.props.route.params.comments || null;
    const chatId = this.props.route.params.chatId || null;
    const eventId = this.props.route.params.eventId || null;
    this.showPopupAlready = await AsyncStorage.getItem(SHOWN_FAQ_STRING);
    this.handleChatProps(chatId, eventId)
  }

  componentDidUpdate(prevProps, prevState) {
    // if (this.state.chatId !== prevState.chatId && !this.state.firstLoad) {
    //   this.clearDeps();
    //   this.setState({messages: []}, () => this.handleChatProps(this.state.chatId, this.state.eventId))
    // }
  }

  handleChatProps(chatId, eventId) {
    AnalyticsManager.logEvent(events.USER_JOINED_CHAT)

    this.setState({ eventId: eventId, chatId: chatId })
    const intervalId = setInterval(() => this.getChatMessages(chatId, eventId, true), 5000)
    const didFocusSubscription = this.props.navigation.addListener(
      'focus', payload => {
        this.shouldPoll = true;
        this.getChatMessages(chatId, eventId)
      }
    )

    const didBlurSubscription = this.props.navigation.addListener(
      'blur', payload => {
        this.shouldPoll = false;
      }
    )

    this.didBlurSubscription = didBlurSubscription;
    this.props.navigation.setOptions({ headerRight: () => this.getHeaderRight() })
    const event = this.props.route.params.event || null;

    if (chatId !== null) {
      //TODO: Get chats
      this.getChatMessages(chatId, eventId)
    }

    this.setState({ event: event, interval: intervalId, subscription: didFocusSubscription, firstLoad: false })
  }

  async updateEventSetting(shouldMute) {
    const eventSetting = this.props.route.params.eventSetting || null;

    if (eventSetting == null) {
      return
    }

    var data = null

    if (eventSetting.notify_new_comment == true && shouldMute) {
      data = { notify_new_comment: false }
    } else if (eventSetting.notify_new_comment == false && !shouldMute) {
      data = { notify_new_comment: true }
    }

    if (data != null) {
      const resp = await this.userAPI.updateEventSetting(eventSetting.id, data)
      if (resp && resp.code !== -1) {
        Alert.alert("Success", "Chat has been updated")
      } else {
        Alert.alert("Sorry",
          "We couldn't mute the chat. Try again later")
      }
    }
  }

  getHeaderRight() {
    const eventSetting = this.props.route.params.eventSetting || null;

    if (eventSetting == null) {
      return null
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconButton icon={<Icon as={Ionicons} variant={"link"} name='ellipsis-vertical-outline' />} onPress={() => this.setState({ showActionSheet: true })} />
        <MaterialIcons.Button name='account-supervisor' size={30} color={'#00A3A3'} backgroundColor={StylerInstance.getBackgroundColor()} underlayColor={'#00A3A3'} onPress={() => { this.props.navigation.navigate('UserList') }} />
      </View>
    )
  }

  onSuccessCallback(data, onSuccess = null) {
    // console.log(data)
    this.setState({ refreshData: data })

    if (data.results) {
      data.results.forEach(
        (comment) => {
          const message = this.commentToMessage(comment)
          // console.log("MESSAGES CONVERTED")
          const prevMessageIds = this.state.messages.map(x => x._id)
          // console.log("PREVIOUS MESSAGES LOOKED AT")
          if (!prevMessageIds.includes(message._id)) {

            if (this.state.messages.length > 0 && message.createdAt > this.state.messages[0].createdAt) {
              this.setState(previousState => ({
                messages: GiftedChat.append(previousState.messages, message)
              }))
            } else {
              this.setState(previousState => ({
                messages: GiftedChat.prepend(previousState.messages, message)
              }))
            }
          }
          // console.log("FINISHED SETTING NEW COMMENTS")
        })
    }

    this.setState({ loaded: true })
    console.log("finished LOADING")
    if (onSuccess !== null) {
      onSuccess()
    }
  }

  onErrorCallback(error, onFail = null) {
    console.log("GOING TO ERROR")
    console.log(error)
    if (this.state.shownError == false) {
      Alert.alert("Something went wrong",
        "Unable to load comments. Try again later")
      this.setState({ shownError: true, loaded: true })
    }

    if (onFail !== null) {
      onFail()
    }
  }

  async getChatMessages(chatId = null, eventId = null, polling = false) {
    if (polling && !this.shouldPoll) {
      return null;
    }
    console.log(`chat id is ${chatId}`)
    console.log(`event id is ${eventId}`)
    const chatData = await this.commentAPI.getCommentsV2({ eventId: eventId, chatId: chatId });
    // console.log('chatData', chatData)
    if (chatData && chatData.code !== -1) {
      this.onSuccessCallback(chatData, null);
    } else {
      this.onErrorCallback({ message: "something went wrong" }, onFail);
    }

  }

  clearDeps() {
    clearInterval(this.state.interval)
    const sub = this.state.subscription
    if (sub && typeof sub === "function") {
      sub();
    }
    const blurSub = this.didBlurSubscription;
    if (blurSub && typeof blurSub === "function") {
      blurSub();
    }
  }

  componentWillUnmount() {
    console.log("Chat unmounting")
    clearInterval(this.state.interval)
    const sub = this.state.subscription
    if (sub && typeof sub === "function") {
      sub();
    }

    // Send messages to listener.
    const comments = this.convertMessagesToComments()
    const param = this.props.route.params.handleMessages || null;
    if (param != null) {
      if (this.state.eventId !== null) {
        param(comments, this.state.eventId)
      }

      if (this.state.chatId !== null) {
        param(comments, null, this.state.chatId)
      }

    }

    const lastViewedTime = new Date()
    console.log(`Setting last chat view time to be ${lastViewedTime}`)
    this.props.dispatch(setLastChatViewTime(lastViewedTime))
  }

  commentToMessage(comment) {
    var avatar = null
    if (comment.creator.profile_image != null) {
      avatar = comment.creator.profile_image.image
    } else if (comment.creator.image_url) {
      avatar = comment.creator.image_url
    }

    const message = {
      _id: comment.id,
      text: comment.value,
      createdAt: comment.created_at,
      user: {
        _id: comment.creator.id,
        name: comment.creator.username,
        avatar: avatar,
        allow_dm: comment.creator.allow_dm,
        is_staff: comment.creator.is_staff
      },
      comment: comment
    }
    return message
  }

  convertMessagesToComments() {
    const messages = this.state.messages
    return messages.map(x => this.convertMessageToComment(x))
  }

  convertMessageToComment(message) {
    var profileImage = null
    if (message.user.avatar != null) {
      profileImage = { image: message.user.avatar }
    }

    return {
      id: message._id,
      value: message.text,
      created_at: message.createdAt,
      creator: {
        id: message.user._id,
        username: message.user.name,
        profile_image: profileImage
      }
    }
  }


  convertCommentsToMessages(comments) {
    var messageArr = []
    context = this
    comments.forEach(function (comment) {
      message = context.commentToMessage(comment)
      messageArr.push(message)
    })
    return messageArr
  }

  async onSend(messages = []) {
    AnalyticsManager.logEvent(events.USER_COMMENTED, { chatId: this.state.chatId, eventId: this.state.eventId });
    const commentValue = messages[0].text
    if (commentValue.includes("?") && !this.showPopupAlready) {
      // await AsyncStorage.setItem("shownFaqPopupAlready", true);
      this.setState({ showCalendarPopup: true });
      this.draftedMessage = commentValue;
      return;
    }
    const comment = {
      value: messages[0].text,
      creator: MainUser.getUserId(),
      event: this.state.eventId,
      chat: this.state.chatId
    }
    const chatData = await this.commentAPI.createComment(comment);
    if (chatData && chatData.code !== -1) {
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, this.commentToMessage(chatData))
      }))
    } else {
      Alert.alert(
        "Connection Error",
        "Message couldn't be sent. Try again later."
      )
    }
  }

  renderInputToolbar(props) {
    if (isIphoneX()) {
      return (
        <SafeAreaView style={{ backgroundColor: StylerInstance.getBackgroundColor() }}>
          <InputToolbar {...props} containerStyle={{ backgroundColor: StylerInstance.getBackgroundColor() }}
            renderComposer={props1 => (<Composer {...props1} textInputStyle={{ color: StylerInstance.getOutlineColor() }} />)} />
        </SafeAreaView>
      )
    }

    return (
      <InputToolbar {...props} containerStyle={{ backgroundColor: StylerInstance.getBackgroundColor() }}
        renderComposer={props1 => (<Composer {...props1} textInputStyle={{ color: StylerInstance.getOutlineColor() }} />)}
      />
    );
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }

  async onLoadEarlier() {
    const page = this.state.page + 1
    this.setState({ page: page, loadingEarlier: true })
    const chatData = await this.commentAPI.getCommentsV2({ eventId: this.state.eventId, chatId: this.state.chatId, page: page });
    if (chatData && chatData.code !== -1) {
      this.setState({ loadingEarlier: false, data: chatData })
      this.setState(previousState => ({
        messages: GiftedChat.prepend(previousState.messages, this.convertCommentsToMessages(chatData.results))
      }))
    } else {
      Alert.alert("Failed to load earlier comments!. Try again later")
    }
  }

  getCanLoadEarlier() {
    if (this.state.data == null) {
      return this.state.refreshData && this.state.refreshData.next !== null
    } else {
      return this.state.data.next !== null
    }
  }


  renderMessage(props) {
    const currentMessage = props.currentMessage
    const nextMessage = props.nextMessage;
    const empty = this.isEmpty(nextMessage)
    // console.log(nextMessage)
    if (empty && isIphoneX()) {
      return (
        <View pr={2} pl={2}>
          <CommentCell message={currentMessage}
            showTimestamp={this.props.config && this.props.config.chat_timestamp_enabled}
            onUserImageClick={(user) => this.setState({ popUser: user })} />
          <View style={{ height: 50, backgroundColor: StylerInstance.getBackgroundColor() }}></View>
        </View>
      )
    }
    return (<CommentCell message={currentMessage}
      showTimestamp={this.props.config && this.props.config.chat_timestamp_enabled}
      onUserImageClick={(user) => this.setState({ popUser: user })} />)
  }

  async startDM(user) {
    const result = await createStartDM(user);
    if (result) {
      this.setState({ popUser: null, chatId: null, eventId: null });
      this.props.navigation.push('Chat', { chatId: result.chat_id });
    } else {
      Alert.alert("Fail to start direct message. Please try again later");
    }
  }

  async handleDM(user) {
    const result = await handleDMClick(user);
    if (result.data) {
      this.setState({ popUser: null, chatId: null, eventId: null });
      this.props.navigation.push('Chat', { chatId: result.data.chat_id });
    } else {
      if (result.type !== "cancel") {
        Alert.alert("Fail to start direct message. Please try again later");
      }
    }
  }

  handlePopupShown() {
    this.showPopupAlready = true;
    AnalyticsManager.logEvent(events.CHAT_FAQ_SHOWN);
    AsyncStorage.setItem(SHOWN_FAQ_STRING, "true");
  }


  async pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      // You have the selected image in the 'result' object.
      // You can now send it in the chat.
      // For example, you can send it as a message using the 'onSend' function.
      // this.onSendImage([{ text: '', image: result.assets }]);
      this.setState({ selectedImage: result.assets[0].uri });
      console.log('!!!!!!!!!!!!!', result.assets[0].uri)

    }
  }


  async captureImage() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    if (status !== 'granted') {
      console.log('Camera permission denied');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      // You have the selected image in the 'result' object.
      // You can now send it in the chat or use it as needed.
      // For example, you can set it in the component's state and display it.
      this.setState({ selectedImage: result.uri });
      console.log('Image URI:', result.uri);
    }
  }



  renderFooter = () => {

    if (this.state.selectedImage) {
      return (
        <View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderColor: '#808080', borderWidth: 0.3, borderRadius: 10, }}>

            <Image
              source={{ uri: this.state.selectedImage }}
              style={{ width: 100, height: 100 }}
            />
            <TouchableOpacity style={{ height: 54, right: 7, position: 'absolute', }} onPress={() => { this.setState({ selectedImage: '' }) }}>
              <MaterialIcons name='close-circle' size={24} color={'#808080'} />
            </TouchableOpacity>

            <IconButton style={{ height: 24, alignSelf: 'center' }}
              icon={<Icon as={Ionicons} variant={"link"} name='send' />}
              onPress={() => this.onSendImage(this.state.selectedImage)}
            />
          </View>
        </View>
      );
    } else {
      return
      // return (
      //   <IconButton
      //     icon={<Icon as={Ionicons} variant={"link"} name='camera' />}
      //     onPress={() => this.pickImage()}
      //   />
      // );
    }
  }



  // async onSendImage(messages) {
  //   const message = messages;

  //   if (message) {

  //     const imageUri = message;
  //     console.log('%$%$%$%$%$%%$%', imageUri);
  //     console.log('%$%$%$%$%$%%$%', imageUri);

  //     // const imageUrl = 'https://example.com/uploaded-image.jpg';
  //     // const imageMessage = {
  //     //   text: imageUri,
  //     //   user: {
  //     //     value: MainUser.getUserId(),
  //     //   },
  //     // };

  //     const imageMessage = {
  //       value: message,
  //       creator: MainUser.getUserId(),
  //       event: this.state.eventId,
  //       chat: this.state.chatId
  //     }



  //     const chatData = await this.commentAPI.createComment(imageMessage);
  //     if (chatData && chatData.code !== -1) {
  //       this.setState(previousState => ({
  //         messages: GiftedChat.append(previousState.messages, this.commentToMessage(chatData))
  //       }));
  //       this.setState({ selectedImage: '' })
  //     } else {
  //       Alert.alert(
  //         "Connection Error",
  //         "Message couldn't be sent. Try again later."
  //       )
  //     }


  //   } else {
  //     // Handle text messages
  //     // Your existing text message handling logic here
  //   }
  // }


  async onSendImage(imageUri) {
    const imageMessage = {
      value: imageUri,
      creator: MainUser.getUserId(),
      event: this.state.eventId,
      chat: this.state.chatId,
    };

    const chatData = await this.commentAPI.createComment(imageMessage);
    if (chatData && chatData.code !== -1) {
      const imageMessage = this.commentToMessage(chatData);
      this.setState((previousState) => ({
        messages: GiftedChat.append(previousState.messages, imageMessage),
        selectedImage: '',
      }));
    } else {
      Alert.alert(
        "Connection Error",
        "Message couldn't be sent. Try again later."
      );
    }
  }

















  render() {
    if (this.state.messages.length == 0 && this.state.loaded == false) {
      return (<LoadingIndicator />)
    }
    return (
      <View style={{ flex: 1, backgroundColor: StylerInstance.getBackgroundColor() }}>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          renderMessage={this.renderMessage.bind(this)}
          renderInputToolbar={this.renderInputToolbar}
          loadEarlier={this.getCanLoadEarlier()}
          onLoadEarlier={() => this.onLoadEarlier()}
          isLoadingEarlier={this.state.loadingEarlier}
          renderActions={() => (
            <IconButton style={{ left: 10, alignSelf: 'center' }}
              icon={<Icon as={Ionicons} variant={"link"} name='camera' />}
              onPress={() => { this.setState({ showSheet: true }) }}
            />
          )}
          renderFooter={this.renderFooter}
        //renderBubble={}
        />

        <UserProfilePopup
          user={this.state.popUser}
          onDoneClicked={() => this.setState({ popUser: null })}
          onDirectMessage={(user) => this.handleDM(user)}
        />

        <Popup centeredContent visible={this.state.showCalendarPopup} onExit={() => this.setState({ showCalendarPopup: false })}>
          <Heading style={{ color: StylerInstance.getOutlineColor(), textAlign: 'center', marginBottom: 10 }}>Asking about events?</Heading>

          <Text style={{ color: StylerInstance.getOutlineColor(), textAlign: 'center', padding: 10 }}>
            Please check the event calendar first before asking. 99% of questions about what's going on or coming up can be answered by looking at the calendar.</Text>

          <View style={{ textAlign: 'center', marginTop: 20 }}>
            <Button onPress={() => {
              this.handlePopupShown();
              this.setState({ showCalendarPopup: false })
              this.props.navigation.navigate("Events")
            }}>
              <Text>Take me to the calendar</Text>
            </Button>
          </View>

          <View style={{ textAlign: 'center', marginTop: 20 }}>
            <Button danger onPress={() => {
              this.handlePopupShown();
              this.setState({ showCalendarPopup: false })
            }}>
              <Text>Got it</Text>
            </Button>
          </View>
        </Popup>

        <Actionsheet isOpen={this.state.showActionSheet} onClose={() => this.setState({ showActionSheet: false })}>
          <Actionsheet.Content>
            <Actionsheet.Item onPress={() => this.props.route.params.eventSetting != null && this.props.route.params.eventSetting.event !== null && this.props.navigation.push("Event", {
              "event": this.state.event
            })}>View event</Actionsheet.Item>
            <Actionsheet.Item onPress={() => this.updateEventSetting(true)}>Mute chat</Actionsheet.Item>
            <Actionsheet.Item onPress={() => this.updateEventSetting(false)} >Unmute chat</Actionsheet.Item>
            <Actionsheet.Item onPress={() => this.setState({ showActionSheet: false })}>Cancel</Actionsheet.Item>
          </Actionsheet.Content>

        </Actionsheet>





        <Actionsheet isOpen={this.state.showSheet} onClose={() => this.setState({ showSheet: false })} >
          <Actionsheet.Content>
            <Actionsheet.Item style={{ alignSelf: 'center', alignItems: 'center' }} onPress={() => this.captureImage()}>Camera</Actionsheet.Item>
            <Actionsheet.Item style={{ alignSelf: 'center', alignItems: 'center' }} onPress={() => this.pickImage()} >Gallery</Actionsheet.Item>

          </Actionsheet.Content>
        </Actionsheet>

      </View>
    )
  }
}

const mapStateToProps = (state) => {
  const { user, lastChatViewTime, config } = state
  return { user, lastChatViewTime, config }
}

export default connect(mapStateToProps)(ChatScreen)

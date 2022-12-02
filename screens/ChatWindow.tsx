import * as React from "react";
import {
  StyleSheet,
  SafeAreaView,
  Keyboard,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  Dimensions,
  Platform,
  View,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useState, useEffect, useRef, useCallback } from "react";
import { ButtonBanner } from "../components/ButtonBanner";
import Constants from "expo-constants";
// import * as Notifications from "expo-notifications";
import Modal from "react-native-modal";
import PurpleButton from "../components/PurpleButton";
import { DetailPullUpHeader } from "../components/GetStartedPullUp";
import SellerMeetingDetailModal from "../components/MeetingDetailModal";
import SellerSyncModal from "../components/SellerSyncModal";
import BuyerSyncModal from "../components/BuyerSyncModal";
import CalendarNotification from "../assets/svg-components/calendarNotification";
import {
  Bubble,
  GiftedChat,
  IMessage,
  Message,
  MessageText,
} from "react-native-gifted-chat";
import { NegotiationModal } from "../components/NegotiationModal";
import { AntDesign } from "@expo/vector-icons";
import { AvailabilityModal } from "../components/AvailabilityMatch";
import { AvailabilityBubble } from "../components/AvailabilityBubble";
// LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
// LogBox.ignoreAllLogs();
import { ImageEditor } from "expo-image-editor";

import * as ImagePicker from "expo-image-picker";
import { pressedOpacity } from "../constants/Values";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { auth, chatRef, db, historyRef } from "../config/firebase";
import ProductCard from "../components/ProductCard";
import BackButton from "../assets/svg-components/back_button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import moment from "moment";
import { fonts } from "../globalStyle/globalFont";
import BuyerProposeModal from "../components/BuyerProposeModal";
export default function ChatWindow({ navigation, route }) {
  const {
    email,
    name,
    receiverImage,
    post,
    isBuyer,
    screen,
    isConfirmed,
    isProposed,
  } = route.params;
  //console.log(post);
  const [text, setText] = useState("");
  const [height, setHeight] = useState(40);
  const [modalVisibility, setModalVisibility] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [availabilityVisible, setAvailabilityVisible] = useState(false);
  const [isSendingAvailability, setIsSendingAvailability] = useState(false);
  const [inputSchedule, setInputSchedule] = useState([]);
  const [scheduleCallback, setScheduleCallback] = useState([]);
  const [isBubble, setIsBubble] = useState(false);
  const [count, setCount] = useState(0);
  const [uri, setUri] = useState("");
  const [meetingVisible, setMeetingVisible] = useState(false);
  const [syncMeetingVisible, setSyncMeetingVisible] = useState(false);
  const [proposeMeetingVisible, setProposeMeetingVisible] = useState(false);

  const [mCount, setmCount] = useState(screen === "product" ? 0 : 1);
  const [selectTime, setSelectedTime] = useState("");
  const [messages, setMessages] = React.useState<any[]>([]);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  useEffect(() => {
    setSyncMeetingVisible(true);
    console.log("here");
  }, [selectTime]);
  const triggerNotifications = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Check out these items! ",
        body: "You got 5 items related to your request.",
      },
      trigger: { seconds: 2 },
    });
  };
  // const [notification, setNotification] = useState(false);
  // const notificationListener = useRef();
  // useEffect(() => {
  //   notificationListener.current =
  //     Notifications.addNotificationReceivedListener((notification) => {
  //       setNotification(notification);
  //     });

  //   return () => {
  //     Notifications.removeNotificationSubscription(
  //       notificationListener.current
  //     );
  //   };
  // }, []);
  useEffect(() => {
    if (isSendingAvailability && text.length > 0) {
      console.log(text);
      setPlaceholder(text);
      setText("");
    }
  }, [text, isSendingAvailability]);

  const onSend = useCallback((messages: any[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
    const { _id, text, availability, image, product, createdAt, user } =
      messages[0];
    var recentMessage = "";
    if (text.length > 0) {
      recentMessage = text;
    } else if (availability[0] != undefined) {
      recentMessage = "[Availability]";
    } else if (product.title != undefined) {
      recentMessage = "[Product: " + product.title + "]";
    } else if (image != "") {
      recentMessage = "[Image]";
    }

    historyRef
      .doc(isBuyer ? auth?.currentUser?.email : email)
      .collection("sellers")
      .doc(isBuyer ? email : auth?.currentUser?.email)
      .set({
        item: post,
        recentMessage: recentMessage,
        recentSender: auth?.currentUser?.email,
        name: isBuyer ? name : auth?.currentUser?.displayName,
        image: isBuyer ? receiverImage : auth?.currentUser?.photoURL,
        viewed: isBuyer,
        isConfirmed: isConfirmed == undefined ? false : isConfirmed,
        isProposed: isProposed == undefined ? false : isProposed,
      });
    historyRef
      .doc(isBuyer ? email : auth?.currentUser?.email)
      .collection("buyers")
      .doc(isBuyer ? auth?.currentUser?.email : email)
      .set({
        item: post,
        recentMessage: recentMessage,
        recentSender: auth?.currentUser?.email,
        name: isBuyer ? auth?.currentUser?.displayName : name,
        image: isBuyer ? auth?.currentUser?.photoURL : receiverImage,
        viewed: !isBuyer,
        isConfirmed: isConfirmed == undefined ? false : isConfirmed,
        isProposed: isProposed == undefined ? false : isProposed,
      });
    const messageRef = chatRef
      .doc(isBuyer ? auth?.currentUser?.email : email)
      .collection(isBuyer ? email : auth?.currentUser?.email);

    messageRef.add({
      _id,
      text,
      availability,
      image,
      product,
      createdAt,
      user,
    });
  }, []);
  function renderMessage(props) {
    const {
      currentMessage: { text: currText },
    } = props;
    return (
      <Message
        {...props}
        containerStyle={{
          left: { marginVertical: 10 },
        }}
      />
    );
  }
  const [availabilityUsername, setAvailabilityUserName] = useState("");

  function renderBubble(props) {
    const { currentMessage } = props;
    const { text: currText } = currentMessage;
    const { availability: currAvailability } = currentMessage;
    const { user: currUser } = currentMessage;
    const { image: currImage } = currentMessage;

    const { product: currPost } = currentMessage;
    if (currText.length > 0) {
      return (
        <View style={{ marginVertical: 5 }}>
          <Bubble
            {...props}
            wrapperStyle={{
              left: {
                backgroundColor: "#ECECEC",
                borderRadius: 12,
                paddingVertical: 5,
                maxWidth: "80%",
                marginLeft: 5,
              },
              right: {
                backgroundColor: "#9E70F6",
                borderRadius: 12,
                borderTopRightRadius: 12,
                paddingVertical: 5,
                maxWidth: "80%",
                marginRight: 5,
              },
            }}
            textStyle={{
              left: [
                {
                  color: "#000000",
                },
                fonts.body2,
              ],
              right: [
                {
                  color: "#ffffff",
                  margin: 0,
                },
                fonts.body2,
              ],
            }}
            timeTextStyle={{
              left: {
                color: "gray",
              },
              right: {
                color: "white",
              },
            }}
          />
        </View>
      );
    } else if (currAvailability[0] != undefined) {
      return (
        <View style={{ width: "70%", marginVertical: 5 }}>
          <AvailabilityBubble
            userName={
              currUser._id == auth?.currentUser?.email
                ? auth?.currentUser?.displayName
                : name
            }
            setAvailabilityUserName={setAvailabilityUserName}
            setIsBubble={setIsBubble}
            setAvailabilityVisible={setAvailabilityVisible}
            setInputSchedule={setInputSchedule}
            schedule={currAvailability}
          />
        </View>
      );
    } else if (currPost.title != undefined) {
      return (
        <View style={{ width: "50%", marginVertical: 5 }}>
          <ProductCard
            title={currPost.title}
            price={currPost.price}
            image={currPost.images ? post.images[0] : null}
          />
        </View>
      );
    } else if (currImage != "") {
      return (
        <View
          style={[
            { width: "50%", marginHorizontal: 10, marginVertical: 5 },
            currUser._id != auth?.currentUser?.email
              ? { alignItems: "flex-end" }
              : { alignItems: "flex-start" },
          ]}
        >
          <Image
            source={{ uri: currImage }}
            style={{
              width: "100%",
              minHeight: 200,
              resizeMode: "cover",
              marginHorizontal: 10,
            }}
          />
        </View>
      );
    }
  }

  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // quality: 0.5,
      // allowsEditing: true,
      // aspect: [3, 4],
    });
    if (!result.cancelled) {
      // console.log(result);
      setUri(result["uri"]);
      setModalVisibility(true);
    }
  };
  const saveandcompress = async (uri, props) => {
    const manipResult = await manipulateAsync(uri, [], {
      compress: 0.5,
      format: SaveFormat.JPEG,
      base64: true,
    });
    setUri("");
    postImage("data:image/jpeg;base64," + manipResult["base64"], props);
  };

  const postProduct = (props) => {
    props.onSend({
      _id: new Date().valueOf(),
      text: "",
      availability: {},
      image: "",
      product: post,
      createdAt: new Date(),
      user: {
        _id: email,
        name: name,
        avatar: receiverImage,
      },
    });
  };
  const storePermission = async () => {
    try {
      await AsyncStorage.setItem("PhotoPermission", "true");
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    AsyncStorage.getItem("PhotoPermission", (errs, result) => {
      if (!errs) {
        if (result == null) {
          (async () => {
            if (Platform.OS !== "web") {
              const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== "granted") {
                alert("Sorry, we need gallary permissions to make this work!");
              } else {
                storePermission();
              }
            }
          })();
        }
      }
    });
  }, []);

  const postImage = (image, props) => {
    const Json = JSON.stringify({
      imageBase64: image,
    });
    //console.log(Jzzzson);
    fetch("https://resell-dev.cornellappdev.com/api/image/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: Json,
    })
      .then(function (response) {
        // alert(JSON.stringify(response));
        if (!response.ok) {
          let error = new Error(response.statusText);
          throw error;
        } else {
          return response.json();
        }
      })
      .then(async function (data) {
        if (mCount == 0) {
          setmCount(1);
          postProduct(props);
        }

        props.onSend({
          _id: new Date().valueOf(),
          text: "",
          availability: {},
          image: data.image,
          product: {},
          createdAt: new Date(),
          user: {
            _id: email,
            name: name,
            avatar: receiverImage,
          },
        });
      })
      .catch((error) => {
        //alert(error.message);
      });
  };

  useEffect(() => {
    if (ref.current != null) {
      ref.current.resetInputToolbar();
    }
  }, [height]);
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    const unsubscribe = chatRef
      .doc(isBuyer ? auth?.currentUser?.email : email)
      .collection(isBuyer ? email : auth?.currentUser.email)
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            _id: doc.data()._id,
            text: doc.data().text,
            availability: doc.data().availability,
            product: doc.data().product,
            image: doc.data().image,
            createdAt: doc.data().createdAt.toDate(),
            user: doc.data().user,
          }))
        );
      });
    return () => unsubscribe();
  }, []);
  function renderInputToolbar(props) {
    return (
      <SafeAreaView>
        {uri != "" && (
          <ImageEditor
            visible={modalVisibility}
            onCloseEditor={() => {
              setModalVisibility(false);
              setUri("");
            }}
            imageUri={uri}
            minimumCropDimensions={{
              width: 100,
              height: 100,
            }}
            onEditingComplete={(result) => {
              saveandcompress(result.uri, props);
            }}
            mode="full"
          />
        )}

        <ButtonBanner
          count={count}
          setCount={setCount}
          data={FILTER}
          isBuyer={isBuyer}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          availabilityVisible={availabilityVisible}
          setAvailabilityVisible={setAvailabilityVisible}
          setIsBubble={setIsBubble}
          alwaysColor={true}
          OthersEmail={isBuyer ? auth?.currentUser?.email : email}
        />

        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <TouchableOpacity
            style={{
              marginLeft: 15,
              marginBottom: 12,
            }}
            onPress={() => pickImage()}
          >
            <AntDesign name="picture" size={25} color="#707070" />
          </TouchableOpacity>

          <SafeAreaView
            style={[
              styles.input,
              {
                flexDirection: "row",
              },
              isSendingAvailability
                ? { alignItems: "flex-start" }
                : { alignItems: "flex-end" },
              { height: Math.min(Math.max(40, height), 140) },
            ]}
          >
            {!isSendingAvailability && (
              <TextInput
                style={[
                  {
                    width: "90%",
                    paddingHorizontal: 10,
                    height: "100%",
                    lineHeight: 20,
                    minHeight: 20,
                    color: "#000000",
                    paddingTop: 10,
                    paddingBottom: 10,
                    textAlignVertical: "top",
                  },
                  fonts.body2,
                ]}
                onChangeText={(t) => {
                  if (!isSendingAvailability) {
                    setText(t);
                  }
                }}
                value={text}
                onContentSizeChange={(event) => {
                  setHeight(event.nativeEvent.contentSize.height);
                }}
                multiline={true}
              />
            )}
            {isSendingAvailability && (
              <View
                style={{
                  width: "90%",
                  marginStart: 12,
                  marginVertical: 10,
                  alignItems: "flex-start",
                  backgroundColor: "transparent",
                  flexDirection: "column",
                }}
              >
                <AvailabilityBubble
                  userName={auth?.currentUser?.displayName}
                  setIsBubble={null}
                  setAvailabilityVisible={null}
                  setInputSchedule={null}
                  schedule={null}
                  setAvailabilityUserName={null}
                />
                <TextInput
                  style={[
                    {
                      paddingHorizontal: 10,
                      color: "#000000",
                      marginTop: 10,
                      width: "95%",
                      height: Math.min(height - 80, 60),
                    },
                    fonts.body2,
                  ]}
                  autoCorrect={false}
                  multiline={true}
                  onKeyPress={({ nativeEvent }) => {
                    if (
                      nativeEvent.key === "Backspace" &&
                      placeholder.length == 0
                    ) {
                      setIsSendingAvailability(false);
                      setScheduleCallback([]);
                    }
                  }}
                  onContentSizeChange={(event) => {
                    setHeight(event.nativeEvent.contentSize.height + 80);
                  }}
                  value={placeholder}
                  onChangeText={(t) => {
                    setPlaceholder(t);
                  }}
                />
              </View>
            )}

            <View />
            {(text.trim().length != 0 || isSendingAvailability) && (
              <TouchableOpacity
                style={{
                  marginRight: 10,
                  marginLeft: "auto",
                  marginTop: "auto",
                  marginBottom: 10,
                  zIndex: 10,
                }}
                onPress={() => {
                  setHeight(40);
                  if (mCount == 0) {
                    setmCount(1);
                    postProduct(props);
                  }

                  if (text.length > 0 && text.trim().length > 0) {
                    props.onSend(
                      {
                        _id: new Date().valueOf(),
                        text: text,
                        availability: {},
                        image: "",
                        product: {},
                        createdAt: new Date(),
                        user: {
                          _id: email,
                          name: name,
                          avatar: receiverImage,
                        },
                      },

                      true
                    );
                    setText("");
                    setTimeout(() => {
                      if (ref.current != null) {
                        ref.current.scrollToBottom();
                      }
                    }, 100);
                  } else if (isSendingAvailability) {
                    setText(placeholder);
                    setPlaceholder("");
                    setIsSendingAvailability(false);
                    if (scheduleCallback) {
                      props.onSend(
                        {
                          _id: new Date().valueOf(),
                          text: text,
                          availability: scheduleCallback,
                          image: "",
                          product: {},
                          createdAt: new Date(),
                          user: {
                            _id: email,
                            name: name,
                            avatar: receiverImage,
                          },
                        },
                        true
                      );
                      setScheduleCallback([]);
                    }
                  }
                }}
              >
                <FontAwesome5
                  name="arrow-circle-up"
                  size={25}
                  color="#9E70F6"
                />
              </TouchableOpacity>
            )}
          </SafeAreaView>
        </View>
        <NegotiationModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          text={text}
          setText={setText}
          setHeight={setHeight}
          screen={isBuyer ? "ChatBuyer" : "ChatSeller"}
          post={post}
        />
        <AvailabilityModal
          bubbleInput={inputSchedule}
          setScheduleCallback={setScheduleCallback}
          availabilityVisible={availabilityVisible}
          setAvailabilityVisible={setAvailabilityVisible}
          setIsSendingAvailability={setIsSendingAvailability}
          isBubble={isBubble}
          setIsBubble={setIsBubble}
          setHeight={setHeight}
          username={availabilityUsername}
          isBuyer={isBuyer}
          setSelectedTime={setSelectedTime}
        />
      </SafeAreaView>
    );
  }

  const ref = useRef<GiftedChat<any> | null>(null);

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        padding: 0,
        flex: 1,
        justifyContent: "flex-start",
      }}
    >
      <View
        style={{
          width: "100%",
          paddingTop: Platform.OS === "ios" ? 35 : 0,
          paddingBottom: Platform.OS === "ios" ? 10 : 0,
          height: Platform.OS === "ios" ? 90 : 70,
          borderBottomWidth: 1,
          borderColor: "#D6D6D6",
          elevation: 8,
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BackButton color="black" />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Text
            style={[fonts.Title1, { marginBottom: 4, textAlign: "center" }]}
          >
            {post.title}
          </Text>
          <Text
            style={[fonts.Title3, { color: "#787878", textAlign: "center" }]}
          >
            {name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={async () => {
            await triggerNotifications();
          }}
          style={styles.scheduleButton}
        >
          {/* <Feather name="calendar" size={24} color="black" /> */}
          {/* <Image
            source={require("../assets/images/calendarWithNotification.png")}
          /> */}
          <CalendarNotification />
        </TouchableOpacity>
      </View>

      <GiftedChat
        {...{ messages, onSend }}
        user={{
          _id: auth?.currentUser?.email,
          name: auth?.currentUser?.displayName,
          avatar: auth?.currentUser?.photoURL,
        }}
        showAvatarForEveryMessage={true}
        listViewProps={{
          keyboardDismissMode: "on-drag",
        }}
        ref={(chat) => (ref.current = chat)}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        minInputToolbarHeight={80 + Math.min(Math.max(40, height), 140)}
        renderMessage={renderMessage}
        scrollToBottom={true}
      />

      {/*TODO: SEND NAME AND PROPOSED DATE */}
      {/* seller modal */}

      <SellerMeetingDetailModal
        meetingVisible={meetingVisible}
        setMeetingVisible={setMeetingVisible}
        text={
          isBuyer
            ? name
            : auth?.currentUser?.name + " has proposed the following meeting:"
        }
        dateText={moment(selectTime).format("MMMM Do YYYY, h:mm a")}
        setSyncMeetingVisible={setSyncMeetingVisible}
        isBuyer={isBuyer}
        email={email}
        isProposed={isProposed}
      />

      {!isBuyer && isProposed && (
        <SellerSyncModal
          syncMeetingVisible={syncMeetingVisible}
          setSyncMeetingVisible={setSyncMeetingVisible}
          eventTitle={"Meet " + name + " for Resell"}
        />
      )}

      {isBuyer && (
        <BuyerSyncModal
          syncMeetingVisible={syncMeetingVisible}
          setSyncMeetingVisible={setSyncMeetingVisible}
          eventTitle={"Meet " + name + " for Resell"}
          text={name + " has confirmed the following meeting:"}
          dateText={selectTime}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: "85%",
    margin: 12,
    backgroundColor: "#F4F4F4",
    borderRadius: 15,
    marginTop: 0,
  },

  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 25,
    left: 10,
    zIndex: 1,
    width: 50,
    height: 50,
    alignItems: "center",
  },
  scheduleButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 25,
    right: 10,
    zIndex: 1,
    width: 50,
    height: 50,
    alignItems: "center",
  },
  slideUp: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: 320,
    backgroundColor: "#ffffff",
    width: "100%",
    marginHorizontal: 0,
    alignItems: "center",
    padding: 30,
    paddingLeft: 50,
    paddingRight: 50,
  },
});
const FILTER = [
  {
    id: 0,
    title: "Negotiate",
  },
  {
    id: 1,
    title: "Send Availablity",
  },
  { id: 2, title: "Pay with Venmo" },
  // { id: 3, title: "Ask For Refund" },
];

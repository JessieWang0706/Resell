import {
  StyleSheet,
  Text,
  FlatList,
  Image,
  View,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { IMessagePreview } from "../data/struct";
// LogBox.ignoreLogs(["Setting a timer for a long period of time"]);

// import { firestore } from "../config/firebase";

// const userCollection = firestore.collection("users");

// LogBox.ignoreLogs(["Warning: ..."]); // Ignore log notification by message
// LogBox.ignoreAllLogs();
import ChatTbas from "../components/ChatTabs";
import { auth, chatRef, db, historyRef } from "../config/firebase";
import { fonts } from "../globalStyle/globalFont";

export default function ChatScreen({ navigation }) {
  const [isPurchase, setIsPurchase] = useState(true);
  var temptPuchrase = 0;
  var temptOrder = 0;
  const [purchase, setPurchase] = useState<IMessagePreview[]>([]);
  const [offer, setOffer] = useState<IMessagePreview[]>([]);

  const getPurchase = async () => {
    setPurchase([]);
    const query = historyRef
      .doc(auth?.currentUser?.email)
      .collection("sellers");

    try {
      query.onSnapshot((querySnapshot) => {
        var tempt: IMessagePreview[] = [];
        querySnapshot.docs.forEach((doc) => {
          tempt.push({
            sellerName: doc.data().name,
            email: doc.id,

            recentItem: doc.data().item,
            image: doc.data().image,
            recentMessage: doc.data().recentMessage,
            recentSender:
              doc.data().recentSender == auth?.currentUser?.email ? 1 : 0,
            viewed: doc.data().viewed,
            isProposed: doc.data().isProposed,
            isConfirmed: doc.data().isConfirmed,
          });
        });
        setPurchase(tempt);
      });
    } catch (e) {
      console.log("Error getting user: ", e);
    }
  };
  const getOffer = async () => {
    setOffer([]);

    const query = historyRef.doc(auth?.currentUser?.email).collection("buyers");

    try {
      query.onSnapshot((querySnapshot) => {
        var tempt: IMessagePreview[] = [];

        querySnapshot.docs.forEach((doc) => {
          tempt.push({
            sellerName: doc.data().name,
            recentItem: doc.data().item,
            email: doc.id,
            image: doc.data().image,
            recentMessage: doc.data().recentMessage,
            recentSender:
              doc.data().recentSender == auth?.currentUser?.email ? 1 : 0,
            viewed: doc.data().viewed,
            isProposed: doc.data().isProposed,
            isConfirmed: doc.data().isConfirmed,
          });
        });
        setOffer(tempt);
      });
    } catch (e) {
      console.log("Error getting user: ", e);
    }
  };
  useEffect(() => {
    getPurchase();
    getOffer();
  }, []);
  purchase.forEach((element) => {
    if (!element.viewed) {
      temptPuchrase = temptPuchrase + 1;
    }
  });

  offer.forEach((element) => {
    if (!element.viewed) {
      temptOrder = temptOrder + 1;
    }
  });
  const [purchaseUnread, setPurchaseUnread] = useState(0);
  useEffect(() => {
    setPurchaseUnread(temptPuchrase);
  }, [temptPuchrase]);

  const [offerUnread, setOfferUnread] = useState(temptOrder);
  useEffect(() => {
    setOfferUnread(temptOrder);
  }, [temptOrder]);

  const renderItem = ({ item }) => {
    var products = " • " + item.recentItem.title;

    var message = item.recentSender == 1 ? "You: " : item.sellerName + ": ";

    message = message + item.recentMessage;

    return (
      <TouchableOpacity
        onPress={() => {
          //Changed viewed of data here.
          if (isPurchase) {
            historyRef
              .doc(auth?.currentUser?.email)
              .collection("sellers")
              .doc(item.email)
              .update({ viewed: true });
          } else {
            historyRef
              .doc(auth?.currentUser?.email)
              .collection("buyers")
              .doc(item.email)
              .update({ viewed: true });
          }
          navigation.navigate("ChatWindow", {
            name: item.sellerName,
            receiverImage: item.image,
            email: item.email,
            post: item.recentItem,
            isBuyer: isPurchase,
            isProposed: item.isProposed,
            isConfirmed: item.isConfirmed,
            screen: "chat",
          });
        }}
      >
        <View style={styles.outer}>
          {!item.viewed && <View style={styles.viewedDot} />}
          <Image
            style={[
              styles.image,
              (isPurchase && purchaseUnread != 0) ||
              (!isPurchase && offerUnread != 0)
                ? { marginStart: 24 }
                : { marginStart: 12 },
            ]}
            source={{ uri: item.image }}
            resizeMode={"cover"}
          />
          <View style={styles.inner}>
            <Text numberOfLines={1} style={styles.items}>
              <Text style={styles.sellerName}>{item.sellerName}</Text>
              {products}
            </Text>
            <Text
              numberOfLines={1}
              style={[fonts.Title4, { color: "#707070" }]}
            >
              {message}
            </Text>
          </View>
          <View style={{ marginHorizontal: 8 }}>
            <Feather name="chevron-right" size={24} color="#B3B3B3" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ backgroundColor: "#ffffff", height: "100%" }}>
      <ChatTbas
        isPurchase={isPurchase}
        setIsPurchase={setIsPurchase}
        purchaseUnread={purchaseUnread}
        offerUnread={offerUnread}
      />
      {purchase.length != 0 && isPurchase && (
        <FlatList
          data={purchase}
          renderItem={renderItem}
          keyboardShouldPersistTaps="always"
        />
      )}
      {offer.length != 0 && !isPurchase && (
        <FlatList
          data={offer}
          renderItem={renderItem}
          keyboardShouldPersistTaps="always"
        />
      )}
      {purchase.length == 0 && isPurchase && (
        <View style={styles.noResultView}>
          <Text style={[fonts.pageHeading2, { marginBottom: 8 }]}>
            No messages with sellers yet
          </Text>
          <Text style={[fonts.body1, { color: "#707070", width: "80%" }]}>
            When you contact a seller, you’ll see your messages here
          </Text>
        </View>
      )}
      {offer.length == 0 && !isPurchase && (
        <View style={styles.noResultView}>
          <Text style={[fonts.pageHeading2, { marginBottom: 8 }]}>
            No messages with buyers yet
          </Text>
          <Text
            style={[
              fonts.body1,
              { color: "#707070", width: "80%", textAlign: "center" },
            ]}
          >
            When a buyer contacts you, you’ll see their messages here
          </Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  outer: {
    marginStart: 12,
    marginTop: 12,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inner: {
    width: "65%",
    marginStart: 12,

    flexDirection: "column",
    justifyContent: "space-around",
  },

  viewedDot: {
    position: "absolute",
    left: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#9E70F6",
  },
  sellerName: {
    fontFamily: "Rubik-Bold",
    fontSize: 16,
    color: "#000000",
  },
  items: {
    fontFamily: "Rubik-Medium",
    fontSize: 16,
    color: "#707070",
    marginBottom: 8,
  },
  image: { width: 45, height: 45, borderRadius: 75 },
  noResultView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
import React, { useState, useEffect } from "react";
import Modal from "react-native-modal";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Platform,
  Alert,
} from "react-native";
import PurpleButton from "./PurpleButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Calendar from "expo-calendar";
import { auth, historyRef } from "../config/firebase";
export default function BuyerProposeModal({
  syncMeetingVisible,
  setSyncMeetingVisible,
  eventTitle,
  text,
  isBuyer,
  sellerEmail,
  dateText,
}) {
  return (
    <Modal //Confirm Meeting details
      isVisible={syncMeetingVisible}
      backdropOpacity={0.2}
      onBackdropPress={() => {
        setSyncMeetingVisible(false);
      }}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <View style={styles.slideUp}>
        <Text style={styles.MeetingDetailsBoldText}>Meeting Details</Text>
        <View style={styles.MeetingDetails}>
          <Text style={styles.SubMeetingDetails}>{text}</Text>

          <Text style={styles.MeetingDetailsBoldText}>Time</Text>
          <Text style={styles.SubMeetingDetails}>{dateText}</Text>
        </View>
        <View style={styles.purpleButton}>
          <PurpleButton
            text={"Propose Meeing"}
            onPress={() => {
              (async () => {
                const { status } =
                  await Calendar.requestCalendarPermissionsAsync();
                if (status === "granted") {
                  setSyncMeetingVisible(false);
                  //   historyRef
                  //     .doc(sellerEmail)
                  //     .collection("buyers")
                  //     .doc( auth?.currentUser?.email )
                  //     .set({
                  //       item: post,
                  //       recentMessage: recentMessage,
                  //       recentSender: auth?.currentUser?.email,
                  //       name: isBuyer ? auth?.currentUser?.displayName : name,
                  //       image: isBuyer
                  //         ? auth?.currentUser?.photoURL
                  //         : receiverImage,
                  //       viewed: !isBuyer,
                  //       isConfirmed:
                  //         isConfirmed == undefined ? false : isConfirmed,
                  //       isProposed: isProposed == undefined ? false : isProposed,
                  //     });
                } else {
                  Alert.alert("permission not granted");
                }
              })();
            }}
            enabled={true}
          />
        </View>
        <Text
          style={styles.MeetingDetailsBoldText}
          onPress={() => {
            setSyncMeetingVisible(false);
          }}
        >
          Cancel
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  purpleButton: {
    marginBottom: 18,
  },
  MeetingDetailsBoldText: {
    fontFamily: "Rubik-Medium",
    fontSize: 17,
  },

  SubMeetingDetails: {
    fontFamily: "Rubik-Regular",
    fontSize: 16,
    marginBottom: 16,
  },
  MeetingDetails: {
    flex: 5,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 20,
  },
});

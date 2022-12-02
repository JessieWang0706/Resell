// this is the general layout for the button that allows users to contact seller
// this is actually purple in color ;)
import React from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import CalendarNotification from "../assets/svg-components/calendarNotification";
import { fonts } from "../globalStyle/globalFont";

export default function noticeBanner({ sellerName, onPress }) {
  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        <CalendarNotification width={17} height={17} />

        <Text style={fonts.Title4}>
          {sellerName + "has confirmed the meeting"}
        </Text>
      </View>
      <TouchableOpacity onPress={onPress}>
        <Text style={[fonts.Title3, { color: "#9E70F6" }]}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#9E70F6",
    padding: "3%",
    paddingRight: 40,
    paddingLeft: 40,
    borderRadius: 30,
    shadowOffset: { width: 3, height: 3 },
  },

  buttonText: {
    color: "white",
    fontFamily: "Rubik-Medium",
    fontSize: 16,
    textAlign: "center",
  },
});

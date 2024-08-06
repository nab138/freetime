import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { MeetData, Race } from "@/structures";

Font.register({
  family: "Times",
  src: "/Times-Roman.ttf",
  fontWeight: "normal",
  fontStyle: "normal",
});
Font.register({
  family: "Times",
  src: "/Times-Bold.ttf",
  fontWeight: "bold",
  fontStyle: "normal",
});

const styles = StyleSheet.create({
  page: {
    padding: 15,
  },
  header: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "Times",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 6,
    borderTopWidth: 1.5,
    borderTopColor: "#000",
    borderTopStyle: "solid",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    textAlign: "center",
    fontSize: 12,
    paddingTop: 3,
    fontFamily: "Times",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    margin: "10px 0",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableRowHeader: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  tableColHeader: {
    padding: 0,
  },
  tableCol: {
    padding: 0,
  },
  tableCell: {
    fontSize: 12,
    fontFamily: "Times",
  },
  groupName: {
    fontSize: 12,
    fontFamily: "Times",
    fontWeight: "bold",
  },
  colPlace: {
    flex: 0.5,
  },
  colName: {
    flex: 5,
  },
  colAge: {
    flex: 1,
  },
  colBib: {
    flex: 1,
  },
  colMIPace: {
    flex: 2,
  },
  colTime: {
    flex: 2,
  },
  floatingBold: {
    fontFamily: "Times",
    fontWeight: "bold",
    fontSize: 12,
  },
  floatingNormal: {
    fontFamily: "Times",
    fontSize: 12,
  },
  floatingBoldRight: {
    fontFamily: "Times",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "right",
  },
  floatingNormalRight: {
    fontFamily: "Times",
    fontSize: 12,
    textAlign: "right",
  },
});

const ResultsDocument = ({
  meet,
  race,
  distance,
  groups,
  resultsName,
}: {
  meet: MeetData;
  race: Race;
  distance: number;
  resultsName: string;
  groups: {
    name: string;
    data: {
      time: number;
      place: number;
      bib: number;
      name: string;
      age: number;
      gender: string;
      team: string;
    }[];
  }[];
}) => {
  let showingGender =
    meet.roster[0].gender !== "" &&
    meet.roster[0].gender !== "?" &&
    meet.roster[0].gender !== undefined;
  let showingAge =
    meet.roster[0].age !== -1 &&
    meet.roster[0].age !== undefined &&
    !isNaN(meet.roster[0].age);

  if (!showingGender && resultsName === "Overall" && groups.length > 0) {
    groups = [groups[groups.length - 1]];
  }

  console.log(groups);

  return (
    <Document>
      <Page style={styles.page}>
        <View
          style={{
            position: "absolute",
            top: 15,
            left: 15,
          }}
        >
          <Text style={styles.floatingBold}>FreeTime</Text>
          <Text style={styles.floatingNormal}>by Flusche & Sharp Timing</Text>
        </View>
        <View
          style={{
            position: "absolute",
            top: 15,
            right: 15,
          }}
        >
          <Text style={styles.floatingBoldRight}>
            {new Date().toLocaleDateString()}
          </Text>
          <Text style={styles.floatingNormalRight}>
            {new Date().toLocaleString("en-US", { weekday: "long" })}
          </Text>
        </View>
        <Text style={styles.header}>{meet.name}</Text>
        <Text style={styles.section}>
          Event #{meet.races.indexOf(race.code) + 1} {race.name} - {resultsName}{" "}
          Results
        </Text>
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <View style={[styles.tableColHeader, styles.colPlace]}>
              <Text style={styles.groupName}></Text>
            </View>
            <View style={[styles.tableColHeader, styles.colName]}>
              <Text style={styles.groupName}>Name</Text>
            </View>
            {showingGender && (
              <View style={[styles.tableColHeader, styles.colAge]}>
                <Text style={styles.groupName}>Gender</Text>
              </View>
            )}
            {showingAge && (
              <View style={[styles.tableColHeader, styles.colAge]}>
                <Text style={styles.groupName}>Age</Text>
              </View>
            )}
            <View style={[styles.tableColHeader, styles.colBib]}>
              <Text style={styles.groupName}>Bib</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colMIPace]}>
              <Text style={styles.groupName}>MI Pace</Text>
            </View>
            <View style={[styles.tableColHeader, styles.colTime]}>
              <Text style={styles.groupName}>Time</Text>
            </View>
          </View>
          {groups.map((group) => (
            <View key={group.name}>
              <Text style={styles.groupName}>{group.name}</Text>
              {group.data.map((athlete, index) => {
                let timeDifference = athlete.time - (race.startTime ?? -1);
                return (
                  <View key={index} style={styles.tableRow}>
                    <View style={[styles.tableCol, styles.colPlace]}>
                      <Text style={styles.tableCell}>{athlete.place}</Text>
                    </View>
                    <View style={[styles.tableCol, styles.colName]}>
                      <Text style={styles.tableCell}>{athlete.name}</Text>
                    </View>
                    {showingGender && (
                      <View style={[styles.tableCol, styles.colAge]}>
                        <Text style={styles.tableCell}>{athlete.gender}</Text>
                      </View>
                    )}
                    {showingAge && (
                      <View style={[styles.tableCol, styles.colAge]}>
                        <Text style={styles.tableCell}>{athlete.age}</Text>
                      </View>
                    )}
                    <View style={[styles.tableCol, styles.colBib]}>
                      <Text style={styles.tableCell}>{athlete.bib}</Text>
                    </View>
                    <View style={[styles.tableCol, styles.colMIPace]}>
                      <Text style={styles.tableCell}>
                        {formatTime(timeDifference / distance, false, true)}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.colTime]}>
                      <Text style={styles.tableCell}>
                        {formatTime(timeDifference, true)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default ResultsDocument;

function formatTime(
  time: number,
  subSeconds: boolean = false,
  hideZero: boolean = false
): string {
  const totalSeconds = Math.floor(time / 1000);
  const milliseconds = time % 1000;

  // Extract hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format hours, minutes, and seconds to be two digits
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  if (subSeconds) {
    const formattedMilliseconds = String(
      Math.floor(milliseconds / 10)
    ).padStart(2, "0");
    return `${
      hours !== 0 || !hideZero ? formattedHours + ":" : ""
    }${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
  }

  return `${
    hours !== 0 || !hideZero ? formattedHours + ":" : ""
  }${formattedMinutes}:${formattedSeconds}`;
}

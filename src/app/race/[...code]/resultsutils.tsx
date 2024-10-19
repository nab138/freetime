import { AgeRange } from "./AgeRanges";

export type GroupsMode = "Overall" | "Age" | "Mixed";
export type FinisherData = {
  time: number;
  place: number;
  bib: number;
  name: string;
  age: number;
  gender: string;
  team: string;
};
export type Group = {
  name: string;
  data: FinisherData[];
};

export function calculateGroups(
  data: FinisherData[],
  ageRanges: AgeRange[] | null,
  mode: GroupsMode = "Overall"
): Group[] {
  let topThreeMale = data
    .filter((finisher) => finisher.gender === "M")
    .slice(0, 3);
  let topThreeFemale = data
    .filter((finisher) => finisher.gender === "F")
    .slice(0, 3);
  if (mode === "Overall") {
    let topThree = data.slice(0, 3);
    return [
      { name: "Top 3 Overall", data: topThree },
      { name: "Top 3 Male", data: topThreeMale },
      { name: "Top 3 Female", data: topThreeFemale },
      { name: "All Participants", data },
    ];
  } else if (ageRanges !== null) {
    let groups: { name: string; data: typeof data }[] = [];
    let ageRangeData = data.filter(
      (athlete) =>
        !topThreeMale.find((a) => a.bib === athlete.bib) &&
        !topThreeFemale.find((a) => a.bib === athlete.bib)
    );
    ageRanges.forEach((range) => {
      let rangeData = ageRangeData.filter(
        (athlete) => athlete.age >= range[0] && athlete.age <= range[1]
      );
      if (rangeData.length === 0) return;
      let male = rangeData.filter((athlete) => athlete.gender === "M");
      if (male.length > 0) {
        groups.push({
          name: `Male ${range[0]} - ${range[1]}`,
          data: male,
        });
      }
      let female = rangeData.filter((athlete) => athlete.gender === "F");
      if (female.length > 0) {
        groups.push({
          name: `Female ${range[0]} - ${range[1]}`,
          data: female,
        });
      }
    });
    if (mode === "Mixed") {
      if (topThreeMale.length > 0)
        groups.unshift({ name: "Top 3 Male", data: topThreeMale });
      if (topThreeFemale.length > 0)
        groups.unshift({ name: "Top 3 Female", data: topThreeFemale });
    }
    return groups;
  } else {
    throw new Error("Invalid group calculation mode");
  }
}

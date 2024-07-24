"use client";

import { Athlete, MeetData } from "@/structures";
import styles from "./meet.module.css";
import ClientButton from "@/components/ClientButton";
import {
  addAthletesToMeetRoster,
  addAthleteToMeetRoster,
  clearRoster,
} from "./actions";
import { toast } from "sonner";
import { ChangeEventHandler, useRef } from "react";

export default function RosterTable({ meet }: { meet: MeetData }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  const handleFileSelect: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (file) {
      file.text().then((text) => {
        let lines = text.split("\n");
        lines.shift();
        let athletes: Athlete[] = [];
        for (let lineNum in lines) {
          let line = lines[lineNum];
          let [first, last, grade, team, gender, bib] = line.split(",");
          if (first && last && grade && bib) {
            let name = `${first} ${last}`;
            let age = parseInt(grade);
            let bibNum = parseInt(bib);
            if (isNaN(age) || isNaN(bibNum)) {
              toast.error("Invalid .csv file, unable to parse line " + lineNum);
              return;
            }
            athletes.push({ bib: bibNum, name, age });
          }
        }
        (async () => {
          let result = await addAthletesToMeetRoster(meet.code, athletes);
          if (result && result.error) {
            toast.error(result.error);
          } else {
            window.location.reload();
          }
        })();
      });
    }
  };

  return (
    <div>
      <div className={styles.tableContainer}>
        <table border={1} className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age/Grade</th>
              <th>Bib</th>
            </tr>
          </thead>
          <tbody>
            {meet.roster.map((athlete) => (
              <tr key={athlete.bib + athlete.name}>
                <td>{athlete.name}</td>
                <td>{athlete.age}</td>
                <td>{athlete.bib}</td>
              </tr>
            ))}

            <tr>
              <td>
                <input type="text" id="name" placeholder="Name" required />
              </td>
              <td>
                <input type="text" id="age" placeholder="Age/Grade" required />
              </td>
              <td>
                <input type="text" id="bib" placeholder="Bib" required />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={styles.rosterButtons}>
        <ClientButton
          onClick={async () => {
            let bib = parseInt(
              (document.getElementById("bib") as HTMLInputElement).value
            );
            let name = (document.getElementById("name") as HTMLInputElement)
              .value;
            let age = parseInt(
              (document.getElementById("age") as HTMLInputElement).value
            );
            if (isNaN(bib) || isNaN(age) || name === "") {
              toast.error("Please fill out all fields correctly.");
              return;
            }
            let result = await addAthleteToMeetRoster(
              meet.code,
              bib,
              name,
              age
            );
            if (result && result.error) {
              toast.error(result.error);
            } else {
              window.location.reload();
            }
          }}
        >
          Add Athlete
        </ClientButton>
        <ClientButton onClick={triggerFileInput}>Import .csv</ClientButton>
        <ClientButton
          onClick={async () => {
            let result = await clearRoster(meet.code);
            if (result && result.error) {
              toast.error(result.error);
            } else {
              window.location.reload();
            }
          }}
        >
          Clear Roster
        </ClientButton>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept=".csv"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}

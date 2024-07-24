"use client";

import { Athlete, MeetData } from "@/structures";
import styles from "./meet.module.css";
import ClientButton from "@/components/ClientButton";
import {
  addAthletesToMeetRoster,
  addAthleteToMeetRoster,
  clearRoster,
  deleteStudentFromMeet,
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
            athletes.push({ bib: bibNum, name, age, gender, team });
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
              <th>Bib</th>
              <th>Gender</th>
              <th>Age/Grade</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {meet.roster.map((athlete, i) => (
              <tr key={i}>
                <td>
                  <ClientButton
                    className={styles.delete}
                    onClick={async () => {
                      await deleteStudentFromMeet(meet, i);
                      window.location.reload();
                    }}
                  >
                    🗑
                  </ClientButton>
                  {athlete.name}
                </td>
                <td>{athlete.bib}</td>
                <td>{athlete.gender}</td>
                <td>{athlete.age}</td>
                <td>{athlete.team}</td>
              </tr>
            ))}

            <tr>
              <td>
                <input type="text" id="name" placeholder="Name" required />
              </td>
              <td>
                <input
                  type="text"
                  id="bib"
                  placeholder="Bib"
                  required
                  style={{ width: "80px" }}
                />
              </td>
              <td>
                <input
                  style={{ width: "80px" }}
                  type="text"
                  id="gender"
                  placeholder="Gender"
                  required
                />
              </td>
              <td>
                <input
                  style={{ width: "80px" }}
                  type="text"
                  id="age"
                  placeholder="Age/Grade"
                  required
                />
              </td>
              <td>
                <input type="text" id="team" placeholder="Team" required />
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
            let gender = (document.getElementById("gender") as HTMLInputElement)
              .value;
            let team = (document.getElementById("team") as HTMLInputElement)
              .value;
            if (isNaN(bib) || isNaN(age) || name === "") {
              toast.error("Please fill out all fields correctly.");
              return;
            }
            let result = await addAthleteToMeetRoster(
              meet.code,
              bib,
              name,
              age,
              gender,
              team
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
            let delModal = document.getElementById("clearModal");
            if (delModal) {
              delModal.style.display = "flex";
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
        <div className={styles.modalContainer} id="clearModal">
          <div className={styles.modal}>
            <h2 style={{ color: "#e8554a" }}>Are you sure?</h2>
            <p style={{ marginTop: "10px", marginBottom: "20px" }}>
              Clearing your roster is an irreversable, destructive action.
            </p>
            <div className={styles.rosterButtons}>
              <ClientButton
                style={{
                  backgroundColor: "#e8554a",
                  color: "white",
                }}
                onClick={async () => {
                  let result = await clearRoster(meet.code);
                  if (result && result.error) {
                    toast.error(result.error);
                  } else {
                    window.location.reload();
                  }
                }}
              >
                Delete
              </ClientButton>
              <ClientButton
                onClick={function (): void {
                  let delModal = document.getElementById("clearModal");
                  if (delModal) {
                    delModal.style.display = "none";
                  }
                }}
              >
                Cancel
              </ClientButton>
            </div>
          </div>
        </div>
      </div>
      <p style={{ marginTop: "10px", marginBottom: 0, color: "#aaa" }}>
        CSVs are expected to be in this format with the first line as a header:
      </p>
      <p style={{ marginBottom: 0, color: "#aaa", fontSize: "0.9em" }}>
        First Name, Last Name, Grade/Age, Team, Gender, Bib
      </p>
    </div>
  );
}

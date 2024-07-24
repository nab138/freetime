"use client";

import { MeetData } from "@/structures";
import styles from "./meet.module.css";
import ClientButton from "@/components/ClientButton";
import { addAthleteToMeetRoster } from "./actions";
import { toast } from "sonner";

export default function RosterTable({ meet }: { meet: MeetData }) {
  return (
    <div>
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
            <tr>
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
          let result = await addAthleteToMeetRoster(meet.code, bib, name, age);
          if (result && result.error) {
            toast.error(result.error);
          } else {
            window.location.reload();
          }
        }}
      >
        Add Athlete
      </ClientButton>
    </div>
  );
}

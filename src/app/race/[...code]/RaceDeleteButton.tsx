"use client";

import ClientButton from "@/components/ClientButton";
import styles from "./race.module.css";
import { MeetData } from "@/structures";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteRace } from "./actions";

export default function DeleteButton({
  meet,
  raceCode,
}: {
  meet: MeetData;
  raceCode: string;
}) {
  const router = useRouter();
  return (
    <div>
      <ClientButton
        style={{
          backgroundColor: "#e8554a",
          color: "white",
        }}
        onClick={function (): void {
          let delModal = document.getElementById("deleteModal");
          if (delModal) {
            delModal.style.display = "flex";
          }
        }}
      >
        Delete
      </ClientButton>
      <div className={"modalContainer"} id="deleteModal">
        <div className={"modal"}>
          <h2 style={{ color: "#e8554a" }}>Are you sure?</h2>
          <p style={{ marginTop: "10px", marginBottom: "20px" }}>
            Deleting your race is an irreversable, destructive action.
          </p>
          <div className={styles.buttons}>
            <ClientButton
              style={{
                backgroundColor: "#e8554a",
                color: "white",
              }}
              onClick={async () => {
                let result = await deleteRace(raceCode, meet);
                if (result && result.error) {
                  toast.error(result.error);
                } else {
                  router.push("/meet/" + meet.code);
                  router.refresh();
                }
              }}
            >
              Delete
            </ClientButton>
            <ClientButton
              onClick={function (): void {
                let delModal = document.getElementById("deleteModal");
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
  );
}

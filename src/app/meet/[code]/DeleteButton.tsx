"use client";
import ClientButton from "@/components/ClientButton";
import styles from "./meet.module.css";
import { MeetData } from "@/structures";
import { deleteMeet } from "./actions";
import { useRouter } from "next/navigation";

export default function DeleteButton({ meet }: { meet: MeetData }) {
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
            Deleting your meet is an irreversable, destructive action.
          </p>
          <div className={styles.rosterButtons}>
            <ClientButton
              style={{
                backgroundColor: "#e8554a",
                color: "white",
              }}
              onClick={async () => {
                await deleteMeet(meet);
                router.push("/dashboard");
                router.refresh();
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

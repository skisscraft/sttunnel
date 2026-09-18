import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Troubleshoot" };

export default function TroubleshootPage() {
  return (
    <ComingSoon
      title="Troubleshoot"
      blurb="Guided fault-finding is planned for a later phase. The current material does not contain a diagnostic knowledge base, so there is no troubleshooting logic in this version."
      bullets={[
        "Symptom → likely cause → check → fix flows for common machine faults",
        "Links back to the relevant manual pages and drawings",
        "Requires a maintained fault catalogue as a content source",
      ]}
    />
  );
}
